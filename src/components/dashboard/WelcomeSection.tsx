import React from 'react';
import { motion } from 'framer-motion';
import { WelcomeSectionProps } from '../../types/dashboard';

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ 
  userName, 
  companyName, 
  isFirstTime 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-8"
    >
      <h1 className="text-4xl font-bold text-white mb-4">
        Hello, {userName}!
      </h1>
      <p className="text-xl text-white/80">
        {isFirstTime ? (
          <>Welcome to your dashboard. Let's get started with <span className="font-semibold text-indigo-400">{companyName}</span>.</>
        ) : (
          <>Ready to continue working on <span className="font-semibold text-indigo-400">{companyName}</span>?</>
        )}
      </p>
    </motion.div>
  );
};

export default WelcomeSection;