import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Profile, isSupabaseConfigured } from '../lib/supabase';

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
  isSupabaseReady: boolean;
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
  const [isSupabaseReady] = useState(isSupabaseConfigured());

  useEffect(() => {
    // Check for existing session on mount
    const checkExistingSession = async () => {
      if (!isSupabaseReady) {
        setLoading(false);
        return;
      }

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
  }, [isSupabaseReady]);

  const login = async (email: string, password: string) => {
    if (!isSupabaseReady) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to continue.');
    }

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
    if (!isSupabaseReady) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to continue.');
    }

    try {
      setLoading(true);

      // Use atomic signup function
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
    if (!isSupabaseReady) {
      throw new Error('Supabase is not configured.');
    }

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
    if (!isSupabaseReady) {
      throw new Error('Supabase is not configured.');
    }

    if (!user) {
      throw new Error('No user logged in to update profile');
    }
    
    try {
      setLoading(true);

      const updatedProfile = await supabaseService.updateProfile(profileData);
      setUserProfile(updatedProfile);
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
    isSupabaseReady,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};