import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  user: { id: string; email: string } | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
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
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('agentvc_user');
        const savedProfile = localStorage.getItem('agentvc_profile');
        
        if (savedUser && savedProfile) {
          setUser(JSON.parse(savedUser));
          setUserProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        console.error('Error loading saved session:', error);
        localStorage.removeItem('agentvc_user');
        localStorage.removeItem('agentvc_profile');
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in localStorage
      const savedUsers = JSON.parse(localStorage.getItem('agentvc_users') || '[]');
      const existingUser = savedUsers.find((u: any) => u.email === email && u.password === password);
      
      if (!existingUser) {
        throw new Error('Invalid email or password');
      }
      
      const userData = { id: existingUser.id, email: existingUser.email };
      const profileData = existingUser.profile;
      
      setUser(userData);
      setUserProfile(profileData);
      
      // Save session
      localStorage.setItem('agentvc_user', JSON.stringify(userData));
      localStorage.setItem('agentvc_profile', JSON.stringify(profileData));
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user already exists
      const savedUsers = JSON.parse(localStorage.getItem('agentvc_users') || '[]');
      const existingUser = savedUsers.find((u: any) => u.email === email);
      
      if (existingUser) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData = { id: userId, email };
      
      const fullProfile: UserProfile = {
        id: userId,
        email,
        founder_name: profileData.founder_name,
        website: profileData.website,
        linkedin_profile: profileData.linkedin_profile,
        startup_info: profileData.startup_info || {}
      };
      
      // Save user to localStorage
      const newUser = {
        id: userId,
        email,
        password,
        profile: fullProfile,
        createdAt: new Date().toISOString()
      };
      
      savedUsers.push(newUser);
      localStorage.setItem('agentvc_users', JSON.stringify(savedUsers));
      
      setUser(userData);
      setUserProfile(fullProfile);
      
      // Save session
      localStorage.setItem('agentvc_user', JSON.stringify(userData));
      localStorage.setItem('agentvc_profile', JSON.stringify(fullProfile));
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear session
      localStorage.removeItem('agentvc_user');
      localStorage.removeItem('agentvc_profile');
      
      setUser(null);
      setUserProfile(null);
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No user logged in to update profile');
    }
    
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { startup_info, ...restProfile } = profile;
      
      const updatedProfile = {
        ...userProfile,
        ...restProfile,
        startup_info: { 
          ...userProfile?.startup_info, 
          ...startup_info 
        }
      } as UserProfile;
      
      setUserProfile(updatedProfile);
      
      // Update localStorage
      localStorage.setItem('agentvc_profile', JSON.stringify(updatedProfile));
      
      // Update in users array
      const savedUsers = JSON.parse(localStorage.getItem('agentvc_users') || '[]');
      const userIndex = savedUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        savedUsers[userIndex].profile = updatedProfile;
        localStorage.setItem('agentvc_users', JSON.stringify(savedUsers));
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