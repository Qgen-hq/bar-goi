import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yyzsxsnnnrcwinajidjs.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5enN4c25ubnJjd2luYWppZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NjE5MTAsImV4cCI6MjEwMTQzNzkxMH0.lBARHow7cm_8BA4xwEsRGbJXiZHMgLj4mc3o7MptjMo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
