import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabaseConfigurationError =
  !SUPABASE_URL || !SUPABASE_KEY
    ? "Les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être configurées."
    : null;

export const supabase = createClient(
  SUPABASE_URL || "https://configuration-required.supabase.co",
  SUPABASE_KEY || "configuration-required",
);

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  assignee?: string;
  assigned_to?: number[];
  due_date?: string | null;
  created_at?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: "planning" | "active" | "completed";
  progress: number;
  assigned_to?: number[];
  deadline?: string | null;
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
  status: "on-track" | "at-risk" | "off-track";
  quarter?: string | null;
  created_at?: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}
