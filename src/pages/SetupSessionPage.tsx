import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, PitchDeck } from '../lib/supabase';
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
  Briefcase,
  TrendingUp,
  Building
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
    id: 'saas-guru',
    name: 'Sarah Chen',
    description: 'SaaS Expert & Growth Investor',
    specialty: 'B2B SaaS, Enterprise Software',
    focus: ['Product-Market Fit', 'Unit Economics', 'Scalability'],
    experience: '15+ years at Sequoia & Bessemer',
    style: 'Direct, metrics-focused, thorough due diligence',
    icon: TrendingUp,
    color: 'blue'
  },
  {
    id: 'deeptech-vc',
    name: 'Dr. Michael Torres',
    description: 'Deep Tech & AI Specialist',
    specialty: 'AI/ML, Hardware, Biotech',
    focus: ['Technical Innovation', 'IP Portfolio', 'Market Timing'],
    experience: 'Former Google X, now at Andreessen Horowitz',
    style: 'Technical depth, long-term vision oriented',
    icon: Building,
    color: 'purple'
  },
  {
    id: 'consumer-expert',
    name: 'Emma Rodriguez',
    description: 'Consumer & Mobile Expert',
    specialty: 'Consumer Apps, E-commerce, Fintech',
    focus: ['User Acquisition', 'Retention', 'Monetization'],
    experience: 'Led investments at Lightspeed & GV',
    style: 'User-centric, growth and engagement focused',
    icon: Target,
    color: 'green'
  },
  {
    id: 'early-stage',
    name: 'James Wilson',
    description: 'Early Stage Generalist',
    specialty: 'Seed & Series A across verticals',
    focus: ['Team', 'Market Size', 'Business Model'],
    experience: 'Partner at First Round Capital',
    style: 'Founder-friendly, focused on team and vision',
    icon: Briefcase,
    color: 'orange'
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
    }
  }, [user]);

  const fetchDecks = async () => {
    try {
      const { data, error } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDecks(data || []);
    } catch (err) {
      console.error('Error fetching decks:', err);
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
      // Create session record
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: user!.id,
          deck_id: selectedDeck,
          tavus_persona_id: selectedPersona,
          status: 'created'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // In a real implementation, you would call your backend API here
      // to create the Tavus conversation and get the conversation URL
      
      // For demo purposes, we'll simulate this
      const mockConversationUrl = `https://demo-tavus-session.com/${sessionData.id}`;
      
      // Navigate to live session page with the session data
      navigate('/session/live', { 
        state: { 
          sessionId: sessionData.id,
          conversationUrl: mockConversationUrl,
          selectedPersona: investorPersonas.find(p => p.id === selectedPersona)
        } 
      });

    } catch (err: any) {
      setError(err.message || 'Failed to start session');
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
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
        <h1 className="text-3xl font-bold text-white mb-4">Setup Your Practice Session</h1>
        <p className="text-xl text-white/80">
          Choose your pitch deck and select an AI investor persona to practice with
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
                          {deck.file_size && (
                            <span>{(deck.file_size / 1024 / 1024).toFixed(1)} MB</span>
                          )}
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
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Choose AI Investor</h2>
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

          <div className="flex flex-col space-y-2">
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Starting Session...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Start Practice Session</span>
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