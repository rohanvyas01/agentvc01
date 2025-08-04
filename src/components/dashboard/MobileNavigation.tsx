import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  MessageSquare, 
  Upload, 
  User, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavigationProps {
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      description: 'Your main hub'
    },
    {
      id: 'pitch',
      label: 'Pitch to Rohan',
      icon: MessageSquare,
      path: '/setup',
      description: 'Start practice session'
    },
    {
      id: 'upload',
      label: 'Upload Deck',
      icon: Upload,
      path: '/upload',
      description: 'Add new pitch deck'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/onboarding',
      description: 'Edit your info'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed top-4 right-4 z-40 p-3 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 text-white ${className}`}
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Navigation Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                <div>
                  <h2 className="text-xl font-bold text-white">Navigation</h2>
                  <p className="text-sm text-slate-400">Quick access menu</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isCurrent = isCurrentPath(item.path);
                  
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200
                        ${isCurrent 
                          ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' 
                          : 'bg-slate-800/30 hover:bg-slate-700/50 text-white border border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`
                          p-2 rounded-lg
                          ${isCurrent 
                            ? 'bg-indigo-500/20 text-indigo-400' 
                            : 'bg-slate-700/50 text-slate-400'
                          }
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-slate-400">{item.description}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </motion.button>
                  );
                })}
              </div>

              {/* User Info */}
              {user && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
                  <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                      <User className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {user.email}
                      </div>
                      <div className="text-xs text-slate-400">
                        Signed in
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;