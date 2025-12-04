"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, createOrUpdateUserProfile } from '../services/supabase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Always create/update the profile, including Google sign-ins (auto-register)
        await createOrUpdateUserProfile(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata?.full_name
        ).catch(err => console.error('Failed to update user profile:', err));

        setCurrentUser(session.user);
        setAuthError(null);
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Auto-register Google users as well by upserting profile
        await createOrUpdateUserProfile(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata?.full_name
        ).catch(err => console.error('Failed to update user profile:', err));

        setCurrentUser(session.user);
        setAuthError(null);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      if (currentUser?.id) {
        localStorage.removeItem(`lastGroup_${currentUser.id}`);
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
      setAuthError(null);
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  const value = {
    currentUser,
    loading,
    logout,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};