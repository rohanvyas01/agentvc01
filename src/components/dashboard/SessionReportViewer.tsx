import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Mail, RefreshCw, CheckCircle, AlertCircle, FileText, BarChart3, MessageSquare, Clock } from 'lucide-react';
import { SessionReport } from '../../lib/supabase';
import { 
  getSessionReport, 
  emailSessionReport, 
  exportReportAsPDF,
  subscribeToReportUpdates 
} from '../../services/reportService';

interface SessionReportViewerProps {
  sessionId: string;
  className?: string;
}

const SessionReportViewer: React.FC<SessionReportViewerProps> = ({ sessionId, className = '' }) => {
  const [report, setReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
    
    // Subscribe to report updates
    const subscription = subscribeToReportUpdates(
      sessionId,
      (updatedReport) => {
        setReport(updatedReport);
        setError(null);
        setEmailSent(updatedReport.email_sent);
      },
      (error) => {
        setError(error.message);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: reportError } = await getSessionReport(sessionId);
      if (reportError) {
        setError(reportError.message);
      } else {
        setReport(data);
        setEmailSent(data?.email_sent || false);
      }
    } catch (error) {
      console.error('Failed to load report:', error);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateReport = async () => {
    try {
      setReportLoading(true);
      setError(null);
      
      const { data: newReport, error } = await getSessionReport(sessionId, true);
      if (error) {
        setError(error.message);
      } else {
        setReport(newReport);
        setEmailSent(newReport?.email_sent || false);
      }
    } catch (error) {
      console.error('Failed to regenerate report:', error);
      setError('Failed to regenerate report');
    } finally {
      setReportLoading(false);
    }
  };

  const handleEmailReport = async () => {
    try {
      setEmailLoading(true);
      setError(null);
      
      const { success, error } = await emailSessionReport(sessionId);
      if (error) {
        setError(error.message);
      } else {
        setEmailSent(true);
        // Refresh report to get updated email status
        const { data: updatedReport } = await getSessionReport(sessionId);
        if (updatedReport) {
          setReport(updatedReport);
        }
      }
    } catch (error) {
      console.error('Failed to email report:', error);
      setError('Failed to send email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);
      setError(null);
      
      const { data: pdfBlob, error } = await exportReportAsPDF(sessionId);
      if (error) {
        setError(error.message);
      } else if (pdfBlob) {
        // Create download link
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `session-report-${sessionId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      setError('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-red-400 font-medium mb-2">Report Error</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={handleRegenerateReport}
            disabled={reportLoading}
            className="btn-secondary text-sm flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${reportLoading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-400">No report available for this session.</p>
          <button
            onClick={handleRegenerateReport}
            disabled={reportLoading}
            className="btn-primary text-sm flex items-center gap-2 mx-auto mt-4"
          >
            <RefreshCw className={`w-4 h-4 ${reportLoading ? 'animate-spin' : ''}`} />
            Generate Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 text-sm font-medium">Report Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={handleRegenerateReport}
            disabled={reportLoading}
            className="ml-auto btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${reportLoading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </motion.div>
      )}

      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Session Report</h3>
            <p className="text-sm text-slate-400">
              Generated on {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
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
            <div className="flex items-center gap-2 text-green-400 text-sm px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
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

      {/* Report Content */}
      <div className="space-y-6">
        {/* Session Summary */}
        {report.report_data.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-lg p-6 border border-slate-700/30"
          >
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Session Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-slate-400 text-sm">Duration</p>
                <p className="text-white font-medium">{report.report_data.summary.duration_minutes}m</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-slate-400 text-sm">Score</p>
                <p className="text-white font-medium text-xl">{report.report_data.summary.overall_score}/10</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-slate-400 text-sm">Status</p>
                <p className="text-white font-medium capitalize">{report.report_data.summary.status}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-slate-400 text-sm">Company</p>
                <p className="text-white font-medium">{report.report_data.summary.company_name}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analysis Section */}
        {report.report_data.analysis && (
          <div className="grid md:grid-cols-2 gap-6">
            {report.report_data.analysis.key_strengths?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-dark rounded-lg p-6 border border-slate-700/30"
              >
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  Key Strengths
                </h4>
                <ul className="space-y-3">
                  {report.report_data.analysis.key_strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-slate-300 text-sm flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      {strength}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {report.report_data.analysis.improvement_areas?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-dark rounded-lg p-6 border border-slate-700/30"
              >
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  Areas for Improvement
                </h4>
                <ul className="space-y-3">
                  {report.report_data.analysis.improvement_areas.map((area: string, index: number) => (
                    <li key={index} className="text-slate-300 text-sm flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      {area}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        )}

        {/* Detailed Feedback */}
        {report.report_data.analysis?.detailed_feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-lg p-6 border border-slate-700/30"
          >
            <h4 className="font-semibold text-white mb-4">Detailed Feedback</h4>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 text-sm leading-relaxed">
                {report.report_data.analysis.detailed_feedback}
              </p>
            </div>
          </motion.div>
        )}

        {/* Recommendations and Next Steps */}
        <div className="grid md:grid-cols-2 gap-6">
          {report.report_data.recommendations?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark rounded-lg p-6 border border-slate-700/30"
            >
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                Recommendations
              </h4>
              <ul className="space-y-3">
                {report.report_data.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    {rec}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {report.report_data.next_steps?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark rounded-lg p-6 border border-slate-700/30"
            >
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                Next Steps
              </h4>
              <ul className="space-y-3">
                {report.report_data.next_steps.map((step: string, index: number) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    {step}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Follow-up Questions */}
        {report.report_data.follow_up_questions?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-lg p-6 border border-slate-700/30"
          >
            <h4 className="font-semibold text-white mb-4">Follow-up Questions for Practice</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {report.report_data.follow_up_questions.map((question: string, index: number) => (
                <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                  <p className="text-slate-300 text-sm">{question}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Report Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-lg p-4 border border-slate-700/30"
        >
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-4">
              <span>Report ID: {report.id.slice(0, 8)}...</span>
              <span>•</span>
              <span>Generated: {new Date(report.created_at).toLocaleString()}</span>
            </div>
            {report.email_sent && report.email_sent_at && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Emailed: {new Date(report.email_sent_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SessionReportViewer;