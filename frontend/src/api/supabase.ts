import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://glhiongwwrflwibpxghe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsaGlvbmd3d3JmbHdpYnB4Z2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjExODIsImV4cCI6MjA5MTMzNzE4Mn0.Hay8iLsGWRPfsNmy9jAmxDfM-_WAnMd7LmdOFTg5444';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
