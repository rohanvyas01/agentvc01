import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Clock, User, BarChart3, FileText, Download, Mail } from 'lucide-react';
import { Session, ConversationTranscript, ConversationAnalysis, SessionReport } from '../../lib/supabase';
import { getSessionTranscripts, getSessionAnalysis, getSessionReport } from '../../lib/database';

interface SessionDetailModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, isOpen, onClose }) => {
  const [transcripts, setTranscripts] = useState<ConversationTranscript[]>([]);
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'analysis' | 'report'>('transcript');

  useEffect(() => {
    if (isOpen && session.id) {
      loadSessionDetails();
    }
  }, [isOpen, session.id]);

  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      const [transcriptsData, analysisData, reportData] = await Promise.all([
        getSessionTranscripts(session.id),
        getSessionAnalysis(session.id),
        getSessionReport(session.id)
      ]);
      
      setTranscripts(transcriptsData);
      setAnalysis(analysisData);
      setReport(reportData);
    } catch (error) {
      console.error('Failed to load session details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatTimestamp = (timestampMs: number) => {
    const minutes = Math.floor(timestampMs / 60000);
    const seconds = Math.floor((timestampMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Session Details</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{new Date(session.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{formatDuration(session.duration_minutes)}</span>
                  <span>•</span>
                  <span className="capitalize">{session.status}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700/30">
            {[
              { id: 'transcript', label: 'Transcript', icon: MessageSquare },
              { id: 'analysis', label: 'Analysis', icon: BarChart3 },
              { id: 'report', label: 'Report', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
              </div>
            ) : (
              <>
                {activeTab === 'transcript' && (
                  <div className="space-y-4">
                    {transcripts.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        No transcript available for this session.
                      </div>
                    ) : (
                      transcripts.map((transcript, index) => (
                        <div
                          key={transcript.id}
                          className={`flex gap-4 p-4 rounded-lg ${
                            transcript.speaker === 'founder'
                              ? 'bg-indigo-500/10 border border-indigo-500/20'
                              : 'bg-slate-700/30 border border-slate-600/30'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              transcript.speaker === 'founder'
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'bg-slate-600/50 text-slate-300'
                            }`}>
                              {transcript.speaker === 'founder' ? 'F' : 'AI'}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white capitalize">
                                {transcript.speaker === 'founder' ? 'You' : 'AI Investor'}
                              </span>
                              <span className="text-xs text-slate-400">
                                {formatTimestamp(transcript.timestamp_ms)}
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {transcript.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'analysis' && (
                  <div className="space-y-6">
                    {!analysis ? (
                      <div className="text-center py-8 text-slate-400">
                        No analysis available for this session.
                      </div>
                    ) : (
                      <>
                        {analysis.overall_score && (
                          <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                            <h3 className="text-lg font-semibold text-white mb-2">Overall Score</h3>
                            <div className="flex items-center gap-4">
                              <div className="text-3xl font-bold text-indigo-400">
                                {analysis.overall_score}/10
                              </div>
                              <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                  style={{ width: `${(analysis.overall_score / 10) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              Key Strengths
                            </h3>
                            <ul className="space-y-2">
                              {analysis.key_strengths.map((strength, index) => (
                                <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                  <span className="text-green-400 mt-1">•</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              Areas for Improvement
                            </h3>
                            <ul className="space-y-2">
                              {analysis.improvement_areas.map((area, index) => (
                                <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                  <span className="text-yellow-400 mt-1">•</span>
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                          <h3 className="text-lg font-semibold text-white mb-3">Follow-up Questions</h3>
                          <ul className="space-y-2">
                            {analysis.follow_up_questions.map((question, index) => (
                              <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">?</span>
                                {question}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'report' && (
                  <div className="space-y-6">
                    {!report ? (
                      <div className="text-center py-8 text-slate-400">
                        No report available for this session.
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Session Report</h3>
                          <div className="flex items-center gap-2">
                            <button className="btn-secondary text-sm flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              Download PDF
                            </button>
                            {report.email_sent ? (
                              <div className="flex items-center gap-2 text-green-400 text-sm">
                                <Mail className="w-4 h-4" />
                                Email Sent
                              </div>
                            ) : (
                              <button className="btn-primary text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Report
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                          <h4 className="font-semibold text-white mb-2">Summary</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {report.report_data.summary}
                          </p>
                        </div>

                        <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                          <h4 className="font-semibold text-white mb-3">Recommendations</h4>
                          <ul className="space-y-2">
                            {report.report_data.recommendations.map((rec, index) => (
                              <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                          <h4 className="font-semibold text-white mb-3">Next Steps</h4>
                          <ul className="space-y-2">
                            {report.report_data.next_steps.map((step, index) => (
                              <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                <span className="text-purple-400 mt-1">→</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionDetailModal;