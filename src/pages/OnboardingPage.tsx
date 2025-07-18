import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDropzone, FileRejection } from 'react-dropzone';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { ClipLoader } from 'react-spinners';
import { User, Building, Globe, Linkedin, Briefcase, DollarSign, Target, MessageSquare, Upload, FileText, X, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    startupName: '',
    website: '',
    linkedin: '',
    industry: '',
    fundingRound: '',
    fundingAmount: '',
    oneLiner: '',
    immediateGoals: ''
  });

  // Handle profile form submission (Step 1)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to complete onboarding.");
      return;
    }
    setLoading(true);
    setError('');

    // Prepare data for the 'profiles' table update.
    const profileData = {
      id: user.id,
      full_name: formData.fullName || 'Demo User',
      website: formData.website || 'https://example.com',
      linkedin_url: formData.linkedin || 'https://linkedin.com/in/demouser',
      industry: formData.industry || 'AI & SaaS',
      fundraise_stage: `${formData.fundingRound || 'Seed'}, ${formData.fundingAmount || '$500k'}`,
      one_liner: formData.oneLiner || 'The best demo company for testing app flows.',
      use_of_funds: formData.immediateGoals || 'To test the application flow quickly and efficiently.',
      startup_name: formData.startupName || 'Demo Startup'
    };

    // Prepare data for the 'companies' table insert
    const companyData = {
      name: formData.startupName || 'Demo Startup',
      industry: formData.industry || 'AI & SaaS',
      stage: formData.fundingRound || 'Seed',
      funding_round: formData.fundingRound || 'Seed',
      funding_amount: formData.fundingAmount || '$500k',
      one_liner: formData.oneLiner || 'The best demo company for testing app flows.',
      website: formData.website || 'https://example.com',
      user_id: user.id,
    };

    try {
      console.log("Submitting profile data for user:", user);

      // Use 'upsert' to create or update the profile row.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) throw profileError;

      // Check if company already exists, if so update it, otherwise create new one
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      let companyUpsertData;
      if (existingCompany) {
        // Update existing company
        const { data, error: updateError } = await supabase
          .from('companies')
          .update(companyData)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        companyUpsertData = data;
      } else {
        // Create new company
        const { data, error: insertError } = await supabase
          .from('companies')
          .insert(companyData)
          .select()
          .single();
        
        if (insertError) throw insertError;
        companyUpsertData = data;
      }



      // Store company ID for pitch deck upload
      setCompanyId(companyUpsertData.id);

      // Move to step 2 (pitch deck upload)
      setCurrentStep(2);

    } catch (err: any) {
      console.error("Profile submission error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle pitch deck upload (Step 2)
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError('');
    setAcceptedFile(null);

    if (fileRejections.length > 0) {
      setError('File rejected. Please ensure it is a PDF and under 10MB.');
      return;
    }

    if (acceptedFiles.length > 0) {
      setAcceptedFile(acceptedFiles[0]);
    }
  }, []);

  const handlePitchDeckUpload = async () => {
    if (!acceptedFile || !user || !companyId) return;

    setLoading(true);
    setError('');

    try {
      const fileName = `${user.id}/${companyId}/${Date.now()}_${acceptedFile.name}`;

      // 1. Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pitchdecks')
        .upload(fileName, acceptedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // 2. Create a record in the 'pitches' table
      const { data: newPitchRecord, error: dbError } = await supabase
        .from('pitches')
        .insert({
          company_id: companyId,
          pitch_deck_storage_path: uploadData.path,
          status: 'processing',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Invoke the Edge Function for processing
      const { error: invokeError } = await supabase.functions.invoke('pdf-text-extractor', {
        body: { record: newPitchRecord },
      });

      if (invokeError) {
        await supabase.from('pitches').update({ status: 'failed' }).eq('id', newPitchRecord.id);
        throw new Error(`Processing failed to start: ${invokeError.message}`);
      }

      setUploadSuccess(true);

      // Complete onboarding after successful upload
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to upload and process pitch deck');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setAcceptedFile(null);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: loading,
  });

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Tell us about yourself</h2>
        <p className="text-slate-400">This will help us tailor the experience for you.</p>
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
            <span className="text-indigo-400 font-medium">Profile</span>
            <div className="w-8 h-1 bg-slate-600 rounded"></div>
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-slate-400 text-sm font-medium">2</div>
            <span className="text-slate-400">Pitch Deck</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Jane Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Startup Name
            </label>
            <input
              name="startupName"
              value={formData.startupName}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., AgentVC Inc."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </label>
            <input
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
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
              name="linkedin"
              type="url"
              value={formData.linkedin}
              onChange={handleInputChange}
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
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., SaaS, Fintech, AI"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Funding Round
            </label>
            <select
              name="fundingRound"
              value={formData.fundingRound}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">Select funding round</option>
              <option value="Angel Round">Angel Round</option>
              <option value="Seed/Pre-Seed Round">Seed/Pre-Seed Round</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Funding Amount
            </label>
            <input
              name="fundingAmount"
              value={formData.fundingAmount}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., $500k, $2M, $10M"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              One Liner
            </label>
            <input
              name="oneLiner"
              value={formData.oneLiner}
              onChange={handleInputChange}
              className="input-field"
              placeholder="A short, catchy description of your startup"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Immediate Goals
          </label>
          <textarea
            name="immediateGoals"
            value={formData.immediateGoals}
            onChange={handleInputChange}
            className="input-field"
            placeholder="What are you hoping to achieve in the next 3-6 months?"
            rows={3}
          />
        </div>

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
              <span>Continue to Pitch Deck</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Upload Your Pitch Deck</h2>
        <p className="text-slate-400">Upload your pitch deck to complete onboarding and get AI analysis.</p>
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-green-400 font-medium">Profile</span>
            <div className="w-8 h-1 bg-indigo-500 rounded"></div>
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
            <span className="text-indigo-400 font-medium">Pitch Deck</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${isDragActive ? 'border-indigo-400 bg-indigo-500/10' :
            'border-slate-600 hover:border-indigo-400 hover:bg-indigo-500/10 cursor-pointer'
            }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            {loading ? (
              <ClipLoader color="#6366f1" size={48} className="mx-auto" />
            ) : (
              <Upload className="w-12 h-12 text-slate-400 mx-auto" />
            )}
            <h3 className="text-lg font-semibold text-white">
              {loading ? 'Uploading & Analyzing...' : 'Drag & drop your PDF here'}
            </h3>
            {!loading && (
              <p className="text-slate-400">
                or{' '}
                <button
                  type="button"
                  onClick={open}
                  className="text-indigo-400 font-medium hover:underline"
                >
                  browse files
                </button>{' '}
                to upload
              </p>
            )}
          </div>
        </div>

        {acceptedFile && !uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <p className="text-sm text-white truncate">{acceptedFile.name}</p>
            </div>
            {!loading && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={removeFile}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </motion.div>
        )}

        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-300">Pitch deck uploaded successfully! Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentStep(1)}
            disabled={loading}
            className="btn-secondary py-3 px-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          {acceptedFile && !uploadSuccess && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePitchDeckUpload}
              disabled={loading}
              className="flex-1 btn-primary py-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <ClipLoader color="#ffffff" size={20} />
                  <span>Uploading & Analyzing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Complete Onboarding</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );

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
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </motion.div>
          )}

          {currentStep === 1 ? renderStep1() : renderStep2()}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;
