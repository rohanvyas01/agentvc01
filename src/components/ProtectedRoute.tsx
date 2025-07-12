import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = React.useState(true);
  const [needsOnboarding, setNeedsOnboarding] = React.useState(false);

  React.useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      // Skip onboarding check if user is already on onboarding page
      if (location.pathname === '/onboarding') {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const [profileRes, companyRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('companies').select('*').eq('user_id', user.id).maybeSingle()
        ]);

        // If either profile or company is missing, user needs onboarding
        if (!profileRes.data || !companyRes.data) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, allow access but log the issue
        setNeedsOnboarding(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [user, location.pathname]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;