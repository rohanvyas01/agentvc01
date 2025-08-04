import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Zap
} from 'lucide-react';

export interface RealtimeStatusProps {
  isConnected: boolean;
  isReconnecting: boolean;
  isOptimistic: boolean;
  lastSync: Date | null;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'offline';
  pendingUpdates?: number;
  onReconnect?: () => void;
  className?: string;
  showDetails?: boolean;
}

const RealtimeStatus: React.FC<RealtimeStatusProps> = ({
  isConnected,
  isReconnecting,
  isOptimistic,
  lastSync,
  connectionQuality = 'offline',
  pendingUpdates = 0,
  onReconnect,
  className = '',
  showDetails = false,
}) => {
  const getStatusColor = () => {
    if (isReconnecting) return 'text-yellow-400';
    if (!isConnected) return 'text-red-400';
    if (isOptimistic) return 'text-blue-400';
    return 'text-green-400';
  };

  const getStatusIcon = () => {
    if (isReconnecting) return RefreshCw;
    if (!isConnected) return WifiOff;
    if (connectionQuality === 'poor') return AlertCircle;
    return Wifi;
  };

  const getStatusText = () => {
    if (isReconnecting) return 'Reconnecting...';
    if (!isConnected) return 'Offline';
    if (isOptimistic && pendingUpdates > 0) return `Syncing ${pendingUpdates} changes`;
    if (isOptimistic) return 'Syncing...';
    return 'Live';
  };

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'poor': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return lastSync.toLocaleDateString();
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Main Status Indicator */}
      <div className="flex items-center space-x-2">
        <motion.div
          animate={isReconnecting ? { rotate: 360 } : { rotate: 0 }}
          transition={isReconnecting ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          className={`${getStatusColor()}`}
        >
          <StatusIcon className="w-4 h-4" />
        </motion.div>
        
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Optimistic Updates Indicator */}
      <AnimatePresence>
        {isOptimistic && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-1"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap className="w-3 h-3 text-blue-400" />
            </motion.div>
            {pendingUpdates > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                {pendingUpdates}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Status */}
      {showDetails && (
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          {/* Connection Quality */}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${getQualityColor()}`} />
            <span className="capitalize">{connectionQuality}</span>
          </div>

          {/* Last Sync */}
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatLastSync()}</span>
          </div>
        </div>
      )}

      {/* Reconnect Button */}
      {!isConnected && !isReconnecting && onReconnect && (
        <button
          onClick={onReconnect}
          className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default RealtimeStatus;