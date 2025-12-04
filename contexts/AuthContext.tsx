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
    let mounted = true;

    // Check current session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (mounted) {
            setCurrentUser(null);
            setAuthError(error.message);
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          // Always create/update the profile, including Google sign-ins (auto-register)
          await createOrUpdateUserProfile(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name
          ).catch(err => console.error('Failed to update user profile:', err));

          if (mounted) {
            setCurrentUser(session.user);
            setAuthError(null);
          }
        } else {
          if (mounted) {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setCurrentUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

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

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      // Clear localStorage first
      if (currentUser?.id) {
        localStorage.removeItem(`lastGroup_${currentUser.id}`);
      }
      
      // Clear badge
      if ('clearAppBadge' in navigator) {
        (navigator as any).clearAppBadge?.();
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear state
      setCurrentUser(null);
      setAuthError(null);
      
      // Force reload to clear any cached state
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to logout:', err);
      // Even if there's an error, clear local state and reload
      setCurrentUser(null);
      setAuthError(null);
      window.location.href = '/';
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