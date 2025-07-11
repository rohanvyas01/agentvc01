import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { Loader } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    startupName: '', // Added startupName to the form state
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

    const profileData = {
      full_name: formData.fullName || 'Demo User',
      website: formData.website || 'https://example.com',
      linkedin_url: formData.linkedin || 'https://linkedin.com/in/demouser',
      industry: formData.industry || 'AI & SaaS',
      fundraise_stage: formData.fundraiseStage || 'Seed Round, $500k',
      one_liner: formData.oneLiner || 'The best demo company for testing app flows.',
      immediate_goals: formData.immediateGoals || 'To test the application flow quickly and efficiently.'
    };
    
    const companyName = formData.startupName || 'Demo Startup';

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: companyError } = await supabase
        .from('companies')
        .insert({
            name: companyName,
            user_id: user.id,
        });

      if (companyError) throw companyError;

      navigate('/dashboard');

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Tell us about yourself</h2>
          <p className="text-gray-600 mt-2">This will help us tailor the experience for you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                name="fullName" value={formData.fullName} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Startup Name</label>
              <input
                name="startupName" value={formData.startupName} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., AgentVC Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                name="website" type="url" value={formData.website} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="https://yourstartup.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              <input
                name="linkedin" type="url" value={formData.linkedin} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
             {/* --- MISSING FIELDS ADDED BACK --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <input
                name="industry" value={formData.industry} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., SaaS, Fintech, AI"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fundraise Stage/Amount</label>
              <input
                name="fundraiseStage" value={formData.fundraiseStage} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Pre-seed, $500k"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">One Liner</label>
              <input
                name="oneLiner" value={formData.oneLiner} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="A short, catchy description of your startup"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Immediate Goals</label>
            <textarea
              name="immediateGoals" value={formData.immediateGoals} onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="What are you hoping to achieve in the next 3-6 months?"
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Complete Onboarding'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
