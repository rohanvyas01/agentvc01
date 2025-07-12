import React, { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { ClipLoader } from 'react-spinners';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Building,
  ArrowLeft,
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
        <motion.div
          className="glass rounded-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ClipLoader color="#6366f1" size={32} className="mx-auto mb-4" />
          <p className="text-white">Loading company details...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-4">Upload Your Pitch Deck</h1>
        <p className="text-xl text-white/80">
          Present your deck for AI-powered analysis and practice.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass rounded-2xl border border-slate-700/30 p-8"
      >
        {!companyId && !isFetchingCompany && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center"
            >
                <Building className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h4 className="font-semibold text-yellow-300">Onboarding Incomplete</h4>
                <p className="text-sm text-yellow-200">
                    Please complete your company profile before uploading a pitch deck.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/onboarding')}
                  className="mt-3 btn-primary text-sm"
                >
                    Go to Onboarding
                </motion.button>
            </motion.div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragActive ? 'border-indigo-400 bg-indigo-500/10' :
            !companyId ? 'border-slate-600 bg-slate-800/30 cursor-not-allowed' :
            'border-slate-600 hover:border-indigo-400 hover:bg-indigo-500/10 cursor-pointer'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            {uploading ? (
              <motion.div
                className="mx-auto"
              >
                <ClipLoader color="#6366f1" size={48} />
              </motion.div>
            ) : (
              <Upload className="w-12 h-12 text-slate-400 mx-auto" />
            )}
            <h3 className="text-lg font-semibold text-white">
              {uploading ? 'Analyzing Deck...' : 'Drag & drop your PDF here'}
            </h3>
            {!uploading && (
              <p className="text-slate-400">
                or{' '}
                <button
                  type="button"
                  onClick={open}
                  disabled={!companyId}
                  className="text-indigo-400 font-medium hover:underline disabled:text-slate-500 disabled:no-underline"
                >
                  browse files
                </button>{' '}
                to upload
              </p>
            )}
          </div>
        </div>
        
        {acceptedFile && !success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 glass-dark p-4 rounded-lg flex items-center justify-between"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <p className="text-sm text-white truncate">{acceptedFile.name}</p>
                </div>
                {!uploading && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={removeFile}
                      className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </motion.button>
                )}
            </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-300">{success}</p>
            </div>
          </motion.div>
        )}

        {acceptedFile && !success && (
            <div className="mt-8">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {uploading ? (
                      <>
                        <ClipLoader color="#ffffff" size={20} />
                        <span>Uploading & Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span>Upload and Analyze</span>
                      </>
                    )}
                </motion.button>
            </div>
        )}

      </motion.div>
    </div>
  );
};

export default UploadDeckPage;
