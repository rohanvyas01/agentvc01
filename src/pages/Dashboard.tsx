import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import PitchDeckUploader from '../components/PitchDeckUploader.tsx';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Using useCallback to memoize the fetch function
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [companyRes, profileRes] = await Promise.all([
        supabase.from('companies').select('*').eq('user_id', user.id).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single()
      ]);

      if (companyRes.error && companyRes.error.code !== 'PGRST116') throw companyRes.error;
      if (profileRes.error) throw profileRes.error;

      if (!companyRes.data) {
        navigate('/onboarding');
        return;
      }
      if (!profileRes.data) {
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
  }, [user, navigate]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  /**
   * THIS IS THE FIX: A handler function to pass to the uploader.
   * In the future, this function can be used to refresh the list of pitch decks
   * on the dashboard after a new one is uploaded.
   */
  const handleUploadSuccess = () => {
    console.log('Upload successful, refreshing data...');
    // You could add a toast notification here for better UX
    fetchData(); // Refetch data to show the new pitch deck status
  };

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
        
        {/* Provide PitchDeckUploader for the single company */}
        {company && (
          <PitchDeckUploader companyId={company.id} onUploadSuccess={handleUploadSuccess} />
        )}

        {/* You can add a component here to list and show the status of uploaded decks */}
      </div>
    </div>
  );
};

export default Dashboard;
