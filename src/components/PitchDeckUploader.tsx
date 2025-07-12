import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, X, Loader, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.ts'; // Using path alias for robustness

interface PitchDeckUploaderProps {
  companyId: string;
  onUploadSuccess: () => void; // Callback to notify the parent component
}

const PitchDeckUploader: React.FC<PitchDeckUploaderProps> = ({ companyId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setUploadSuccess(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setUploadSuccess(false);
    }
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };

  const handleUpload = async () => {
    if (!file || !companyId) {
      setError('Missing file or company information.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Could not get user session. Please refresh and try again.');
      }
      const user = session.user;
      const fileName = `${user.id}/${companyId}/${Date.now()}_${file.name}`;

      // 1. Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pitchdecks') // Your storage bucket name
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // 2. Create a record in the 'pitches' table AND get it back
      const { data: newPitchRecord, error: dbError } = await supabase
        .from('pitches')
        .insert({
          company_id: companyId,
          pitch_deck_storage_path: uploadData.path,
          status: 'processing', // Set initial status
        })
        .select() // Ask Supabase to return the newly created row
        .single(); // Expect only one row

      if (dbError) throw dbError;
      if (!newPitchRecord) throw new Error("Failed to create pitch record in database.");

      // *** THIS IS THE FIX: Invoke the Edge Function ***
      console.log('Invoking pitch-deck-processor function with record:', newPitchRecord);
      const { error: invokeError } = await supabase.functions.invoke('pdf-text-extractor', {
        body: { record: newPitchRecord },
      });

      if (invokeError) {
        // If invoking fails, we should try to update the status to 'failed'
        await supabase.from('pitches').update({ status: 'failed' }).eq('id', newPitchRecord.id);
        throw new Error(`Processing failed to start: ${invokeError.message}`);
      }
      
      setUploadSuccess(true);
      onUploadSuccess(); // Notify parent component

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setUploadSuccess(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Upload Your Pitch Deck</h2>
      <p className="text-slate-400 mb-6">Upload your deck as a PDF to begin the analysis.</p>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300
          ${isDragging ? 'border-indigo-500 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'}`}
      >
        <UploadCloud className="mx-auto h-12 w-12 text-slate-500 mb-4" />
        <p className="text-white font-semibold">Drag & drop your PDF here</p>
        <p className="text-slate-400 text-sm mt-1">or</p>
        <label htmlFor="file-upload" className="relative cursor-pointer text-indigo-400 hover:text-indigo-300 font-medium mt-2 inline-block">
          <span>Browse for a file</span>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
        </label>
        <p className="text-xs text-slate-500 mt-4">Max file size: 10MB</p>
      </div>

      {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

      {file && !uploadSuccess && (
        <div className="mt-6 bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileText className="h-6 w-6 text-indigo-400 flex-shrink-0" />
            <span className="text-white text-sm font-medium truncate">{file.name}</span>
          </div>
          {!isUploading && (
            <button onClick={removeFile} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      
      {uploadSuccess && (
         <div className="mt-6 bg-green-500/10 border border-green-500/30 text-green-300 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-6 w-6 flex-shrink-0" />
            <div className="overflow-hidden">
                <p className="font-semibold">Upload Successful!</p>
                <p className="text-sm truncate">Analysis has started. You can check the status on your dashboard.</p>
            </div>
         </div>
      )}

      <div className="mt-8">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading || uploadSuccess}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold 
            hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isUploading ? <Loader className="animate-spin h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
          {isUploading ? 'Uploading...' : uploadSuccess ? 'Done!' : 'Upload & Analyze'}
        </button>
      </div>
    </div>
  );
};

export default PitchDeckUploader;
