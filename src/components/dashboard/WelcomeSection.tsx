import React from 'react';
import { motion } from 'framer-motion';
import { WelcomeSectionProps } from '../../types/dashboard';
import { Sparkles, Target, TrendingUp } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';

interface EnhancedWelcomeSectionProps extends WelcomeSectionProps {
  hasCompletedConversation?: boolean;
  totalConversations?: number;
  nextAction?: string;
}

const WelcomeSection: React.FC<EnhancedWelcomeSectionProps> = ({ 
  userName, 
  companyName, 
  isFirstTime,
  hasCompletedConversation = false,
  totalConversations = 0,
  nextAction
}) => {
  const { isMobile, isTablet } = useResponsive();
  const getWelcomeMessage = () => {
    if (isFirstTime && !hasCompletedConversation) {
      return (
        <>
          Welcome to your dashboard! Let's get <span className="font-semibold text-indigo-400">{companyName}</span> ready to pitch.
        </>
      );
    } else if (hasCompletedConversation && totalConversations === 1) {
      return (
        <>
          Great job on your first session! Ready to continue improving <span className="font-semibold text-indigo-400">{companyName}</span>'s pitch?
        </>
      );
    } else if (totalConversations > 1) {
      return (
        <>
          Welcome back! You've completed {totalConversations} sessions. Let's keep refining <span className="font-semibold text-indigo-400">{companyName}</span>'s pitch.
        </>
      );
    } else {
      return (
        <>
          Ready to continue working on <span className="font-semibold text-indigo-400">{companyName}</span>?
        </>
      );
    }
  };

  const getIcon = () => {
    if (isFirstTime && !hasCompletedConversation) {
      return <Sparkles className="w-6 h-6 text-indigo-400" />;
    } else if (totalConversations > 0) {
      return <TrendingUp className="w-6 h-6 text-green-400" />;
    } else {
      return <Target className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`text-center ${isMobile ? 'mb-4' : 'mb-8'}`}
    >
      <div className={`flex items-center justify-center mb-4 ${isMobile ? 'flex-col space-y-2' : ''}`}>
        {getIcon()}
        <h1 className={`font-bold text-white ${
          isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
        } ${isMobile ? '' : 'ml-3'}`}>
          Hello, {userName}!
        </h1>
      </div>
      <p className={`text-white/80 mb-2 ${
        isMobile ? 'text-base px-2' : isTablet ? 'text-lg' : 'text-xl'
      }`}>
        {getWelcomeMessage()}
      </p>
      {nextAction && isFirstTime && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-indigo-300 font-medium ${
            isMobile ? 'text-xs px-4' : 'text-sm'
          }`}
        >
          Next: {nextAction}
        </motion.p>
      )}
    </motion.div>
  );
};

export default WelcomeSection;