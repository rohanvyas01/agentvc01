import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Upload, 
  Plus, 
  Zap, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { QuickAction } from '../../types/dashboard';
import { useResponsive, useTouch } from '../../hooks/useResponsive';

interface QuickActionsProps {
  actions: QuickAction[];
  isFirstTime?: boolean;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  actions, 
  isFirstTime = false,
  className = ""
}) => {
  const { isMobile, isTablet } = useResponsive();
  const isTouch = useTouch();
  if (actions.length === 0) {
    return null;
  }

  const getActionIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'message-square': MessageSquare,
      'upload': Upload,
      'plus': Plus,
      'zap': Zap,
      'clock': Clock,
      'alert-circle': AlertCircle
    };
    
    const IconComponent = iconMap[iconName] || MessageSquare;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`glass rounded-2xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {isFirstTime ? 'Get Started' : 'Quick Actions'}
        </h3>
        <Zap className="w-5 h-5 text-indigo-400" />
      </div>
      
      <div className={`space-y-3 ${isMobile ? 'space-y-2' : ''}`}>
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            onClick={action.action}
            disabled={action.disabled}
            className={`
              w-full flex items-center justify-between rounded-lg transition-all duration-200
              ${isMobile ? 'p-2' : 'p-3'}
              ${action.disabled 
                ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed' 
                : `bg-slate-700/70 hover:bg-slate-600/70 text-white ${!isTouch ? 'hover:scale-[1.02]' : ''} active:scale-[0.98]`
              }
              ${isFirstTime && index === 0 ? 'ring-2 ring-indigo-400/50 bg-gradient-to-r from-indigo-500/20 to-purple-500/20' : ''}
            `}
            title={action.tooltip}
          >
            <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
              <div className={`
                rounded-lg 
                ${isMobile ? 'p-1.5' : 'p-2'}
                ${action.disabled 
                  ? 'bg-slate-600/50 text-slate-400' 
                  : 'bg-indigo-500/20 text-indigo-400'
                }
              `}>
                {getActionIcon(action.icon)}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className={`font-medium truncate ${isMobile ? 'text-sm' : ''}`}>{action.label}</div>
                {action.tooltip && !isMobile && (
                  <div className="text-xs text-slate-400 mt-1 truncate">
                    {action.tooltip}
                  </div>
                )}
              </div>
            </div>
            
            {!action.disabled && (
              <div className="text-slate-400 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </div>
      
      {isFirstTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
        >
          <p className="text-xs text-indigo-300 text-center">
            Complete your first practice session to unlock more features
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuickActions;