import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOfflineState } from '../../hooks/useOfflineState';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  showWhenOnline?: boolean;
  onRetry?: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'top',
  showWhenOnline = false,
  onRetry,
}) => {
  const { isOnline, wasOffline, isConnecting, retry } = useOfflineState({
    pingUrl: '/api/health',
    pingInterval: 30000, // Check every 30 seconds
  });

  const handleRetry = async () => {
    const success = await retry();
    if (success && onRetry) {
      onRetry();
    }
  };

  const showIndicator = !isOnline || (showWhenOnline && wasOffline);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          className={`fixed left-0 right-0 z-50 ${
            position === 'top' ? 'top-0' : 'bottom-0'
          }`}
        >
          <div className={`mx-4 mt-4 mb-4 ${position === 'bottom' ? 'mb-4' : ''}`}>
            <div
              className={`glass rounded-lg p-3 border-l-4 ${
                isOnline
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-red-500 bg-red-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isConnecting ? (
                      <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
                    ) : isOnline ? (
                      <Wifi className="w-5 h-5 text-green-400" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {isConnecting
                        ? 'Checking connection...'
                        : isOnline
                        ? 'Back online!'
                        : 'You\'re offline'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {isConnecting
                        ? 'Please wait while we verify your connection'
                        : isOnline
                        ? 'Your connection has been restored'
                        : 'Some features may not be available'}
                    </p>
                  </div>
                </div>

                {!isOnline && !isConnecting && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;

// Compact version for mobile
export const CompactOfflineIndicator: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { isOnline, isConnecting } = useOfflineState();

  if (isOnline && !isConnecting) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isConnecting ? (
        <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-400" />
      )}
      <span className="text-xs text-slate-400">
        {isConnecting ? 'Connecting...' : 'Offline'}
      </span>
    </div>
  );
};

// Toast-style notification
export const OfflineToast: React.FC<{
  onDismiss?: () => void;
}> = ({ onDismiss }) => {
  const { isOnline, wasOffline } = useOfflineState();
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (isOnline && wasOffline) {
      // Auto-dismiss after 3 seconds when back online
      const timer = setTimeout(() => {
        setDismissed(true);
        if (onDismiss) onDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, onDismiss]);

  const showToast = (!isOnline || (isOnline && wasOffline)) && !dismissed;

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div
            className={`glass rounded-lg p-4 max-w-sm border-l-4 ${
              isOnline
                ? 'border-green-500 bg-green-500/10'
                : 'border-red-500 bg-red-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">
                  {isOnline ? 'Connection restored' : 'Connection lost'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {isOnline
                    ? 'You\'re back online. All features are available.'
                    : 'You\'re currently offline. Some features may be limited.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setDismissed(true);
                  if (onDismiss) onDismiss();
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};