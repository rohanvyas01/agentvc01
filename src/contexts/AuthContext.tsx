import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Profile } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  founder_name?: string;
  website?: string;
  linkedin_profile?: string;
  startup_info?: {
    startup_name?: string;
    one_liner_pitch?: string;
    industry?: string;
    business_model?: string;
    funding_round?: string;
    raise_amount?: string;
    use_of_funds?: string;
  };
}

interface AuthContextType {
  user: any | null;
  userProfile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    email: string;
    password: string;
    founder_name: string;
    startup_name: string;
    one_liner_pitch: string;
    industry: string;
    business_model: string;
    funding_round: string;
    raise_amount: string;
    use_of_funds: string;
    linkedin_profile?: string;
    website?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: {
    founder_name: string;
    startup_name: string;
    one_liner_pitch: string;
    industry: string;
    business_model: string;
    funding_round: string;
    raise_amount: string;
    use_of_funds: string;
    linkedin_profile?: string;
    website?: string;
  }) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    const checkExistingSession = async () => {
      try {
        const session = await supabaseService.getSession();
        if (session?.user) {
          const currentUser = await supabaseService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser.user);
            setUserProfile(currentUser.profile);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const result = await supabaseService.signIn(email, password);
      setUser(result.user);
      setUserProfile(result.profile);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    founder_name: string;
    startup_name: string;
    one_liner_pitch: string;
    industry: string;
    business_model: string;
    funding_round: string;
    raise_amount: string;
    use_of_funds: string;
    linkedin_profile?: string;
    website?: string;
  }) => {
    try {
      setLoading(true);

      const result = await supabaseService.signUp(userData);
      setUser(result.user);
      setUserProfile(result.profile);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      await supabaseService.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: {
    founder_name: string;
    startup_name: string;
    one_liner_pitch: string;
    industry: string;
    business_model: string;
    funding_round: string;
    raise_amount: string;
    use_of_funds: string;
    linkedin_profile?: string;
    website?: string;
  }) => {
    if (!user) {
      throw new Error('No user logged in to update profile');
    }
    
    try {
      setLoading(true);

      await supabaseService.updateProfile(profileData);
      
      // Refresh profile data
      const currentUser = await supabaseService.getCurrentUser();
      if (currentUser) {
        setUserProfile(currentUser.profile);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    login,
    signup,
    logout,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};