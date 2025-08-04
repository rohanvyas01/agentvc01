import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, PitchDeck } from '../lib/supabase';

import { ConversationButton } from '../components/ConversationButton';
import { ClipLoader } from 'react-spinners';
import { 
  Video, 
  FileText, 
  User, 
  ArrowRight, 
  CheckCircle,
  Upload,
  Calendar,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';

interface InvestorPersona {
  id: string;
  name: string;
  description: string;
  specialty: string;
  focus: string[];
  experience: string;
  style: string;
  icon: React.ComponentType<any>;
  color: string;
}

const investorPersonas: InvestorPersona[] = [
  {
    id: 'rohan-angel',
    name: 'Rohan Vyas',
    description: 'Angel Investor',
    specialty: 'Early Stage Startups, Seed Funding',
    focus: ['Team Dynamics', 'Market Opportunity', 'Product Vision'],
    experience: 'Serial entrepreneur and angel investor',
    style: 'Founder-friendly, focused on vision and execution',
    icon: Target,
    color: 'green'
  },
  {
    id: 'rohan-vc',
    name: 'Rohan Vyas',
    description: 'Venture Capital',
    specialty: 'Growth Stage, Series A/B Funding',
    focus: ['Scalability', 'Unit Economics', 'Market Size'],
    experience: 'VC partner with portfolio of successful exits',
    style: 'Metrics-driven, thorough due diligence approach',
    icon: TrendingUp,
    color: 'blue'
  }
];

const SetupSessionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [decks, setDecks] = useState<PitchDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchDecks();
      autoSelectPersona();
    }
  }, [user]);

  const autoSelectPersona = async () => {
    try {
      // Get company information to determine funding round
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('funding_round')
        .eq('user_id', user!.id)
        .single();

      if (companyError || !company) {
        // Default to VC if no company info
        setSelectedPersona('rohan-vc');
        return;
      }

      // Auto-select persona based on funding round
      const isEarlyStage = ['pre-seed', 'seed'].includes(company.funding_round?.toLowerCase());
      const personaId = isEarlyStage ? 'rohan-angel' : 'rohan-vc';
      setSelectedPersona(personaId);

    } catch (error) {
      // Default to VC on error
      setSelectedPersona('rohan-vc');
    }
  };

  const fetchDecks = async () => {
    try {
      const { data: pitchDecksData, error: pitchDecksError } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (pitchDecksError) {
        console.error('Error fetching pitch decks:', pitchDecksError);
        throw pitchDecksError;
      }
      
      // Map the data to match PitchDeck interface
      const mappedDecks = (pitchDecksData || []).map(deck => ({
        ...deck,
        deck_name: deck.deck_name || `Pitch Deck #${deck.id.slice(-8)}`,
        processing_status: 'processed', // All uploaded decks are considered processed
        user_id: user!.id
      }));
      
      setDecks(mappedDecks);
      console.log('Loaded pitch decks:', mappedDecks);
    } catch (err) {
      console.error('Failed to load pitch decks:', err);
      setError('Failed to load pitch decks. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };



  const startSession = async () => {
    if (!selectedDeck || !selectedPersona) {
      setError('Please select both a pitch deck and an investor persona');
      return;
    }

    setStarting(true);
    setError('');

    try {
      // Create a new conversation session
      const { data, error } = await supabase.functions.invoke('create-conversation-session', {
        body: {
          user_id: user?.id,
          pitch_deck_id: selectedDeck,
          persona_id: selectedPersona
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create session');
      }

      if (!data?.session_id) {
        throw new Error('No session ID returned');
      }

      // Navigate to conversation page with real session ID
      navigate(`/conversation/${data.session_id}`);

    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
    } finally {
      setStarting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPersonaColorClasses = (color: string) => {
    const colors = {
      blue: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      purple: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      green: 'border-green-500/30 bg-green-500/10 text-green-300',
      orange: 'border-orange-500/30 bg-orange-500/10 text-orange-300'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          className="glass rounded-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ClipLoader color="#6366f1" size={32} className="mx-auto mb-4" />
          <p className="text-white">Loading your pitch decks...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-4">Pitch to Rohan</h1>
        <p className="text-xl text-white/80 mb-8">
          Get ready to practice your pitch with Rohan Vyas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pitch Deck Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-xl border border-slate-700/30 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Select Pitch Deck</h2>
          </div>

          {decks.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No pitch decks uploaded</h3>
              <p className="text-slate-400 mb-4">
                You need to upload a pitch deck before starting a practice session.
              </p>
              <div className="flex flex-col space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/upload')}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Deck</span>
                </motion.button>


              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {decks.map((deck) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedDeck(deck.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedDeck === deck.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className={`w-5 h-5 ${
                        selectedDeck === deck.id ? 'text-indigo-400' : 'text-slate-400'
                      }`} />
                      <div>
                        <h3 className="font-medium text-white">{deck.deck_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(deck.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedDeck === deck.id && (
                      <CheckCircle className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Investor Persona Selection */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-xl border border-slate-700/30 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-semibold text-white">Choose AI Investor</h2>
            </div>
            {selectedPersona && (
              <div className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/30">
                Auto-selected
              </div>
            )}
          </div>

          <div className="space-y-4">
            {investorPersonas.map((persona) => {
              const Icon = persona.icon;
              return (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedPersona === persona.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPersonaColorClasses(persona.color)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{persona.name}</h3>
                        <p className="text-sm text-slate-400 mb-2">{persona.description}</p>
                        <div className="space-y-1 text-xs text-slate-400">
                          <p><span className="font-medium">Specialty:</span> {persona.specialty}</p>
                          <p><span className="font-medium">Experience:</span> {persona.experience}</p>
                          <p><span className="font-medium">Style:</span> {persona.style}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {persona.focus.map((focus, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full"
                            >
                              {focus}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedPersona === persona.id && (
                      <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Start Session Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
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
            {selectedDeck && selectedPersona && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Ready to practice with {investorPersonas.find(p => p.id === selectedPersona)?.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-4">
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
              disabled={!selectedDeck || !selectedPersona || starting}
              className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {starting ? (
                <>
                  <ClipLoader color="#ffffff" size={16} />
                  <span>Starting Session...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Pitch to Rohan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupSessionPage;