import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle, XCircle, Eye, Calendar, User, BarChart3 } from 'lucide-react';
import { Session } from '../../lib/supabase';

interface SessionCardProps {
  session: Session;
  onViewSession: (sessionId: string) => void;
  index: number;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onViewSession, index }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />;
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
      case 'active':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-dark rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-white text-lg">
                AI Investor Session
              </h3>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(session.status)}`}>
                {getStatusIcon(session.status)}
                <span className="capitalize">{session.status}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(session.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime(session.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Duration: {formatDuration(session.duration_minutes)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>AI Investor</span>
              </div>
            </div>

            {session.status === 'completed' && (
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Started: {session.started_at ? formatTime(session.started_at) : 'N/A'}</span>
                <span>•</span>
                <span>Completed: {session.completed_at ? formatTime(session.completed_at) : 'N/A'}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {session.status === 'completed' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewSession(session.id)}
              className="btn-secondary flex items-center gap-2 text-sm py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Eye className="w-4 h-4" />
              View Details
            </motion.button>
          )}
          
          {session.status === 'active' && (
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>In Progress</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SessionCard;