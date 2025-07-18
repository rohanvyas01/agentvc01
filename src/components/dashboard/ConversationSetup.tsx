import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Video, 
  ArrowRight
} from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import PersonaSelection from './PersonaSelection';
import { InvestorPersona, ConversationSetup as ConversationSetupType } from '../../types/dashboard';

// Rohan Vyas investor personas
const investorPersonas: InvestorPersona[] = [
  {
    id: 'rohan-angel',
    name: 'Rohan Vyas',
    description: 'Angel Investor',
    specialty: 'Early Stage Startups, Seed Funding',
    experience: 'Serial entrepreneur and angel investor',
    conversationStyle: 'Founder-friendly, focused on vision and execution',
    focusAreas: ['Team Dynamics', 'Market Opportunity', 'Product Vision', 'Go-to-Market'],
    avatarUrl: '/avatars/rohan-angel.jpg'
  },
  {
    id: 'rohan-vc',
    name: 'Rohan Vyas',
    description: 'Venture Capital',
    specialty: 'Growth Stage, Series A/B Funding',
    experience: 'VC partner with portfolio of successful exits',
    conversationStyle: 'Metrics-driven, thorough due diligence approach',
    focusAreas: ['Scalability', 'Unit Economics', 'Market Size', 'Competitive Advantage'],
    avatarUrl: '/avatars/rohan-vc.jpg'
  }
];

interface ConversationSetupProps {
  onSetupComplete: (setup: ConversationSetupType) => void;
  onCancel: () => void;
}

interface PrerequisiteCheck {
  id: string;
  name: string;
  status: 'checking' | 'passed' | 'failed';
  message?: string;
}

const ConversationSetup: React.FC<ConversationSetupProps> = ({
  onSetupComplete,
  onCancel
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'validation' | 'persona-selection' | 'finalizing'>('validation');
  const [selectedPersona, setSelectedPersona] = useState<InvestorPersona | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [prerequisites, setPrerequisites] = useState<PrerequisiteCheck[]>([
    { id: 'profile', name: 'Profile Complete', status: 'checking' },
    { id: 'company', name: 'Company Information', status: 'checking' },
    { id: 'deck', name: 'Pitch Deck Processed', status: 'checking' }
  ]);
  const [validationComplete, setValidationComplete] = useState(false);
  const [error, setError] = useState<string>('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Validate prerequisites on component mount
  useEffect(() => {
    validatePrerequisites();
  }, [user]);

  // Check if all prerequisites are passed and move to next step
  useEffect(() => {
    if (validationComplete) {
      const allPassed = prerequisites.every(p => p.status === 'passed');
      if (allPassed) {
        // Auto-select persona based on company's funding round
        autoSelectPersona();
      }
    }
  }, [validationComplete, prerequisites]);
  
  // Auto-select persona based on company's funding round
  const autoSelectPersona = async () => {
    try {
      // Get company information
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('funding_round')
        .eq('user_id', user!.id)
        .single();
      
      if (companyError) throw companyError;
      
      // Select persona based on funding round
      const fundingRound = company?.funding_round || '';
      
      // Default to VC for later stages, Angel for early stages
      let selectedId = 'rohan-vc';
      
      if (
        fundingRound === 'Angel Round' || 
        fundingRound === 'Seed/Pre-Seed Round'
      ) {
        selectedId = 'rohan-angel';
      }
      
      // Find the persona
      const persona = investorPersonas.find(p => p.id === selectedId);
      if (persona) {
        setSelectedPersona(persona);
        // Skip to finalizing since we auto-selected
        setStep('finalizing');
        handleStartConversation(persona);
      } else {
        // Fallback to selection if something went wrong
        setStep('persona-selection');
      }
    } catch (err) {
      console.error('Error auto-selecting persona:', err);
      // Fallback to manual selection
      setStep('persona-selection');
    }
  };

  const validatePrerequisites = async () => {
    if (!user) return;

    try {
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        updatePrerequisite('profile', 'failed', 'Error checking profile');
      } else {
        updatePrerequisite('profile', profile ? 'passed' : 'failed', 
          profile ? 'Profile is complete' : 'Profile needs to be completed');
      }

      // Check company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyError) {
        console.error('Company error:', companyError);
        updatePrerequisite('company', 'failed', 'Error checking company information');
      } else {
        updatePrerequisite('company', company ? 'passed' : 'failed',
          company ? 'Company information available' : 'Company information missing');
      }

      // Check processed pitch decks
      if (company && !companyError) {
        const { data: pitchDecks, error: deckError } = await supabase
          .from('pitches')
          .select('*')
          .eq('company_id', company.id)
          .eq('status', 'processed')
          .order('created_at', { ascending: false });

        if (deckError) {
          console.error('Deck error:', deckError);
          updatePrerequisite('deck', 'failed', 'Error checking pitch decks');
        } else if (pitchDecks && pitchDecks.length > 0) {
          updatePrerequisite('deck', 'passed', `${pitchDecks.length} processed deck(s) available`);
          setSelectedDeckId(pitchDecks[0].id); // Auto-select the most recent processed deck
        } else {
          updatePrerequisite('deck', 'failed', 'No processed pitch decks found');
        }
      } else {
        updatePrerequisite('deck', 'failed', 'Company required to check decks');
      }

      // Check if all prerequisites passed with a delay for better UX
      setTimeout(() => {
        setValidationComplete(true);
        // We'll check the state in a separate useEffect
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to validate prerequisites');
      console.error('Validation error:', err);
      setValidationComplete(true);
    }
  };

  const updatePrerequisite = (id: string, status: PrerequisiteCheck['status'], message?: string) => {
    setPrerequisites(prev => prev.map(p => 
      p.id === id ? { ...p, status, message } : p
    ));
  };

  const handlePersonaSelect = (persona: InvestorPersona) => {
    setSelectedPersona(persona);
  };

  const handleStartConversation = async (persona?: InvestorPersona) => {
    const personaToUse = persona || selectedPersona;
    
    if (!personaToUse || !selectedDeckId) {
      setError('Please select a persona to continue');
      return;
    }

    setIsCreatingSession(true);
    setStep('finalizing');
    setError('');

    try {
      // Get company information for session creation
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (companyError) throw new Error('Company information not found');

      // Create session record in database
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: user!.id,
          company_id: company.id,
          pitch_deck_id: selectedDeckId,
          tavus_persona_id: personaToUse.id,
          status: 'created'
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        throw new Error('Failed to create session record');
      }

      // Simulate Tavus API call with proper error handling
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional API failures for realistic error handling
          if (Math.random() < 0.1) {
            reject(new Error('Tavus API temporarily unavailable'));
          } else {
            resolve(null);
          }
        }, 2000);
      });

      const mockConversationUrl = `https://demo-tavus-session.com/${sessionData.id}`;
      
      const conversationSetup: ConversationSetupType = {
        sessionId: sessionData.id,
        selectedPersona: personaToUse,
        pitchDeckId: selectedDeckId,
        tavusConversationUrl: mockConversationUrl
      };

      onSetupComplete(conversationSetup);

    } catch (err: any) {
      console.error('Conversation setup error:', err);
      setError(err.message || 'Failed to create conversation session');
      setIsCreatingSession(false);
      setStep('persona-selection');
      
      // If session was created but Tavus failed, clean up
      // In a real implementation, you might want to mark the session as failed
    }
  };

  const renderValidationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Validating Prerequisites</h2>
      <p className="text-slate-300 mb-8">
        Checking that everything is ready for your AI conversation...
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        {prerequisites.map((prereq) => (
          <div
            key={prereq.id}
            className="flex items-center justify-between p-4 glass rounded-lg border border-slate-700/30"
          >
            <div className="flex items-center space-x-3">
              {prereq.status === 'checking' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
              )}
              {prereq.status === 'passed' && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              {prereq.status === 'failed' && (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <div className="text-left">
                <p className="text-white font-medium">{prereq.name}</p>
                {prereq.message && (
                  <p className="text-sm text-slate-400">{prereq.message}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </motion.div>
  );

  const renderPersonaSelectionStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Choose Your AI Investor</h2>
        <p className="text-slate-300">
          Select the investor persona you'd like to practice with. Each has different expertise and conversation styles.
        </p>
      </div>

      <PersonaSelection
        onSelect={handlePersonaSelect}
        selectedPersona={selectedPersona || undefined}
      />

      {selectedPersona && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 glass rounded-xl border border-slate-700/30 p-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to start your session?</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Duration: 15-30 minutes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Video className="w-4 h-4" />
                  <span>Video call included</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Ready to practice with {selectedPersona.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="btn-secondary px-6 py-3"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartConversation}
                className="btn-primary px-8 py-3 flex items-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>Start Practice Session</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </motion.div>
  );

  const renderFinalizingStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="glass rounded-2xl p-8">
        <ClipLoader color="#6366f1" size={48} className="mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Setting Up Your Session</h2>
        <p className="text-slate-300 mb-6">
          Creating your conversation with {selectedPersona?.name}...
        </p>
        
        <div className="space-y-3 text-sm text-slate-400 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Prerequisites validated</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Persona selected: {selectedPersona?.name}</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-400"></div>
            <span>Creating session record...</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-400"></div>
            <span>Initializing Tavus conversation...</span>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            This may take a few moments while we prepare your personalized AI conversation experience.
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {step === 'validation' && renderValidationStep()}
        {step === 'persona-selection' && renderPersonaSelectionStep()}
        {step === 'finalizing' && renderFinalizingStep()}
      </div>
    </div>
  );
};

export default ConversationSetup;