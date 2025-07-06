import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    throw new Error('Backend not implemented yet. Authentication will be available when backend is ready.');
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
    throw new Error('Backend not implemented yet. Authentication will be available when backend is ready.');
  };

  const logout = async () => {
    throw new Error('Backend not implemented yet. Authentication will be available when backend is ready.');
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
    throw new Error('Backend not implemented yet. Profile management will be available when backend is ready.');
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