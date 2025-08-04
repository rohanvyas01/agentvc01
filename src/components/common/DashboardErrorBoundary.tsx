import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Settings, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  section?: string;
  onRetry?: () => void;
  onFallback?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class DashboardErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    error: null,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Dashboard section error (${this.props.section}):`, error, errorInfo);
    
    // Log dashboard-specific errors
    this.logDashboardError(error, errorInfo);
  }

  private logDashboardError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      section: this.props.section || 'unknown',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Dashboard Error');
      console.error('Section:', errorData.section);
      console.error('Error:', errorData.error);
      console.error('Stack:', errorData.stack);
      console.error('Component Stack:', errorData.componentStack);
      console.groupEnd();
    }

    // In production, send to error tracking service
    // errorTrackingService.captureException(error, errorData);
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1,
      }));

      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }
  };

  private handleFallback = () => {
    if (this.props.onFallback) {
      this.props.onFallback();
    }
  };

  public render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;
      const sectionName = this.props.section || 'section';

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-red-500/20"
        >
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} Unavailable
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              We're having trouble loading this section. This might be a temporary issue.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 p-3 bg-slate-800 rounded-lg">
                <summary className="text-red-400 cursor-pointer text-sm mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-slate-300 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-2 justify-center flex-wrap">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry ({this.maxRetries - this.state.retryCount} left)
                </button>
              )}
              
              <button
                onClick={this.handleFallback}
                className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Refresh Page
              </button>
            </div>

            {!canRetry && (
              <p className="text-xs text-slate-500 mt-3">
                Maximum retry attempts reached. Please refresh the page or contact support.
              </p>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;