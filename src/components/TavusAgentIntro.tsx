import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, Loader, User, Building, Target, Video, Sparkles } from 'lucide-react';

interface TavusAgentIntroProps {
  userName: string;
  companyName?: string;
  isFirstTime?: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

const TavusAgentIntro: React.FC<TavusAgentIntroProps> = ({
  userName,
  companyName,
  isFirstTime = true,
  onComplete,
  onSkip
}) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showProceedButton, setShowProceedButton] = useState(false);
  const [videoPhase, setVideoPhase] = useState<'loading' | 'greeting' | 'company_intro' | 'upload_suggestion' | 'complete'>('loading');

  // Simulate Tavus AI video phases
  useEffect(() => {
    const phases = [
      { phase: 'loading', duration: 2000 },
      { phase: 'greeting', duration: 3000 },
      { phase: 'company_intro', duration: 4000 },
      { phase: 'upload_suggestion', duration: 3000 },
      { phase: 'complete', duration: 1000 }
    ];

    let currentPhaseIndex = 0;
    
    const advancePhase = () => {
      if (currentPhaseIndex < phases.length - 1) {
        currentPhaseIndex++;
        setVideoPhase(phases[currentPhaseIndex].phase as any);
        
        if (phases[currentPhaseIndex].phase === 'greeting') {
          setIsVideoLoading(false);
          setIsVideoPlaying(true);
        }
        
        if (phases[currentPhaseIndex].phase === 'complete') {
          setIsVideoPlaying(false);
          setShowProceedButton(true);
        }
        
        if (currentPhaseIndex < phases.length - 1) {
          setTimeout(advancePhase, phases[currentPhaseIndex].duration);
        }
      }
    };

    setTimeout(advancePhase, phases[0].duration);
  }, []);

  const getVideoContent = () => {
    switch (videoPhase) {
      case 'greeting':
        return {
          text: `Hello ${userName}! I'm Rohan Vyas, your AI investor. ${isFirstTime ? "Welcome to AgentVC!" : "Great to see you again!"}`,
          highlight: userName
        };
      case 'company_intro':
        return {
          text: `${companyName ? `I see you're working on ${companyName} - that's exciting!` : ''} I'm here to help you perfect your pitch through realistic investor conversations.`,
          highlight: companyName || 'your startup'
        };
      case 'upload_suggestion':
        return {
          text: `${isFirstTime ? "Let's start by uploading your pitch deck so I can understand your business better." : "Feel free to upload a new deck or we can work with your existing materials."} I'll analyze it and then we can practice your pitch together.`,
          highlight: 'pitch deck'
        };
      default:
        return {
          text: "Preparing your personalized introduction...",
          highlight: ''
        };
    }
  };

  const content = getVideoContent();

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
            <Video className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">
              {isFirstTime ? 'Meet Your AI Investor' : 'Welcome Back'}
            </span>
          </motion.div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {isFirstTime ? `Hello ${userName}! 👋` : `Welcome back, ${userName}! 👋`}
          </h2>
          <p className="text-slate-400">
            {isFirstTime 
              ? "Let me introduce myself and explain how I can help you raise capital faster"
              : "Ready to continue your pitch practice journey?"
            }
          </p>
        </div>

        {/* Tavus Video Container */}
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

              {/* Simulated Tavus Video Player */}
              {!isVideoLoading && (
                <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  {/* Rohan Avatar */}
                  <div className="text-center">
                    <motion.div 
                      className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 rounded-full overflow-hidden border-4 border-indigo-500/30"
                      animate={isVideoPlaying ? { scale: [1, 1.02, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <img
                        src="/5874fe52-4169-461c-aff3-3c84ab6638fc.png"
                        alt="Rohan Vyas"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    
                    {/* Dynamic Speech Bubble */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={videoPhase}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto"
                      >
                        <p className="text-white text-sm sm:text-base leading-relaxed">
                          "{content.text}"
                        </p>
                      </motion.div>
                    </AnimatePresence>

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
                  <p className="text-xs sm:text-sm text-indigo-400">Your AI Investor • Available 24/7</p>
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
                onClick={onComplete}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isFirstTime ? 'Continue to Upload Deck' : 'Continue Journey'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              
              {onSkip && !isFirstTime && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSkip}
                  className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/30"
                >
                  Skip for Now
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

export default TavusAgentIntro;