import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import PitchDeckUploader from '../components/PitchDeckUploader.tsx';
import TavusIntroduction from '../components/TavusIntroduction.tsx';
import { Loader, FileText, Clock, CheckCircle, AlertCircle, Eye, BarChart3 } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [pitchDecks, setPitchDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTavusIntro, setShowTavusIntro] = useState(false);

  // Using useCallback to memoize the fetch function
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [companyRes, profileRes] = await Promise.all([
        supabase.from('companies').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      ]);

      if (companyRes.error) throw companyRes.error;
      if (profileRes.error) throw profileRes.error;

      if (!companyRes.data) {
        navigate('/onboarding');
        return;
      }
      if (!profileRes.data) {
        navigate('/onboarding');
        return;
      }
      
      setCompany(companyRes.data);
      setProfile(profileRes.data);
      
      // Fetch pitch decks after we have company data
      if (companyRes.data) {
        const { data: pitchData, error: pitchError } = await supabase
          .from('pitches')
          .select('*')
          .eq('company_id', companyRes.data.id)
          .order('created_at', { ascending: false });
        
        if (pitchError) {
          console.error('Error fetching pitch decks:', pitchError);
        } else {
          setPitchDecks(pitchData || []);
        }
      }

      // Show Tavus introduction for new users or users without processed decks
      const hasProcessedDecks = pitchData?.some(deck => deck.status === 'processed');
      if (profileRes.data && !hasProcessedDecks) {
        setShowTavusIntro(true);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  /**
   * THIS IS THE FIX: A handler function to pass to the uploader.
   * In the future, this function can be used to refresh the list of pitch decks
   * on the dashboard after a new one is uploaded.
   */
  const handleUploadSuccess = () => {
    console.log('Upload successful, refreshing data...');
    // You could add a toast notification here for better UX
    fetchData(); // Refetch data to show the new pitch deck status
  };

  const handleTavusIntroComplete = () => {
    setShowTavusIntro(false);
    // Could navigate to practice session setup or stay on dashboard
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <ClipLoader color="#facc15" size={16} />;
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'In Analysis';
      case 'processed':
        return 'Ready';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'status-processing';
      case 'processed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      default:
        return 'bg-slate-500/20 border-slate-500/30 text-slate-300';
    }
  };
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="glass rounded-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ClipLoader color="#6366f1" size={32} className="mx-auto mb-4" />
          <p className="text-white">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <motion.div
          className="glass rounded-2xl p-8 text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 font-semibold text-lg mb-2">An Error Occurred</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tavus Introduction Modal */}
      {showTavusIntro && profile && (
        <TavusIntroduction
          userName={profile.full_name || 'Founder'}
          companyName={company?.name}
          onProceed={handleTavusIntroComplete}
          onClose={() => setShowTavusIntro(false)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome, {profile?.full_name || 'Founder'}!
          </h1>
          <p className="text-xl text-white/80">
            Let's analyze the pitch for <span className="font-semibold text-indigo-400">{company?.name}</span>.
          </p>
        </motion.div>
        
        {/* Provide PitchDeckUploader for the single company */}
        {company && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <PitchDeckUploader companyId={company.id} onUploadSuccess={handleUploadSuccess} />
          </motion.div>
        )}

        {/* Uploaded Pitch Decks Section */}
        {pitchDecks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <div className="glass rounded-2xl p-6 md:p-8 border border-slate-700/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
                Your Pitch Decks
              </h2>
              
              <div className="space-y-4">
                {pitchDecks.map((deck, index) => (
                  <motion.div
                    key={deck.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass-dark rounded-xl p-4 md:p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                          <FileText className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            Pitch Deck #{deck.id.slice(-8)}
                          </h3>
                          <p className="text-sm text-slate-400">
                            Uploaded {new Date(deck.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getStatusColor(deck.status)}`}>
                          {getStatusIcon(deck.status)}
                          <span className="text-sm font-medium">
                            {deck.status === 'processed' ? 'Analyzing' : getStatusText(deck.status)}
                          </span>
                        </div>
                        
                        {deck.status === 'processed' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-secondary flex items-center gap-2 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Analysis
                          </motion.button>
                        )}
                      </div>
                    </div>
                    
                    {deck.status === 'processing' && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-sm text-yellow-300 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>Analyzing your pitch deck...</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full loading-spinner"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
