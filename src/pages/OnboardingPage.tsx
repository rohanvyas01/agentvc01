import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { ClipLoader } from 'react-spinners';
import { Loader, User, Building, Globe, Linkedin, Briefcase, DollarSign, Target, MessageSquare } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    startupName: '',
    website: '',
    linkedin: '',
    industry: '',
    fundraiseStage: '',
    oneLiner: '',
    immediateGoals: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setError("You must be logged in to complete onboarding.");
        return;
    }
    setLoading(true);
    setError('');

    // Prepare data for the 'profiles' table update.
    const profileData = {
      id: user.id, // This correctly identifies the row to update.
      // user_id: user.id, // THIS LINE WAS THE PROBLEM AND HAS BEEN REMOVED.
      full_name: formData.fullName || 'Demo User',
      website: formData.website || 'https://example.com',
      linkedin_url: formData.linkedin || 'https://linkedin.com/in/demouser',
      industry: formData.industry || 'AI & SaaS',
      fundraise_stage: formData.fundraiseStage || 'Seed Round, $500k',
      one_liner: formData.oneLiner || 'The best demo company for testing app flows.',
      immediate_goals: formData.immediateGoals || 'To test the application flow quickly and efficiently.',
      startup_name: formData.startupName || 'Demo Startup'
    };
    
    // Prepare data for the 'companies' table insert
    const companyData = {
      name: formData.startupName || 'Demo Startup',
      user_id: user.id,
    };

    try {
      console.log("Submitting onboarding data for user:", user);
      console.log("Profile data:", profileData);
      console.log("Company data:", companyData);

      // Use 'upsert' to create or update the profile row.
      const { data: profileUpsertData, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      console.log("Profile upsert response:", { data: profileUpsertData, error: profileError });
      if (profileError) throw profileError;

      // Upsert a company record for the user (1 user : 1 company)
      const { data: companyUpsertData, error: companyError } = await supabase
        .from('companies')
        .upsert(companyData, { onConflict: 'user_id' });

      console.log("Company upsert response:", { data: companyUpsertData, error: companyError });
      if (companyError) throw companyError;

      // Navigate to the dashboard on success
      console.log("Onboarding successful, navigating to dashboard.");
      
      // Mark that user just completed onboarding for first-time flow
      if (user) {
        localStorage.setItem(`just_completed_onboarding_${user.id}`, 'true');
      }
      
      // Use window.location for reliable navigation
      window.location.href = '/dashboard';

    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      
      {/* Background matching landing page */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl glass rounded-2xl p-8 border border-slate-700/30"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-2">Tell us about yourself</h2>
            <p className="text-slate-400">This will help us tailor the experience for you.</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
              <input
                name="fullName" value={formData.fullName} onChange={handleInputChange}
                  className="input-field"
                placeholder="e.g., Jane Doe"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Startup Name
                </label>
              <input
                name="startupName" value={formData.startupName} onChange={handleInputChange}
                  className="input-field"
                placeholder="e.g., AgentVC Inc."
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
              <input
                name="website" type="url" value={formData.website} onChange={handleInputChange}
                  className="input-field"
                placeholder="https://yourstartup.com"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </label>
              <input
                name="linkedin" type="url" value={formData.linkedin} onChange={handleInputChange}
                  className="input-field"
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Industry
                </label>
              <input
                name="industry" value={formData.industry} onChange={handleInputChange}
                  className="input-field"
                placeholder="e.g., SaaS, Fintech, AI"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Fundraise Stage/Amount
                </label>
              <input
                name="fundraiseStage" value={formData.fundraiseStage} onChange={handleInputChange}
                  className="input-field"
                placeholder="e.g., Pre-seed, $500k"
              />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  One Liner
                </label>
              <input
                name="oneLiner" value={formData.oneLiner} onChange={handleInputChange}
                  className="input-field"
                placeholder="A short, catchy description of your startup"
              />
            </div>
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Immediate Goals
              </label>
            <textarea
              name="immediateGoals" value={formData.immediateGoals} onChange={handleInputChange}
                className="input-field"
              placeholder="What are you hoping to achieve in the next 3-6 months?"
              rows={3}
            />
          </div>

          {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 p-3 rounded-lg"
              >
              {error}
              </motion.div>
          )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
              className="w-full btn-primary py-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
              {loading ? (
                <>
                  <ClipLoader color="#ffffff" size={20} />
                  <span>Setting up your profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Onboarding</span>
                  <Target className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;
