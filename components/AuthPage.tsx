"use client";
import React, { useState, useEffect } from 'react';
import { supabase, createOrUpdateUserProfile } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const { authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Display auth error from context (e.g., Google login failed)
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Detect if we're in iOS Safari/PWA mode
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      
      // Get the full URL including protocol and path
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${baseUrl}/`;
      
      console.log('[Auth] Google sign-in started', { isIOS, isStandalone, redirectUrl });
      
      // For Google OAuth, we can't prevent signup at the OAuth level
      // So we'll check after authentication in the AuthContext
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account', // Changed from 'consent' to allow account selection
          },
          // On iOS, we need to ensure popups work correctly
          skipBrowserRedirect: false,
        }
      });
      
      if (error) {
        console.error('[Auth] Google OAuth error:', error);
        throw error;
      }
      
      // OAuth will redirect, so loading state stays true
    } catch (err: any) {
      console.error('[Auth] Google sign-in failed:', err);
      
      // More specific error messages
      if (err.message?.includes('popup')) {
        setError('חסימת חלונות קופצים פעילה. אנא אפשר חלונות קופצים ונסה שוב.');
      } else {
        setError('שגיאה בהתחברות עם גוגל. נסה שוב או השתמש באימייל וסיסמה.');
      }
      
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('אנא מלא את כל השדות');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (isLogin) {
        // Try to login
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Check if user doesn't exist
          if (error.message.includes('Invalid login credentials')) {
            setError('המשתמש לא קיים במערכת. אנא הירשם תחילה.');
            setIsLogin(false); // Switch to signup mode
          } else {
            throw error;
          }
        }
        // Success - AuthContext will handle the session
      } else {
        // Sign up then auto-login and create profile
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;

        // If email confirmations are disabled, Supabase may return a session.
        // Otherwise, perform explicit login.
        if (!data.session) {
          const login = await supabase.auth.signInWithPassword({ email, password });
          if (login.error) throw login.error;
        }

        // Create user profile (id/email available via getUser)
        const { data: userResult, error: userErr } = await supabase.auth.getUser();
        if (!userErr && userResult.user) {
          await createOrUpdateUserProfile(
            userResult.user.id,
            userResult.user.email || email,
            userResult.user.user_metadata?.full_name
          ).catch(console.error);
        }

        // Switch UI to login mode just in case and clear errors
        setIsLogin(true);
        setError('');
      }
    } catch (err: any) {
      // Better error handling
      const message = err.message || '';
      if (message.includes('Email not confirmed')) {
        setError('אנא אמת את כתובת האימייל שלך.');
      } else if (message.includes('User already registered')) {
        setError('המייל הזה כבר קיים במערכת.');
        setIsLogin(true); // Switch to login mode
      } else if (message.includes('Password should be at least')) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
      } else if (message.includes('Signup requires a valid password')) {
        setError('נדרשת סיסמה תקינה.');
      } else {
        setError(message || 'אירעה שגיאה. נסה שוב מאוחר יותר.');
      }
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-2">
            {isLogin ? 'ברוכים הבאים' : 'הרשמה מהירה'}
          </h1>
          <p className="text-slate-500">
            {isLogin ? 'התחברו כדי לנהל את רשימת הקניות' : 'צרו חשבון והתחילו לשתף רשימות'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm group disabled:opacity-50"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLogin ? 'התחבר עם Google' : 'הרשמה עם Google'}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">או</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="כתובת אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="rtl"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-right"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="סיסמה (לפחות 6 תווים)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="rtl"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-right"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'מעבד...' : (isLogin ? 'כניסה' : 'הרשמה')}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-slate-500">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
            }}
            className="hover:text-indigo-600 font-medium transition-colors"
          >
            {isLogin ? 'אין לך חשבון? הירשם כאן' : 'יש לך חשבון? התחבר כאן'}
          </button>
        </div>
      </div>
    </div>
  );
};