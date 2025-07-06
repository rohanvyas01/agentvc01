import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Building, 
  Globe, 
  Linkedin, 
  Target, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  BarChart3,
  Zap,
  LogOut,
  Edit3,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Rocket,
  Bot
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pitchDeckService } from '../services/pitchDeckService';
import type { PitchDeck } from '../lib/supabase';
import PitchDeckViewer from '../components/PitchDeckViewer';

const Dashboard: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const [pitchDecks, setPitchDecks] = useState<PitchDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Wait for auth to be ready
  useEffect(() => {
    if (user !== null || profile !== null) {
      setAuthLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && !authLoading) {
      loadPitchDecks();
    }
  }, [user, authLoading]);

  const loadPitchDecks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const decks = await pitchDeckService.getPitchDecks(user.id);
      setPitchDecks(decks);
    } catch (error: any) {
      console.error('Error loading pitch decks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      setError('');
      await pitchDeckService.uploadPitchDeck(file, user.id);
      await loadPitchDecks();
      // Reset file input
      event.target.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!user || !confirm('Are you sure you want to delete this pitch deck?')) return;

    try {
      await pitchDeckService.deletePitchDeck(deckId, user.id);
      await loadPitchDecks();
    } catch (error: any) {
      console.error('Delete error:', error);
      setError(error.message);
    }
  };

  const handleDownloadDeck = async (deck: PitchDeck) => {
    try {
      const downloadUrl = await pitchDeckService.getDownloadUrl(deck.storage_path);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = deck.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Download error:', error);
      setError(error.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white">
            {authLoading ? 'Setting up your account...' : 'Loading your dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700/30 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AgentVC</span>
              <span className="text-xs bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-full px-2 py-1 text-white">
                Dashboard
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{profile.founder_name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile.founder_name}! 👋
          </h1>
          <p className="text-slate-400">
            Ready to perfect your pitch with AI? Upload your deck and start training with Rohan.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pitch Deck Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-slate-700/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Pitch Deck Upload</h2>
                  <p className="text-slate-400 text-sm">Upload your pitch deck to start training with AI</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="pitch-deck-upload"
                />
                <label
                  htmlFor="pitch-deck-upload"
                  className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-4">
                    {uploading ? (
                      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-indigo-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {uploading ? 'Uploading and analyzing...' : 'Click to upload your pitch deck'}
                      </p>
                      <p className="text-slate-400 text-sm">PDF files only, max 10MB</p>
                    </div>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Pitch Decks List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Your Pitch Decks</h2>
                    <p className="text-slate-400 text-sm">{pitchDecks.length} deck(s) uploaded</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading your pitch decks...</p>
                </div>
              ) : pitchDecks.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">No pitch decks yet</h3>
                  <p className="text-slate-500">Upload your first pitch deck to get started with AI training</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pitchDecks.map((deck, index) => (
                    <motion.div
                      key={deck.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">{deck.file_name}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(deck.created_at)}
                              </span>
                              <span>{formatFileSize(deck.file_size)}</span>
                              {deck.extracted_text && (
                                <span className="flex items-center gap-1 text-green-400">
                                  <CheckCircle className="w-4 h-4" />
                                  Analyzed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedDeck(deck.id)}
                            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
                            title="View deck"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownloadDeck(deck)}
                            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
                            title="Download deck"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteDeck(deck.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700"
                            title="Delete deck"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 border border-slate-700/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Profile</h3>
                  <p className="text-slate-400 text-sm">Your founder information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Founder</label>
                  <p className="text-white font-medium">{profile.founder_name}</p>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Email</label>
                  <p className="text-white font-medium">{user.email}</p>
                </div>

                {profile.linkedin_profile && (
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wide">LinkedIn</label>
                    <a 
                      href={profile.linkedin_profile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <Linkedin className="w-4 h-4" />
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6 border border-slate-700/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Company</h3>
                  <p className="text-slate-400 text-sm">Your startup details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Startup Name</label>
                  <p className="text-white font-medium">{profile.startup_name}</p>
                </div>

                {profile.website && (
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wide">Website</label>
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Site
                    </a>
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Industry</label>
                  <p className="text-white font-medium">{profile.industry}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Business Model</label>
                  <p className="text-white font-medium">{profile.business_model}</p>
                </div>
              </div>
            </motion.div>

            {/* Funding Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6 border border-slate-700/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Funding</h3>
                  <p className="text-slate-400 text-sm">Your fundraising goals</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Funding Round</label>
                  <p className="text-white font-medium">{profile.funding_round}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Raise Amount</label>
                  <p className="text-white font-medium">{profile.raise_amount}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Use of Funds</label>
                  <p className="text-white text-sm leading-relaxed">{profile.use_of_funds}</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-6 border border-slate-700/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Quick Actions</h3>
                  <p className="text-slate-400 text-sm">Ready to start training?</p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  disabled={pitchDecks.length === 0}
                >
                  <Bot className="w-4 h-4" />
                  Start AI Training
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-slate-800 text-white font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-slate-700"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pitch Deck Viewer Modal */}
      {selectedDeck && (
        <PitchDeckViewer
          deckId={selectedDeck}
          onClose={() => setSelectedDeck(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;