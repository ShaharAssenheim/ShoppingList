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
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      try {
        // 1. Check for existing session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('[Auth] Session error:', error);
        }

        if (session?.user) {
          console.log('[Auth] Session restored:', session.user.email);
          setCurrentUser(session.user);
          
          // Update profile in background
          createOrUpdateUserProfile(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name
          ).catch(err => console.error('[Auth] Profile update failed:', err));
        }

        // 2. Set up listener for future changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[Auth] Auth state change:', event);
          
          if (!mounted) return;

          if (session?.user) {
            setCurrentUser(session.user);
            setAuthError(null);
          } else {
            setCurrentUser(null);
          }
          
          // Ensure loading is false after any auth event
          setLoading(false);
        });
        
        authSubscription = subscription;

      } catch (err) {
        console.error('[Auth] Init error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
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
      
      // No forced reload - let React handle the state change
    } catch (err) {
      console.error('Failed to logout:', err);
      setCurrentUser(null);
      setAuthError(null);
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
      {children}
    </AuthContext.Provider>
  );
};