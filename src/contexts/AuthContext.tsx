import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService, type SignUpData, type LoginData } from '../services/authService';
import type { Profile, User } from '../lib/supabase';


interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email!,
            created_at: currentUser.created_at!
          });
          
          // Load profile
          const userProfile = await authService.getProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, updating state:', session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at!
        });
        
        try {
          const userProfile = await authService.getProfile(session.user.id);
          setProfile(userProfile);
          console.log('Profile loaded:', userProfile);
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const result = await authService.signIn(data);
      // User state will be updated by the auth state change listener
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignUpData) => {
    try {
      setLoading(true);
      console.log('Starting signup process...');
      await authService.signUp(data);
      console.log('Signup completed successfully');
      // Note: User state will be updated by the auth state change listener
      // But we need to ensure the component waits for the profile to load
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      // User state will be updated by the auth state change listener
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      setLoading(true);
      const updatedProfile = await authService.updateProfile(user.id, updates);
      setProfile(updatedProfile);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
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