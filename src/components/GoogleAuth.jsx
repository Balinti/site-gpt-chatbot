'use client';

import { useState, useEffect, useCallback } from 'react';

// Hardcoded Supabase configuration - DO NOT use env vars
const SUPABASE_URL = 'https://api.srv936332.hstgr.cloud';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
const APP_SLUG = 'site-gpt-chatbot';

export default function GoogleAuth() {
  const [user, setUser] = useState(null);
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track user login - upsert to user_tracking table
  const trackUserLogin = useCallback(async (client, userEmail) => {
    if (!client || !userEmail) return;

    try {
      // Check if user+app combo exists
      const { data: existing } = await client
        .from('user_tracking')
        .select('id, login_cnt')
        .eq('user_email', userEmail)
        .eq('app', APP_SLUG)
        .single();

      if (existing) {
        // Update existing record: increment login_cnt, update last_login_ts
        await client
          .from('user_tracking')
          .update({
            login_cnt: existing.login_cnt + 1,
            last_login_ts: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Insert new record
        await client
          .from('user_tracking')
          .insert({
            user_email: userEmail,
            app: APP_SLUG,
            login_cnt: 1,
            last_login_ts: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error tracking user login:', error);
    }
  }, []);

  // Initialize Supabase client via CDN
  useEffect(() => {
    const initSupabase = async () => {
      // Check if already loaded
      if (window.supabase) {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabaseClient(client);
        return;
      }

      // Load Supabase from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.async = true;

      script.onload = () => {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabaseClient(client);
      };

      script.onerror = () => {
        console.error('Failed to load Supabase client');
        setLoading(false);
      };

      document.head.appendChild(script);
    };

    initSupabase();
  }, []);

  // Set up auth listener once client is ready
  useEffect(() => {
    if (!supabaseClient) return;

    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        // Track login on SIGNED_IN event
        if (event === 'SIGNED_IN' && session?.user?.email) {
          await trackUserLogin(supabaseClient, session.user.email);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabaseClient, trackUserLogin]);

  const signInWithGoogle = async () => {
    if (!supabaseClient) return;

    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signOut = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
  };

  // Don't render anything while loading
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  // User is signed in
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600 dark:text-zinc-400 hidden sm:inline">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // User is not signed in - show Google Sign In button
  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
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
      Sign in with Google
    </button>
  );
}
