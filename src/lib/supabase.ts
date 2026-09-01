import { createClient } from '@supabase/supabase-js';

// Default Supabase config with environment fallback or mock defaults
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sample-rf-sense.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbXBsZS1yZi1zZW5zZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA5MDMwNDAwLCJleHAiOjIwMjQ2MDY0MDB9.dummy-anon-key';

export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL !== undefined &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== undefined &&
    !import.meta.env.VITE_SUPABASE_URL.includes('sample-rf-sense')
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
