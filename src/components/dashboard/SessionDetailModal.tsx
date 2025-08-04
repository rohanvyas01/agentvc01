import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, BarChart3, FileText, Download, Mail, HelpCircle, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Session, ConversationTranscript, ConversationAnalysis, SessionReport } from '../../lib/supabase';
import { getSessionTranscripts, getSessionAnalysis } from '../../lib/database';
import { 
  getSessionReport as getReportService, 
  emailSessionReport, 
  exportReportAsPDF,
  subscribeToReportUpdates 
} from '../../services/reportService';
import FollowUpQuestions from './FollowUpQuestions';
import QuestionPracticeModal from './QuestionPracticeModal';

interface SessionDetailModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onStartNewSession?: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, isOpen, onClose, onStartNewSession }) => {
  const [transcripts, setTranscripts] = useState<ConversationTranscript[]>([]);
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'analysis' | 'report' | 'questions'>('transcript');
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  
  // Report-specific states
  const [reportLoading, setReportLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && session.id) {
      loadSessionDetails();
      
      // Subscribe to report updates
      const subscription = subscribeToReportUpdates(
        session.id,
        (updatedReport) => {
          setReport(updatedReport);
          setReportError(null);
        },
        (error) => {
          setReportError(error.message);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isOpen, session.id]);

  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      setReportError(null);
      
      const [transcriptsData, analysisData] = await Promise.all([
        getSessionTranscripts(session.id),
        getSessionAnalysis(session.id)
      ]);
      
      setTranscripts(transcriptsData);
      setAnalysis(analysisData);
      
      // Load report using the enhanced service
      const { data: reportData, error: reportError } = await getReportService(session.id);
      if (reportError) {
        setReportError(reportError.message);
      } else {
        setReport(reportData);
        setEmailSent(reportData?.email_sent || false);
      }
    } catch (error) {
      console.error('Failed to load session details:', error);
      setReportError('Failed to load session details');
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

  const handleStartPractice = (practiceSessionId: string) => {
    setShowPracticeModal(true);
  };

  const handleClosePracticeModal = () => {
    setShowPracticeModal(false);
  };

  const handleStartNewSessionFromPractice = () => {
    setShowPracticeModal(false);
    onClose();
    onStartNewSession?.();
  };

  const handleRegenerateReport = async () => {
    try {
      setReportLoading(true);
      setReportError(null);
      
      const { data: newReport, error } = await getReportService(session.id, true);
      if (error) {
        setReportError(error.message);
      } else {
        setReport(newReport);
        setEmailSent(newReport?.email_sent || false);
      }
    } catch (error) {
      console.error('Failed to regenerate report:', error);
      setReportError('Failed to regenerate report');
    } finally {
      setReportLoading(false);
    }
  };

  const handleEmailReport = async () => {
    try {
      setEmailLoading(true);
      setReportError(null);
      
      const { success, error } = await emailSessionReport(session.id);
      if (error) {
        setReportError(error.message);
      } else {
        setEmailSent(true);
        // Refresh report to get updated email status
        const { data: updatedReport } = await getReportService(session.id);
        if (updatedReport) {
          setReport(updatedReport);
        }
      }
    } catch (error) {
      console.error('Failed to email report:', error);
      setReportError('Failed to send email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);
      setReportError(null);
      
      const { data: pdfBlob, error } = await exportReportAsPDF(session.id);
      if (error) {
        setReportError(error.message);
      } else if (pdfBlob) {
        // Create download link
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `session-report-${session.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      setReportError('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
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
              { id: 'questions', label: 'Practice Questions', icon: HelpCircle },
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

                {activeTab === 'questions' && (
                  <div className="space-y-6">
                    <FollowUpQuestions
                      sessionId={session.id}
                      onStartPractice={handleStartPractice}
                    />
                  </div>
                )}

                {activeTab === 'report' && (
                  <div className="space-y-6">
                    {reportError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <div>
                          <p className="text-red-400 text-sm font-medium">Report Error</p>
                          <p className="text-red-300 text-sm">{reportError}</p>
                        </div>
                        <button
                          onClick={handleRegenerateReport}
                          disabled={reportLoading}
                          className="ml-auto btn-secondary text-sm flex items-center gap-2"
                        >
                          <RefreshCw className={`w-4 h-4 ${reportLoading ? 'animate-spin' : ''}`} />
                          Retry
                        </button>
                      </div>
                    )}

                    {!report && !reportError ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
                        <p className="text-slate-400">Generating report...</p>
                      </div>
                    ) : report ? (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Session Report</h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleDownloadPDF}
                              disabled={pdfLoading}
                              className="btn-secondary text-sm flex items-center gap-2"
                            >
                              <Download className={`w-4 h-4 ${pdfLoading ? 'animate-spin' : ''}`} />
                              {pdfLoading ? 'Generating...' : 'Download PDF'}
                            </button>
                            
                            {emailSent || report.email_sent ? (
                              <div className="flex items-center gap-2 text-green-400 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Email Sent
                              </div>
                            ) : (
                              <button
                                onClick={handleEmailReport}
                                disabled={emailLoading}
                                className="btn-primary text-sm flex items-center gap-2"
                              >
                                <Mail className={`w-4 h-4 ${emailLoading ? 'animate-spin' : ''}`} />
                                {emailLoading ? 'Sending...' : 'Email Report'}
                              </button>
                            )}
                            
                            <button
                              onClick={handleRegenerateReport}
                              disabled={reportLoading}
                              className="btn-secondary text-sm flex items-center gap-2"
                            >
                              <RefreshCw className={`w-4 h-4 ${reportLoading ? 'animate-spin' : ''}`} />
                              Regenerate
                            </button>
                          </div>
                        </div>

                        {/* Report Summary */}
                        {report.report_data.summary && (
                          <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                            <h4 className="font-semibold text-white mb-2">Session Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-slate-400">Date</p>
                                <p className="text-white">{new Date(report.report_data.summary.session_date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Duration</p>
                                <p className="text-white">{report.report_data.summary.duration_minutes}m</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Score</p>
                                <p className="text-white">{report.report_data.summary.overall_score}/10</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Status</p>
                                <p className="text-white capitalize">{report.report_data.summary.status}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Analysis Section */}
                        {report.report_data.analysis && (
                          <div className="grid md:grid-cols-2 gap-6">
                            {report.report_data.analysis.key_strengths?.length > 0 && (
                              <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  Key Strengths
                                </h4>
                                <ul className="space-y-2">
                                  {report.report_data.analysis.key_strengths.map((strength: string, index: number) => (
                                    <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                      <span className="text-green-400 mt-1">•</span>
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {report.report_data.analysis.improvement_areas?.length > 0 && (
                              <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                  Areas for Improvement
                                </h4>
                                <ul className="space-y-2">
                                  {report.report_data.analysis.improvement_areas.map((area: string, index: number) => (
                                    <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                      <span className="text-yellow-400 mt-1">•</span>
                                      {area}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Detailed Feedback */}
                        {report.report_data.analysis?.detailed_feedback && (
                          <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                            <h4 className="font-semibold text-white mb-3">Detailed Feedback</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {report.report_data.analysis.detailed_feedback}
                            </p>
                          </div>
                        )}

                        {/* Recommendations */}
                        {report.report_data.recommendations?.length > 0 && (
                          <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                            <h4 className="font-semibold text-white mb-3">Recommendations</h4>
                            <ul className="space-y-2">
                              {report.report_data.recommendations.map((rec: string, index: number) => (
                                <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                  <span className="text-indigo-400 mt-1">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Next Steps */}
                        {report.report_data.next_steps?.length > 0 && (
                          <div className="glass-dark rounded-lg p-4 border border-slate-700/30">
                            <h4 className="font-semibold text-white mb-3">Next Steps</h4>
                            <ul className="space-y-2">
                              {report.report_data.next_steps.map((step: string, index: number) => (
                                <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                  <span className="text-purple-400 mt-1">→</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Practice Modal */}
        <QuestionPracticeModal
          sessionId={session.id}
          isOpen={showPracticeModal}
          onClose={handleClosePracticeModal}
          onStartNewSession={handleStartNewSessionFromPractice}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionDetailModal;