-- Pantheon Capital Management - rattachement des données historiques au premier compte
-- Si un seul utilisateur existe, son UUID est détecté automatiquement.
-- S'il y en a plusieurs, renseignez target_user_id ci-dessous.
-- Exécutez ce script après supabase-auth-migration.sql.

BEGIN;

DO $$
DECLARE
  target_user_id UUID := NULL;
  user_count INTEGER;
BEGIN
  IF target_user_id IS NULL THEN
    SELECT COUNT(*) INTO user_count FROM auth.users;

    IF user_count = 0 THEN
      RAISE EXCEPTION 'Créez d abord un utilisateur dans Authentication > Users.';
    ELSIF user_count = 1 THEN
      SELECT id INTO target_user_id FROM auth.users LIMIT 1;
    ELSE
      RAISE EXCEPTION
        'Plusieurs utilisateurs existent. Renseignez target_user_id avec l UUID du compte propriétaire.';
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Aucun utilisateur Supabase ne correspond à cet UUID.';
  END IF;

  UPDATE public.team
    SET owner_id = target_user_id
    WHERE owner_id IS NULL;
  UPDATE public.tasks
    SET owner_id = target_user_id
    WHERE owner_id IS NULL;
  UPDATE public.projects
    SET owner_id = target_user_id
    WHERE owner_id IS NULL;
  UPDATE public.okrs
    SET owner_id = target_user_id
    WHERE owner_id IS NULL;
  UPDATE public.notes
    SET owner_id = target_user_id
    WHERE owner_id IS NULL;
END
$$;

ALTER TABLE public.team ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.tasks ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.projects ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.okrs ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.notes ALTER COLUMN owner_id SET NOT NULL;

COMMIT;

SELECT 'Données rattachées et owner_id verrouillé' AS result;
