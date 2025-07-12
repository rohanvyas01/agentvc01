import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, Lock, User, CheckCircle,
  ArrowRight, ArrowLeft, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    founder_name: '', // This will be used as 'fullName'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false); // New state for success message
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowConfirmationMessage(false);

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        
        // Close modal - auth context will handle navigation
        onClose();
      } else {
        const { data, error } = await signUp(formData.email, formData.password, formData.founder_name);

        if (error) throw error;

        if (data.user && !data.session) {
          // Email confirmation required
          setShowConfirmationMessage(true);
        } else {
          // User is logged in immediately, close modal
          onClose();
          // Auth context will handle navigation to onboarding
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const resetModal = () => {
    setStep(1);
    setError('');
    setShowConfirmationMessage(false);
    setFormData({ email: '', password: '', founder_name: '' });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSwitchMode = (newMode: 'login' | 'signup') => {
    resetModal();
    onSwitchMode(newMode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-indigo-500/10"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">
                {showConfirmationMessage ? 'Check Your Email' : mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            {showConfirmationMessage ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-slate-300">
                  A confirmation link has been sent to <strong className="text-white">{formData.email}</strong>.
                  Please check your inbox to complete your registration.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Simplified form for clarity */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleInputChange} required
                    className="w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-800 text-white placeholder-slate-500"
                    placeholder="founder@startup.com"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="password" name="password" value={formData.password} onChange={handleInputChange} required
                    className="w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-800 text-white placeholder-slate-500"
                    placeholder="Enter your password"
                  />
                </div>
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                      type="text" name="founder_name" value={formData.founder_name} onChange={handleInputChange} required
                      className="w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-800 text-white placeholder-slate-500"
                      placeholder="Your Full Name"
                    />
                  </div>
                )}

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
                  </motion.button>
                </div>
              </form>
            )}

            {!showConfirmationMessage && (
              <div className="mt-6 text-center text-sm">
                <p className="text-slate-400">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button onClick={() => handleSwitchMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold ml-1"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
