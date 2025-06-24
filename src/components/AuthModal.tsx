import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Lock, User, Building, Briefcase, Target, 
  DollarSign, FileText, Globe, Linkedin, ChevronDown,
  ArrowRight, ArrowLeft, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    founder_name: '',
    startup_name: '',
    website: '',
    linkedin_profile: '',
    one_liner_pitch: '',
    industry: '',
    business_model: '',
    funding_round: '',
    raise_amount: '',
    use_of_funds: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup, updateProfile } = useAuth();
  const navigate = useNavigate();

  const industries = [
    'FinTech', 'HealthTech', 'EdTech', 'SaaS', 'E-commerce', 'Marketplace',
    'AI/ML', 'Blockchain', 'IoT', 'Cybersecurity', 'CleanTech', 'FoodTech',
    'PropTech', 'RetailTech', 'TravelTech', 'Gaming', 'Media', 'Other'
  ];

  const businessModels = [
    'B2B SaaS', 'B2C Subscription', 'Marketplace', 'E-commerce', 'Freemium',
    'Enterprise Software', 'Mobile App', 'Hardware', 'Consulting', 'Other'
  ];

  const fundingRounds = [
    'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Bridge Round'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        navigate('/dashboard');
        onClose();
      } else {
        if (step === 1) {
          // Basic auth step - create account
          console.log('Step 1: Creating account with:', { email: formData.email });
          await signup(formData.email, formData.password);
          setStep(2);
        } else if (step === 2) {
          // Company & founder info step - validate required fields
          if (!formData.founder_name || !formData.startup_name) {
            setError('Please fill in all required fields');
            return;
          }
          console.log('Step 2: Moving to step 3');
          setStep(3);
        } else if (step === 3) {
          // Business context step - validate required fields
          if (!formData.one_liner_pitch || !formData.industry || !formData.business_model) {
            setError('Please fill in all required fields');
            return;
          }
          console.log('Step 3: Moving to step 4');
          setStep(4);
        } else {
          // Final step - save all data
          if (!formData.funding_round || !formData.raise_amount || !formData.use_of_funds) {
            setError('Please fill in all required fields');
            return;
          }
          
          console.log('Step 4: Saving profile data:', formData);
          
          await updateProfile({
            founder_name: formData.founder_name,
            website: formData.website,
            linkedin_profile: formData.linkedin_profile,
            startup_info: {
              startup_name: formData.startup_name,
              one_liner_pitch: formData.one_liner_pitch,
              industry: formData.industry,
              business_model: formData.business_model,
              funding_round: formData.funding_round,
              raise_amount: formData.raise_amount,
              use_of_funds: formData.use_of_funds
            }
          });
          
          console.log('Profile updated successfully');
          navigate('/dashboard');
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const resetModal = () => {
    setStep(1);
    setError('');
    setFormData({
      email: '',
      password: '',
      founder_name: '',
      startup_name: '',
      website: '',
      linkedin_profile: '',
      one_liner_pitch: '',
      industry: '',
      business_model: '',
      funding_round: '',
      raise_amount: '',
      use_of_funds: ''
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSwitchMode = (newMode: 'login' | 'signup') => {
    resetModal();
    onSwitchMode(newMode);
  };

  const getStepTitle = () => {
    if (mode === 'login') return 'Welcome Back';
    switch (step) {
      case 1: return 'Join the Waitlist';
      case 2: return 'Tell Us About You';
      case 3: return 'Your Business Context';
      case 4: return 'Funding Details';
      default: return 'Get Started';
    }
  };

  const getStepSubtitle = () => {
    if (mode === 'login') return 'Sign in to continue your pitch training';
    switch (step) {
      case 1: return 'Create your account to get started';
      case 2: return 'Help us personalize your experience';
      case 3: return 'Context helps our AI ask better questions';
      case 4: return 'Final details for investor simulation';
      default: return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="font-bold text-gray-900">AgentVC</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {getStepTitle()}
                </h2>
                <p className="text-gray-600 text-sm">
                  {getStepSubtitle()}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress bar for signup */}
            {mode === 'signup' && (
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Step {step} of 4</span>
                  <span>{Math.round((step / 4) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Basic Auth */}
              {(mode === 'login' || step === 1) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                        placeholder="founder@startup.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Company & Founder Info */}
              {mode === 'signup' && step === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="founder_name"
                        value={formData.founder_name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                        placeholder="e.g., Sarah Chen"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Startup Name *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="startup_name"
                        value={formData.startup_name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                        placeholder="e.g., TechFlow AI"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        name="linkedin_profile"
                        value={formData.linkedin_profile}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                        placeholder="https://linkedin.com/in/yourname"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Business Context */}
              {mode === 'signup' && step === 3 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      One-Liner Pitch (Elevator Pitch) *
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        name="one_liner_pitch"
                        value={formData.one_liner_pitch}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder-gray-500"
                        placeholder="We help small businesses automate their accounting with AI-powered bookkeeping software."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry / Sector *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none text-gray-900 bg-white"
                      >
                        <option value="" className="text-gray-500">Select your industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry} className="text-gray-900">{industry}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Model *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="business_model"
                        value={formData.business_model}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none text-gray-900 bg-white"
                      >
                        <option value="" className="text-gray-500">Select your business model</option>
                        {businessModels.map((model) => (
                          <option key={model} value={model} className="text-gray-900">{model}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Funding Details */}
              {mode === 'signup' && step === 4 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funding Round *
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="funding_round"
                        value={formData.funding_round}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none text-gray-900 bg-white"
                      >
                        <option value="" className="text-gray-500">Select funding stage</option>
                        {fundingRounds.map((round) => (
                          <option key={round} value={round} className="text-gray-900">{round}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raise Amount *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="raise_amount"
                        value={formData.raise_amount}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                        placeholder="e.g., $500k, $2M, $10M"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Use of Funds (Top 3 priorities) *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        name="use_of_funds"
                        value={formData.use_of_funds}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder-gray-500"
                        placeholder="1. Hire 3 engineers to accelerate product development&#10;2. Marketing and customer acquisition&#10;3. Expand to new markets"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                {mode === 'signup' && step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Loading...' : 
                   mode === 'login' ? 'Sign In' : 
                   step === 4 ? 'Complete Setup' : 'Continue'}
                  {mode === 'signup' && step < 4 && <ArrowRight className="w-4 h-4" />}
                </motion.button>
              </div>
            </form>

            {step === 1 && (
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={() => handleSwitchMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold ml-1"
                  >
                    {mode === 'login' ? 'Join the waitlist' : 'Sign in'}
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