import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - Utilise les variables d'environnement en priorité
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vbvsqnyakrdswaeeqyxl.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidnNxbnlha3Jkc3dhZWVxeXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDczMjgsImV4cCI6MjA3OTEyMzMyOH0.vyr_i2HG9MJEW2XS-il8kPQCSCvlWWG2yLnmVRMSrkw";

// Créer le client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Types
export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  assignee?: string; // Legacy field - keep for backward compatibility
  assigned_to?: number[]; // New field - array of team member IDs
  due_date?: string;
  created_at?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed';
  progress: number;
  assigned_to?: number[]; // Array of team member IDs
  deadline?: string;
  created_at?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  created_at?: string;
}

export interface KeyResult {
  description: string;
  progress: number;
  target: number;
}

export interface OKR {
  id: number;
  objective: string;
  key_results: KeyResult[] | string;
  status: 'on-track' | 'at-risk' | 'off-track';
  quarter?: string;
  created_at?: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}
