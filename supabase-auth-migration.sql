-- Pantheon Capital Management - isolation des données par compte Supabase Auth
-- À exécuter une seule fois dans Supabase > SQL Editor.
-- Créez d'abord le premier utilisateur dans Authentication > Users.

BEGIN;

ALTER TABLE public.team
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.okrs
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.team ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE public.tasks ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE public.projects ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE public.okrs ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE public.notes ALTER COLUMN owner_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS team_owner_id_idx ON public.team(owner_id);
CREATE INDEX IF NOT EXISTS tasks_owner_id_idx ON public.tasks(owner_id);
CREATE INDEX IF NOT EXISTS projects_owner_id_idx ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS okrs_owner_id_idx ON public.okrs(owner_id);
CREATE INDEX IF NOT EXISTS notes_owner_id_idx ON public.notes(owner_id);

ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Supprime les anciennes politiques permissives avant de créer les règles privées.
DO $$
DECLARE
  target_table TEXT;
  existing_policy TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY['team', 'tasks', 'projects', 'okrs', 'notes']
  LOOP
    FOR existing_policy IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = target_table
    LOOP
      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON public.%I',
        existing_policy,
        target_table
      );
    END LOOP;
  END LOOP;
END
$$;

CREATE POLICY "Users can read own team"
  ON public.team FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can create own team"
  ON public.team FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can update own team"
  ON public.team FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can delete own team"
  ON public.team FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can read own tasks"
  ON public.tasks FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can create own tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can read own projects"
  ON public.projects FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can read own okrs"
  ON public.okrs FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can create own okrs"
  ON public.okrs FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can update own okrs"
  ON public.okrs FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can delete own okrs"
  ON public.okrs FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can read own notes"
  ON public.notes FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can create own notes"
  ON public.notes FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);
CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

COMMIT;
