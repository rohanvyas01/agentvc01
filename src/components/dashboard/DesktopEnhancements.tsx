import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';
import { Keyboard, Mouse, Monitor } from 'lucide-react';

interface DesktopEnhancementsProps {
  children: React.ReactNode;
}

const DesktopEnhancements: React.FC<DesktopEnhancementsProps> = ({ children }) => {
  const { isDesktop, isLargeDesktop } = useResponsive();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Keyboard shortcuts for desktop users
  useEffect(() => {
    if (!isDesktop && !isLargeDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Show keyboard shortcuts with Ctrl/Cmd + ?
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }

      // Hide shortcuts with Escape
      if (e.key === 'Escape') {
        setShowKeyboardShortcuts(false);
      }

      // Quick navigation shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            // Navigate to dashboard
            window.location.hash = '#dashboard';
            break;
          case '2':
            e.preventDefault();
            // Navigate to pitch section
            window.location.hash = '#pitch-section';
            break;
          case '3':
            e.preventDefault();
            // Navigate to session history
            window.location.hash = '#session-history';
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, isLargeDesktop]);

  // Mouse tracking for enhanced interactions
  useEffect(() => {
    if (!isDesktop && !isLargeDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isDesktop, isLargeDesktop]);

  // Don't render enhancements on mobile/tablet
  if (!isDesktop && !isLargeDesktop) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKeyboardShortcuts(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="glass rounded-2xl p-6 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-6">
                  <Keyboard className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Show this help</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Ctrl</kbd>
                      <span className="text-slate-400">+</span>
                      <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">/</kbd>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Go to Dashboard</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Ctrl</kbd>
                      <span className="text-slate-400">+</span>
                      <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">1</kbd>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Start Pitch Session</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Ctrl</kbd>
                      <span className="text-slate-400">+</span>
                      <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">2</kbd>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">View Session History</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Ctrl</kbd>
                      <span className="text-slate-400">+</span>
                      <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">3</kbd>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Close modal</span>
                    <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Esc</kbd>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-700/30">
                  <p className="text-xs text-slate-400 text-center">
                    Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-xs">Esc</kbd> to close
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop-only features indicator */}
      <div className="fixed bottom-4 right-4 z-30">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700/50 text-xs text-slate-400"
        >
          <Monitor className="w-4 h-4" />
          <span>Desktop Mode</span>
          <button
            onClick={() => setShowKeyboardShortcuts(true)}
            className="ml-2 px-2 py-1 bg-slate-700/50 rounded text-xs hover:bg-slate-600/50 transition-colors"
          >
            Ctrl+/
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default DesktopEnhancements;