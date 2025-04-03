import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire app
// In a real app, you would use environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your_supabase_url';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 