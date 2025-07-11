import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  // Use the auth context to get user and signOut function
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 header-glass border-b border-slate-700/30 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Left-aligned Logo */}
          <div className="flex items-center gap-2 sm:gap-3 group">
             <motion.div
              className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg flex items-center justify-center overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src="/AVC logo.png"
                alt="AgentVC Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>
            <motion.span
              className="text-xl sm:text-2xl lg:text-2xl font-bold text-white"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              AgentVC
            </motion.span>
          </div>

          {/* Right-aligned Navigation */}
          <div className="flex items-center gap-3 sm:gap-6">
            <motion.a
              href="#features"
              className="hidden sm:block text-white hover:text-indigo-400 transition-all duration-300 font-medium"
              whileHover={{ y: -1 }}
            >
              Features
            </motion.a>

            {/* Conditional rendering based on user state */}
            {user ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={signOut}
                className="bg-gradient-to-r from-red-500/50 to-pink-500/50 hover:from-red-600/60 hover:to-pink-600/60 text-white font-medium px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/30 backdrop-blur-sm text-sm sm:text-base"
              >
                <div className="relative z-10 flex items-center gap-1 sm:gap-2">
                  <span>Sign Out</span>
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignIn}
                className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-600/60 hover:to-slate-500/60 text-white font-medium px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/30 backdrop-blur-sm text-sm sm:text-base"
              >
                <div className="relative z-10 flex items-center gap-1 sm:gap-2">
                  <span>Sign In</span>
                  <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
