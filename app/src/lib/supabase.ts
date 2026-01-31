import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yahaidxvcnsfgmmzzsmk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaGFpZHh2Y25zZmdtbXp6c21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjA3NTYsImV4cCI6MjA4NTIzNjc1Nn0.XGWdqG4Rh1QwsOUsX-N88VjWfvQxIzslHE_w5OzTQA4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string;
  category_id: string;
  availability: 'pronta-entrega' | 'por-encomenda';
  description: string | null;
  in_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DbCredentials {
  id: string;
  username: string;
  password: string;
}
