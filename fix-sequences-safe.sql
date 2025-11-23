-- Script SÉCURISÉ pour corriger les séquences auto-increment
-- Sans supprimer les séquences existantes
-- À exécuter dans le SQL Editor de Supabase

-- D'abord, vérifier l'état actuel des colonnes ID
SELECT
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
  AND table_name IN ('tasks', 'projects', 'team', 'okrs')
ORDER BY table_name;

-- Créer les séquences si elles n'existent pas
-- (Si elles existent déjà, ces commandes ne feront rien)

DO $$
BEGIN
    -- Pour tasks
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'tasks_id_seq') THEN
        CREATE SEQUENCE tasks_id_seq;
        ALTER SEQUENCE tasks_id_seq OWNED BY tasks.id;
    END IF;
    ALTER TABLE tasks ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq'::regclass);
    PERFORM setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 0) + 1, false);

    -- Pour projects
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'projects_id_seq') THEN
        CREATE SEQUENCE projects_id_seq;
        ALTER SEQUENCE projects_id_seq OWNED BY projects.id;
    END IF;
    ALTER TABLE projects ALTER COLUMN id SET DEFAULT nextval('projects_id_seq'::regclass);
    PERFORM setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 0) + 1, false);

    -- Pour team
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'team_id_seq') THEN
        CREATE SEQUENCE team_id_seq;
        ALTER SEQUENCE team_id_seq OWNED BY team.id;
    END IF;
    ALTER TABLE team ALTER COLUMN id SET DEFAULT nextval('team_id_seq'::regclass);
    PERFORM setval('team_id_seq', COALESCE((SELECT MAX(id) FROM team), 0) + 1, false);

    -- Pour okrs
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'okrs_id_seq') THEN
        CREATE SEQUENCE okrs_id_seq;
        ALTER SEQUENCE okrs_id_seq OWNED BY okrs.id;
    END IF;
    ALTER TABLE okrs ALTER COLUMN id SET DEFAULT nextval('okrs_id_seq'::regclass);
    PERFORM setval('okrs_id_seq', COALESCE((SELECT MAX(id) FROM okrs), 0) + 1, false);
END $$;

-- Vérifier que tout est bien configuré maintenant
SELECT
    table_name,
    column_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
  AND table_name IN ('tasks', 'projects', 'team', 'okrs')
ORDER BY table_name;

-- Vérifier les valeurs des séquences
SELECT
    sequencename,
    last_value
FROM pg_sequences
WHERE schemaname = 'public'
  AND sequencename LIKE '%_id_seq'
ORDER BY sequencename;

-- Test d'insertion pour vérifier que ça marche
-- (Vous pouvez supprimer ces lignes de test après si vous voulez)
INSERT INTO team (name, role) VALUES ('Test User', 'Test Role') RETURNING id, name;

-- Afficher un message de confirmation
SELECT '✅ Séquences configurées avec succès! Vous pouvez maintenant créer des tâches, projets et membres.' AS message;
