import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';
import DashboardErrorBoundary from './DashboardErrorBoundary';
import { DashboardLoadingState, SectionLoading, InlineLoading, ButtonLoading } from './LoadingStates';
import OfflineIndicator from './OfflineIndicator';
import { useAsyncState } from '../../hooks/useAsyncState';
import { useOfflineState } from '../../hooks/useOfflineState';
import { useErrorHandler } from '../../utils/errorHandling';

// Demo component that throws errors
const ErrorThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a demo error to test error boundaries');
  }
  return <div className="text-green-400">✓ Component loaded successfully!</div>;
};

// Demo component for async operations
const AsyncDemo: React.FC = () => {
  const { handleError } = useErrorHandler();
  const asyncState = useAsyncState<string>(null, {
    retryCount: 3,
    retryDelay: 1000,
    cacheKey: 'demo_data',
  });

  const simulateAsyncOperation = async () => {
    await asyncState.execute(async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly succeed or fail for demo
      if (Math.random() > 0.5) {
        throw new Error('Simulated network error');
      }
      
      return 'Data loaded successfully!';
    });
  };

  return (
    <div className="glass rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Async State Demo</h3>
      
      <div className="space-y-3">
        <ButtonLoading
          loading={asyncState.loading}
          onClick={simulateAsyncOperation}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Simulate Async Operation
        </ButtonLoading>
        
        {asyncState.loading && <InlineLoading text="Loading data..." />}
        
        {asyncState.error && (
          <div className="text-red-400 text-sm">
            Error: {asyncState.error.message}
            {asyncState.retryCount > 0 && (
              <div className="text-xs text-slate-400 mt-1">
                Retry attempt {asyncState.retryCount} of {asyncState.maxRetries}
              </div>
            )}
          </div>
        )}
        
        {asyncState.data && (
          <div className="text-green-400 text-sm">✓ {asyncState.data}</div>
        )}
      </div>
    </div>
  );
};

// Main demo component
const ErrorHandlingDemo: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const { isOnline } = useOfflineState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <OfflineIndicator />
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Error Handling & Loading States Demo
          </h1>
          <p className="text-slate-400">
            This demo showcases the comprehensive error handling and loading states implementation.
          </p>
        </div>

        {/* Connection Status */}
        <div className="glass rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-3">Connection Status</h2>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isOnline 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Loading States Demo */}
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <button
                onClick={() => setShowLoading(!showLoading)}
                className="mb-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {showLoading ? 'Hide' : 'Show'} Loading Demo
              </button>
              
              {showLoading && (
                <div className="space-y-4">
                  <SectionLoading section="Dashboard Data" />
                  <InlineLoading text="Processing..." />
                </div>
              )}
            </div>
            
            <AsyncDemo />
          </div>
        </div>

        {/* Error Boundary Demo */}
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Error Boundaries</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Error Boundary */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">General Error Boundary</h3>
              <button
                onClick={() => setShowError(!showError)}
                className="mb-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                {showError ? 'Fix' : 'Trigger'} Error
              </button>
              
              <ErrorBoundary>
                <div className="glass rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                  <ErrorThrowingComponent shouldThrow={showError} />
                </div>
              </ErrorBoundary>
            </div>

            {/* Dashboard Error Boundary */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Dashboard Section Error</h3>
              <DashboardErrorBoundary 
                section="demo section"
                onRetry={() => console.log('Retry clicked')}
                onFallback={() => console.log('Fallback clicked')}
              >
                <div className="glass rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                  <ErrorThrowingComponent shouldThrow={showError} />
                </div>
              </DashboardErrorBoundary>
            </div>
          </div>
        </div>

        {/* Full Dashboard Loading Demo */}
        {showLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50"
          >
            <DashboardLoadingState />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ErrorHandlingDemo;