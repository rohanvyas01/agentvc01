import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SessionHistoryProps } from '../../types/dashboard';
import SessionCard from './SessionCard';
import SessionDetailModal from './SessionDetailModal';
import { Session } from '../../lib/supabase';

const SessionHistorySection: React.FC<SessionHistoryProps> = ({ 
  sessions, 
  onViewSession, 
  onStartNew 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed' | 'active'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showModal, setShowModal] = useState(false);
  const sessionsPerPage = 5;

  // Filter and search sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      const matchesSearch = searchTerm === '' || 
        session.created_at.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.status.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [sessions, statusFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * sessionsPerPage;
    return filteredSessions.slice(startIndex, startIndex + sessionsPerPage);
  }, [filteredSessions, currentPage, sessionsPerPage]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const handleViewSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setShowModal(true);
    }
    onViewSession(sessionId);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSession(null);
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-6 border border-slate-700/30"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Session History ({filteredSessions.length})
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

        {/* Filters and Search */}
        {sessions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="active">Active</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Session List */}
        <div className="space-y-4">
          {paginatedSessions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No sessions match your filters.' 
                : 'No sessions found.'
              }
            </div>
          ) : (
            paginatedSessions.map((session, index) => (
              <SessionCard
                key={session.id}
                session={session}
                onViewSession={handleViewSession}
                index={index}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/30">
            <div className="text-sm text-slate-400">
              Showing {((currentPage - 1) * sessionsPerPage) + 1} to {Math.min(currentPage * sessionsPerPage, filteredSessions.length)} of {filteredSessions.length} sessions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default SessionHistorySection;