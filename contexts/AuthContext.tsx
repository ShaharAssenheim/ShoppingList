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
    let timeoutId: NodeJS.Timeout;

    // Check current session
    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing auth...');
        
        // Set a timeout to force loading to false after 5 seconds
        timeoutId = setTimeout(() => {
          console.warn('[Auth] Timeout - forcing loading to false');
          if (mounted) {
            setLoading(false);
          }
        }, 5000);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Clear timeout if we got a response
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('[Auth] Session error:', error);
          if (mounted) {
            setCurrentUser(null);
            setAuthError(error.message);
            setLoading(false);
          }
          return;
        }

        console.log('[Auth] Session:', session ? 'Found' : 'None');
        
        if (session?.user) {
          console.log('[Auth] User found:', session.user.email);
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
          console.log('[Auth] No user session');
          if (mounted) {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('[Auth] Initialization error:', err);
        if (mounted) {
          setCurrentUser(null);
        }
      } finally {
        if (mounted) {
          console.log('[Auth] Setting loading to false');
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[Auth] State change:', _event);
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
      clearTimeout(timeoutId);
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