-- Pantheon Capital Management - passage en espace de travail partagé
-- Remplace l'isolation "1 compte = 1 espace privé" (supabase-auth-migration.sql)
-- par un espace commun : tout utilisateur connecté (authenticated) peut lire
-- et modifier toutes les lignes, quel que soit qui les a créées.
-- À exécuter une seule fois dans Supabase > SQL Editor.

BEGIN;

-- Supprime les policies "propriétaire uniquement" existantes.
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

-- RLS reste activée (empêche tout accès anonyme / non authentifié),
-- mais tout utilisateur connecté a accès à toutes les lignes.
CREATE POLICY "Authenticated users can read all team"
  ON public.team FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Authenticated users can create team"
  ON public.team FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Authenticated users can update team"
  ON public.team FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete team"
  ON public.team FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all tasks"
  ON public.tasks FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all projects"
  ON public.projects FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all okrs"
  ON public.okrs FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Authenticated users can create okrs"
  ON public.okrs FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Authenticated users can update okrs"
  ON public.okrs FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete okrs"
  ON public.okrs FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all notes"
  ON public.notes FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Authenticated users can create notes"
  ON public.notes FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Authenticated users can update notes"
  ON public.notes FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete notes"
  ON public.notes FOR DELETE TO authenticated
  USING (true);

COMMIT;

-- Remarque : la colonne owner_id est conservée (elle sert juste de "créé par",
-- via son DEFAULT auth.uid()) mais n'est plus utilisée pour restreindre l'accès.
-- Si un jour vous voulez revenir à des espaces séparés par équipe, il suffira
-- de réappliquer des policies filtrant sur owner_id ou sur un futur workspace_id.
