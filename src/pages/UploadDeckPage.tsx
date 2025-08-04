import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useUserFlow } from '../contexts/UserFlowContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { ClipLoader } from 'react-spinners';
import { Building } from 'lucide-react';
import PitchDeckUploader from '../components/PitchDeckUploader.tsx';

const UploadDeckPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { refreshSteps } = useUserFlow();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isFetchingCompany, setIsFetchingCompany] = useState(true);
  const [error, setError] = useState('');

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
          .maybeSingle();

        if (error) throw error;
        if (data) setCompanyId(data.id);
        
      } catch (err: any) {
        setError('Could not fetch company details. Please try again.');
        console.error(err);
      } finally {
        setIsFetchingCompany(false);
      }
    };

    fetchCompany();
  }, [user]);

  const handleUploadSuccess = () => {
    refreshSteps();
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  if (isFetchingCompany) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {!companyId ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Building className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Onboarding Incomplete</h2>
            <p className="text-slate-300 mb-6">
              Please complete your company profile before uploading a pitch deck.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/onboarding')}
              className="btn-primary"
            >
              Go to Onboarding
            </motion.button>
          </div>
        ) : (
          <PitchDeckUploader
            companyId={companyId}
            onUploadSuccess={handleUploadSuccess}
          />
        )}

        {error && (
          <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
        )}
      </motion.div>
    </div>
  );
};

export default UploadDeckPage;
