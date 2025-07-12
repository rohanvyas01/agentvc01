import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, Loader, User, Building, Target } from 'lucide-react';

interface TavusIntroductionProps {
  userName: string;
  companyName?: string;
  onProceed: () => void;
  onClose?: () => void;
}

const TavusIntroduction: React.FC<TavusIntroductionProps> = ({
  userName,
  companyName,
  onProceed,
  onClose
}) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showProceedButton, setShowProceedButton] = useState(false);

  // Simulate video loading and auto-show proceed button after intro
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsVideoLoading(false);
      setIsVideoPlaying(true);
    }, 2000);

    // Show proceed button after video "plays" (simulated)
    const proceedTimer = setTimeout(() => {
      setShowProceedButton(true);
    }, 8000);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(proceedTimer);
    };
  }, []);

  const handleVideoEnd = () => {
    setIsVideoPlaying(false);
    setShowProceedButton(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-full px-4 py-2 mb-4"
          >
            <User className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">Personal Introduction</span>
          </motion.div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Hello {userName}! 👋
          </h2>
          <p className="text-slate-400">
            Welcome to AgentVC. Let me introduce myself and explain how I can help you.
          </p>
        </div>

        {/* Video Container */}
        <div className="relative mb-6">
          <div className="glass rounded-2xl p-4 border border-slate-700/30">
            <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden bg-slate-800">
              
              {/* Video Loading State */}
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-white text-sm">Preparing your personal introduction...</p>
                  </div>
                </div>
              )}

              {/* Simulated Video Player */}
              {!isVideoLoading && (
                <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  {/* Avatar Placeholder */}
                  <div className="text-center">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 rounded-full overflow-hidden border-4 border-indigo-500/30">
                      <img
                        src="/5874fe52-4169-461c-aff3-3c84ab6638fc.png"
                        alt="Rohan Vyas"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Simulated Speech */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto"
                    >
                      <p className="text-white text-sm sm:text-base leading-relaxed">
                        "Hello {userName}! I'm Rohan Vyas, your AI investor. 
                        {companyName && ` I see you're working on ${companyName} - that's exciting!`}
                        I'm here to help you perfect your pitch through realistic investor conversations. 
                        I'll ask you the tough questions real VCs ask, so you'll be ready when it matters most."
                      </p>
                    </motion.div>

                    {/* Speaking Indicator */}
                    {isVideoPlaying && (
                      <motion.div
                        className="flex justify-center mt-4 gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-indigo-400 rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rohan Info Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-full max-w-sm"
          >
            <div className="glass rounded-xl p-3 sm:p-4 border border-slate-700/30 bg-slate-900/90 backdrop-blur-xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src="/5874fe52-4169-461c-aff3-3c84ab6638fc.png"
                    alt="Rohan Vyas"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-indigo-500/30"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm sm:text-base">Rohan Vyas</h3>
                  <p className="text-xs sm:text-sm text-indigo-400">Your AI Investor • Ready to Help</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="bg-green-500/20 border border-green-500/30 rounded-full px-2 py-1 text-xs text-green-300">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Introduction Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <div className="glass-dark rounded-lg p-4 text-center">
            <Building className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <h4 className="font-semibold text-white text-sm">About AgentVC</h4>
            <p className="text-xs text-slate-400 mt-1">
              World's first AI investor platform for pitch practice
            </p>
          </div>
          
          <div className="glass-dark rounded-lg p-4 text-center">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <h4 className="font-semibold text-white text-sm">My Purpose</h4>
            <p className="text-xs text-slate-400 mt-1">
              Help you raise capital 3x faster with real feedback
            </p>
          </div>
          
          <div className="glass-dark rounded-lg p-4 text-center">
            <User className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <h4 className="font-semibold text-white text-sm">Your Benefit</h4>
            <p className="text-xs text-slate-400 mt-1">
              Practice unlimited times without judgment
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <AnimatePresence>
          {showProceedButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onProceed}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>Start Investor Q&A</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              
              {onClose && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/30"
                >
                  Maybe Later
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        {!showProceedButton && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Introduction in progress...</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TavusIntroduction;