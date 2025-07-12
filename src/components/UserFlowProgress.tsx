import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, Upload, User, MessageSquare, BarChart3, Video } from 'lucide-react';
import { useUserFlow } from '../contexts/UserFlowContext';

interface UserFlowProgressProps {
  showTitle?: boolean;
  compact?: boolean;
}

const UserFlowProgress: React.FC<UserFlowProgressProps> = ({ 
  showTitle = true, 
  compact = false 
}) => {
  const { steps, loading } = useUserFlow();

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'onboarding':
        return User;
      case 'agent_intro':
        return Video;
      case 'upload_deck':
        return Upload;
      case 'deck_processed':
        return BarChart3;
      case 'qa_session':
        return MessageSquare;
      default:
        return Circle;
    }
  };

  const getStepColor = (completed: boolean, required: boolean) => {
    if (completed) return 'text-green-400 border-green-400 bg-green-400/10';
    if (required) return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
    return 'text-slate-400 border-slate-600 bg-slate-800/30';
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-4 border border-slate-700/30">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                <div className="h-3 bg-slate-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 sm:p-6 border border-slate-700/30">
      {showTitle && (
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          Your Progress
        </h3>
      )}
      
      <div className={`space-y-${compact ? '2' : '3'}`}>
        {steps.map((step, index) => {
          const Icon = getStepIcon(step.id);
          const colorClass = getStepColor(step.completed, step.required);
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${colorClass}`}>
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : step.required ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${step.completed ? 'text-green-300' : 'text-white'}`}>
                    {step.name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    step.completed 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : step.required
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}>
                    {step.completed ? 'Complete' : step.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t border-slate-700/30">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>Overall Progress</span>
          <span>
            {steps.filter(s => s.completed).length} / {steps.filter(s => s.required).length} required steps
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(steps.filter(s => s.completed && s.required).length / steps.filter(s => s.required).length) * 100}%` 
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserFlowProgress;