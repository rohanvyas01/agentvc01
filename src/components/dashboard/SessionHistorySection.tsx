import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle, XCircle, Eye, Plus } from 'lucide-react';
import { SessionHistoryProps } from '../../types/dashboard';

const SessionHistorySection: React.FC<SessionHistoryProps> = ({ 
  sessions, 
  onViewSession, 
  onStartNew 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'failed':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      default:
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-6 border border-slate-700/30"
      >
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Sessions Yet</h3>
          <p className="text-slate-400 mb-6">Start your first AI investor conversation to see your session history here.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartNew}
            className="btn-primary"
          >
            Start First Session
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
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Session History
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartNew}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Session
        </motion.button>
      </div>
      
      <div className="space-y-4">
        {sessions.slice(0, 5).map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass-dark rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    Session with AI Investor
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{formatDuration(session.duration_minutes)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${getStatusColor(session.status)}`}>
                  {getStatusIcon(session.status)}
                  <span className="font-medium capitalize">
                    {session.status}
                  </span>
                </div>
                
                {session.status === 'completed' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewSession(session.id)}
                    className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {sessions.length > 5 && (
          <div className="text-center pt-4">
            <button className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
              View all {sessions.length} sessions
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SessionHistorySection;