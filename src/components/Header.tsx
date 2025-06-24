import React from 'react';
import { motion } from 'framer-motion';
import { Bot, ExternalLink } from 'lucide-react';

const Header: React.FC = () => {
  const handleJoinWaitlist = () => {
    window.open('https://docs.google.com/forms/d/1tTsmTy3NZqoOw6cgRpzGWdRdNflcvHgQlarPLZ_k2R8/viewform', '_blank');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-50 header-glass border-b border-slate-700/30"
    >
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex justify-between items-center h-16">
          {/* Left-aligned Logo */}
          <div className="flex items-center gap-3 group">
            <motion.div 
              className="relative w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot className="w-5 h-5 text-white relative z-10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-500 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <motion.span 
              className="text-xl font-bold text-white"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              AgentVC
            </motion.span>
            <motion.span 
              className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-full font-medium"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              AI Investor
            </motion.span>
          </div>

          {/* Right-aligned Navigation */}
          <div className="flex items-center gap-6">
            <motion.a
              href="#features"
              className="text-white hover:text-indigo-400 transition-all duration-300 font-medium"
              whileHover={{ y: -1 }}
            >
              Features
            </motion.a>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinWaitlist}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="relative z-10 flex items-center gap-2">
                Join Waitlist
                <ExternalLink className="w-4 h-4" />
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;