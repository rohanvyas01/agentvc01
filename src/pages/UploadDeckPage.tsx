import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Building,
} from 'lucide-react';

const UploadDeckPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isFetchingCompany, setIsFetchingCompany] = useState(true);
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null);

  // Fetch the user's company ID when the component loads
  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) {
        setIsFetchingCompany(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error;
        }

        if (data) {
          setCompanyId(data.id);
        }
      } catch (err: any) {
        setError('Could not fetch company details. Please try again.');
        console.error(err);
      } finally {
        setIsFetchingCompany(false);
      }
    };

    fetchCompany();
  }, [user]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError('');
    setSuccess('');
    setAcceptedFile(null);

    if (fileRejections.length > 0) {
        setError('File rejected. Please ensure it is a PDF and under 10MB.');
        return;
    }
    
    if (acceptedFiles.length > 0) {
        setAcceptedFile(acceptedFiles[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!acceptedFile || !user) return;

    if (!companyId) {
      setError('You must complete your company profile before uploading a deck.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: functionError } = await supabase.functions.invoke('pitch-deck-processor', {
        body: acceptedFile,
        headers: {
          'x-file-name': acceptedFile.name,
          'x-file-type': acceptedFile.type,
          'x-company-id': companyId,
        },
      });

      if (functionError) {
        throw new Error(functionError.message || 'An unknown error occurred during processing.');
      }
      
      if (data.error) {
         throw new Error(data.error);
      }

      setSuccess('Pitch deck uploaded and processed successfully!');
      setAcceptedFile(null); // Clear the file after successful upload
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to upload and process pitch deck');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading || isFetchingCompany || !companyId,
  });
  
  const removeFile = () => {
      setAcceptedFile(null);
      setError('');
  }

  if (isFetchingCompany) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Pitch Deck</h1>
        <p className="text-xl text-gray-600">
          Present your deck for AI-powered analysis and practice.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {!companyId && !isFetchingCompany && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <Building className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold text-yellow-800">Onboarding Incomplete</h4>
                <p className="text-sm text-yellow-700">
                    Please complete your company profile before uploading a pitch deck.
                </p>
                <button onClick={() => navigate('/onboarding')} className="mt-3 text-sm font-bold text-yellow-800 hover:underline">
                    Go to Onboarding
                </button>
            </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragActive ? 'border-indigo-400 bg-indigo-50' :
            !companyId ? 'border-gray-300 bg-gray-100 cursor-not-allowed' :
            'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            {uploading ? (
              <Loader className="w-12 h-12 text-indigo-600 mx-auto animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {uploading ? 'Analyzing Deck...' : 'Drag & drop your PDF here'}
            </h3>
            {!uploading && <p className="text-gray-600">or <button type="button" onClick={open} disabled={!companyId} className="text-indigo-600 font-medium hover:underline disabled:text-gray-400 disabled:no-underline">browse files</button> to upload</p>}
          </div>
        </div>
        
        {acceptedFile && !success && (
            <div className="mt-6 bg-gray-50 p-3 rounded-lg flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <p className="text-sm text-gray-800 truncate">{acceptedFile.name}</p>
                </div>
                {!uploading && (
                    <button onClick={removeFile} className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {acceptedFile && !success && (
            <div className="mt-8">
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {uploading ? <Loader className="animate-spin h-5 w-5" /> : <Upload className="h-5 w-5" />}
                    {uploading ? 'Uploading & Analyzing...' : 'Upload and Analyze'}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default UploadDeckPage;
