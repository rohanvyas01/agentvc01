import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertCircle, Eye, Upload } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import { UploadedDecksProps } from '../../types/dashboard';

const UploadedDecksSection: React.FC<UploadedDecksProps> = ({ 
  decks, 
  onViewDeck, 
  onUploadNew 
}) => {
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
        return 'Analyzing';
      case 'processed':
        return 'Analysis Complete';
      case 'failed':
        return 'Analysis Failed';
      default:
        return 'Queued';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'processed':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'failed':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      default:
        return 'bg-slate-500/20 border-slate-500/30 text-slate-300';
    }
  };

  if (decks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-6 border border-slate-700/30"
      >
        <div className="text-center py-8">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Pitch Decks Yet</h3>
          <p className="text-slate-400 mb-6">Upload your first pitch deck to get started with AI analysis.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUploadNew}
            className="btn-primary"
          >
            Upload Pitch Deck
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6 border border-slate-700/30"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <FileText className="w-5 h-5 text-indigo-400" />
          Uploaded Decks
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onUploadNew}
          className="btn-secondary text-sm"
        >
          Upload New
        </motion.button>
      </div>
      
      <div className="space-y-4">
        {decks.map((deck, index) => (
          <motion.div
            key={deck.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass-dark rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    Pitch Deck #{deck.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Uploaded {new Date(deck.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${getStatusColor(deck.status)}`}>
                  {getStatusIcon(deck.status)}
                  <span className="font-medium">
                    {getStatusText(deck.status)}
                  </span>
                </div>
                
                {deck.status === 'processed' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewDeck(deck.id)}
                    className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </motion.button>
                )}
              </div>
            </div>
            
            {deck.status === 'processing' && (
              <div className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-yellow-300">
                    <ClipLoader color="#facc15" size={16} />
                    <span>AI is analyzing your pitch deck...</span>
                  </div>
                  
                  {/* Analysis Steps */}
                  <div className="space-y-2 text-xs text-slate-400">
                    <motion.div 
                      className="flex items-center gap-2"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      <span>Extracting text and content structure</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-2"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      <span>Analyzing business model and market opportunity</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-2"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      <span>Preparing investor Q&A scenarios</span>
                    </motion.div>
                  </div>
                  
                  {/* Infinite Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  
                  <p className="text-xs text-slate-500 text-center">
                    Advanced AI analysis in progress...
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UploadedDecksSection;