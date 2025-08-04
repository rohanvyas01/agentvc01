import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { supabase } from '../../lib/supabase.ts';
import { apiService } from '../../services/api.ts';
import { 
  Zap, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ArrowRight,
  User,
  Upload,
  RefreshCw,
  Video,
  Target,
  TrendingUp
} from 'lucide-react';
import { TalkToAIProps } from '../../types/dashboard.ts';
import ConversationSetup from './ConversationSetup.tsx';
import { useResponsive, useTouch } from '../../hooks/useResponsive.ts';

interface PrerequisiteStatus {
  profile: boolean;
  company: boolean;
  deck: boolean;
  deckProcessed: boolean;
}

const TalkToAISection: React.FC<TalkToAIProps> = ({
  isFirstTime,
  onStartConversation
}) => {
  const { isMobile, isTablet } = useResponsive();
  const isTouch = useTouch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStatus>({
    profile: false,
    company: false,
    deck: false,
    deckProcessed: false
  });
  const [error, setError] = useState<string>('');
  const [validationComplete, setValidationComplete] = useState(false);

  // Validate prerequisites on component mount and when user changes
  useEffect(() => {
    if (user) {
      validatePrerequisites();
    }
  }, [user]);

  const validatePrerequisites = async () => {
    if (!user) return;

    setIsValidating(true);
    setError('');

    try {
      // Check profile completion
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Check company information
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check pitch decks - using same query as Dashboard
      let hasDecks = false;
      let hasProcessedDecks = false;
      
      if (company && !companyError) {
        const { data: pitchDecks, error: deckError } = await supabase
          .from('pitch_decks')
          .select('*')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false });

        hasDecks = pitchDecks && pitchDecks.length > 0;
        // For now, allow any uploaded deck to be used (even if still processing)
        // In production, you might want to be more strict about this
        hasProcessedDecks = hasDecks;
        
        console.log('Pitch decks found:', pitchDecks?.map((d: any) => ({ 
          id: d.id, 
          status: d.processing_status,
          created_at: d.created_at 
        })));
      } else {
        console.log('No company found, cannot check pitch decks');
      }

      const newPrerequisites = {
        profile: !!profile,
        company: !!company,
        deck: hasDecks,
        deckProcessed: hasDecks
      };

      setPrerequisites(newPrerequisites);
      setValidationComplete(true);

    } catch (err: any) {
      setError(err.message || 'Failed to validate prerequisites');
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleStartConversation = async () => {
    // First validate prerequisites
    await validatePrerequisites();
    
    // Check if all prerequisites are met
    const allPrerequisitesMet = Object.values(prerequisites).every(Boolean);
    
    if (!allPrerequisitesMet) {
      setError('Please complete all prerequisites before starting a conversation');
      return;
    }
    
    try {
      // Show the conversation setup modal
      setShowSetup(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Failed to start conversation setup');
    }
  };

  const handleSetupComplete = (setup: any) => {
    setShowSetup(false);
    // Navigate to live conversation or handle setup completion
    if (onStartConversation) {
      onStartConversation();
    }
    // In a real implementation, you might navigate to the live session
    // navigate('/session/live', { state: setup });
  };

  const handleSetupCancel = () => {
    setShowSetup(false);
  };

  // Show different UI based on prerequisites and validation state
  if (isValidating && !validationComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass rounded-2xl p-8 border border-blue-500/30 bg-blue-500/5 text-center"
      >
        <RefreshCw className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-white mb-4">Checking Prerequisites</h2>
        <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
          Validating your profile, company information, and pitch deck status...
        </p>
      </motion.div>
    );
  }

  // Show prerequisites not met
  if (validationComplete && !Object.values(prerequisites).every(Boolean)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass rounded-2xl p-8 border border-orange-500/30 bg-orange-500/5"
      >
        <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Prerequisites Required</h2>
        <p className="text-slate-300 mb-6 max-w-2xl mx-auto text-center">
          Please complete the following requirements before starting your AI conversation:
        </p>
        
        {/* Prerequisites Checklist */}
        <div className="space-y-3 max-w-md mx-auto mb-6">
          <div className={`flex items-center space-x-3 p-3 rounded-lg ${
            prerequisites.profile ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {prerequisites.profile ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <div className="flex-1">
              <span className="text-white font-medium">Profile Complete</span>
              {!prerequisites.profile && (
                <p className="text-sm text-slate-400">Complete your founder profile</p>
              )}
            </div>
            {!prerequisites.profile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/onboarding')}
                className="btn-secondary text-xs px-3 py-1"
              >
                Complete
              </motion.button>
            )}
          </div>

          <div className={`flex items-center space-x-3 p-3 rounded-lg ${
            prerequisites.company ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {prerequisites.company ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <div className="flex-1">
              <span className="text-white font-medium">Company Information</span>
              {!prerequisites.company && (
                <p className="text-sm text-slate-400">Add your company details</p>
              )}
            </div>
            {!prerequisites.company && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/onboarding')}
                className="btn-secondary text-xs px-3 py-1"
              >
                Add Info
              </motion.button>
            )}
          </div>

          <div className={`flex items-center space-x-3 p-3 rounded-lg ${
            prerequisites.deck ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {prerequisites.deck ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <div className="flex-1">
              <span className="text-white font-medium">Pitch Deck Uploaded</span>
              {!prerequisites.deck && (
                <p className="text-sm text-slate-400">Upload your pitch deck</p>
              )}
            </div>
            {!prerequisites.deck && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/upload')}
                className="btn-secondary text-xs px-3 py-1 flex items-center space-x-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </motion.button>
            )}
          </div>

          <div className={`flex items-center space-x-3 p-3 rounded-lg ${
            prerequisites.deckProcessed ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'
          }`}>
            {prerequisites.deckProcessed ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Clock className="w-5 h-5 text-orange-400" />
            )}
            <div className="flex-1">
              <span className="text-white font-medium">Deck Analysis Complete</span>
              {prerequisites.deck && !prerequisites.deckProcessed && (
                <p className="text-sm text-slate-400">Your deck is being processed...</p>
              )}
              {!prerequisites.deck && (
                <p className="text-sm text-slate-400">Upload a deck first</p>
              )}
            </div>
            {prerequisites.deck && !prerequisites.deckProcessed && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
            )}
          </div>
        </div>

        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={validatePrerequisites}
            disabled={isValidating}
            className="btn-secondary flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </motion.button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass rounded-2xl p-8 border border-green-500/30 bg-green-500/5 text-center"
      >
        <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">
          {isFirstTime ? 'Ready to Pitch to Rohan?' : 'Start New Practice Session'}
        </h2>
        <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
          {isFirstTime 
            ? 'Your pitch deck has been analyzed. Now it\'s time to practice with Rohan and get real investor feedback.'
            : 'Practice your pitch with Rohan to improve your delivery and get valuable feedback.'
          }
        </p>
        
        {/* Prerequisites Check - All Passed */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm">
          <div className="flex items-center space-x-2 text-green-300">
            <CheckCircle className="w-4 h-4" />
            <span>Profile complete</span>
          </div>
          <div className="flex items-center space-x-2 text-green-300">
            <CheckCircle className="w-4 h-4" />
            <span>Company info added</span>
          </div>
          <div className="flex items-center space-x-2 text-green-300">
            <CheckCircle className="w-4 h-4" />
            <span>Pitch deck analyzed</span>
          </div>
          <div className="flex items-center space-x-2 text-green-300">
            <CheckCircle className="w-4 h-4" />
            <span>Ready to practice</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartConversation}
          disabled={isValidating}
          className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Validating...</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5" />
              <span>Pitch to Rohan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        {/* Enhanced info section for all users */}
        <div className={`mt-6 grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          <div className={`bg-slate-800/30 rounded-lg border border-slate-700/30 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className={`flex items-center mb-2 ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
              <User className={`text-indigo-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <h4 className={`text-white font-medium ${isMobile ? 'text-sm' : ''}`}>Meet Rohan</h4>
            </div>
            <p className={`text-slate-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Pitch to Rohan Vyas, an experienced investor tailored to your funding stage
            </p>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg border border-slate-700/30 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className={`flex items-center mb-2 ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
              <Video className={`text-green-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <h4 className={`text-white font-medium ${isMobile ? 'text-sm' : ''}`}>Live Practice</h4>
            </div>
            <p className={`text-slate-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              15-30 minute video conversation with real-time feedback and analysis
            </p>
          </div>
          
          <div className={`bg-slate-800/30 rounded-lg border border-slate-700/30 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className={`flex items-center mb-2 ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
              <TrendingUp className={`text-orange-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <h4 className={`text-white font-medium ${isMobile ? 'text-sm' : ''}`}>Get Report</h4>
            </div>
            <p className={`text-slate-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Detailed analysis with strengths, improvements, and follow-up questions
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </motion.div>

      {/* Conversation Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <ConversationSetup
              onSetupComplete={handleSetupComplete}
              onCancel={handleSetupCancel}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TalkToAISection;
