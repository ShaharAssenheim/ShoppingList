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

    const initAuth = async () => {
      try {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Session error:', error);
          if (mounted) {
            setAuthError(error.message);
          }
        }

        if (mounted) {
          if (session?.user) {
            console.log('[Auth] Session restored for:', session.user.email);
            setCurrentUser(session.user);
            
            // Update profile in background - don't await
            createOrUpdateUserProfile(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata?.full_name
            ).catch(err => console.error('[Auth] Profile update failed:', err));
          } else {
            console.log('[Auth] No active session found');
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('[Auth] Unexpected error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state change:', event);
      
      if (!mounted) return;

      if (session?.user) {
        setCurrentUser(session.user);
        setAuthError(null);
        
        // Update profile in background
        createOrUpdateUserProfile(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata?.full_name
        ).catch(err => console.error('[Auth] Profile update failed:', err));
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
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
      {children}
    </AuthContext.Provider>
  );
};