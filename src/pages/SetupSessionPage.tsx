import React, { useState, useEffect } from 'react';
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
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
      green: 'border-green-200 bg-green-50 text-green-700',
      orange: 'border-orange-200 bg-orange-50 text-orange-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Setup Your Practice Session</h1>
        <p className="text-xl text-gray-600">
          Choose your pitch deck and select an AI investor persona to practice with
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pitch Deck Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Select Pitch Deck</h2>
          </div>

          {decks.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pitch decks uploaded</h3>
              <p className="text-gray-600 mb-4">
                You need to upload a pitch deck before starting a practice session.
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Deck</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  onClick={() => setSelectedDeck(deck.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedDeck === deck.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className={`w-5 h-5 ${
                        selectedDeck === deck.id ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <h3 className="font-medium text-gray-900">{deck.deck_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Investor Persona Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Choose AI Investor</h2>
          </div>

          <div className="space-y-4">
            {investorPersonas.map((persona) => {
              const Icon = persona.icon;
              return (
                <div
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedPersona === persona.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPersonaColorClasses(persona.color)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{persona.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{persona.description}</p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <p><span className="font-medium">Specialty:</span> {persona.specialty}</p>
                          <p><span className="font-medium">Experience:</span> {persona.experience}</p>
                          <p><span className="font-medium">Style:</span> {persona.style}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {persona.focus.map((focus, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {focus}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedPersona === persona.id && (
                      <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start Session Button */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to start your session?</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
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
              <div className="mt-3 p-3 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center space-x-2 text-success-700">
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
              <div className="text-error-600 text-sm">{error}</div>
            )}
            <button
              onClick={startSession}
              disabled={!selectedDeck || !selectedPersona || starting}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupSessionPage;