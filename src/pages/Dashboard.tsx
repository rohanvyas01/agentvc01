import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PitchDeckUploader from '../components/PitchDeckUploader';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for AuthProvider to be ready
    }
    if (!user) {
      navigate('/'); // If no user, go to landing page
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch both company and profile data at the same time
        const [companyRes, profileRes] = await Promise.all([
          supabase.from('companies').select('*').eq('user_id', user.id).single(),
          supabase.from('profiles').select('*').eq('id', user.id).single()
        ]);

        if (companyRes.error && companyRes.error.code !== 'PGRST116') {
          throw companyRes.error;
        }
        if (profileRes.error) {
          throw profileRes.error;
        }

        // If no company data is found, user needs to onboard
        if (!companyRes.data) {
          navigate('/onboarding');
          return;
        }
        
        setCompany(companyRes.data);
        setProfile(profileRes.data);

      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-center p-4">
        <p className="text-red-500 font-semibold">An Error Occurred</p>
        <p className="text-gray-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome, {profile?.full_name || 'Founder'}!
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Let's analyze the pitch for <span className="font-semibold text-gray-800">{company?.name}</span>.
        </p>
        
        {company && <PitchDeckUploader companyId={company.id} onUploadSuccess={() => { /* Handle success if needed */ }} />}
      </div>
    </div>
  );
};

export default Dashboard;
