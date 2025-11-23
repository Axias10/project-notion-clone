-- Script pour vérifier et corriger les séquences auto-increment
-- À exécuter dans le SQL Editor de Supabase

-- D'abord, vérifier les colonnes ID et leurs valeurs par défaut
SELECT
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
  AND table_name IN ('tasks', 'projects', 'team', 'okrs');

-- Recréer les séquences et les lier correctement aux colonnes ID

-- Pour la table tasks
DROP SEQUENCE IF EXISTS tasks_id_seq CASCADE;
CREATE SEQUENCE tasks_id_seq;
ALTER TABLE tasks ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq'::regclass);
ALTER SEQUENCE tasks_id_seq OWNED BY tasks.id;
-- Réinitialiser la séquence au bon numéro (max actuel + 1)
SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 0) + 1, false);

-- Pour la table projects
DROP SEQUENCE IF EXISTS projects_id_seq CASCADE;
CREATE SEQUENCE projects_id_seq;
ALTER TABLE projects ALTER COLUMN id SET DEFAULT nextval('projects_id_seq'::regclass);
ALTER SEQUENCE projects_id_seq OWNED BY projects.id;
SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 0) + 1, false);

-- Pour la table team
DROP SEQUENCE IF EXISTS team_id_seq CASCADE;
CREATE SEQUENCE team_id_seq;
ALTER TABLE team ALTER COLUMN id SET DEFAULT nextval('team_id_seq'::regclass);
ALTER SEQUENCE team_id_seq OWNED BY team.id;
SELECT setval('team_id_seq', COALESCE((SELECT MAX(id) FROM team), 0) + 1, false);

-- Pour la table okrs
DROP SEQUENCE IF EXISTS okrs_id_seq CASCADE;
CREATE SEQUENCE okrs_id_seq;
ALTER TABLE okrs ALTER COLUMN id SET DEFAULT nextval('okrs_id_seq'::regclass);
ALTER SEQUENCE okrs_id_seq OWNED BY okrs.id;
SELECT setval('okrs_id_seq', COALESCE((SELECT MAX(id) FROM okrs), 0) + 1, false);

-- Vérifier que tout est bien configuré
SELECT
    table_name,
    column_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
  AND table_name IN ('tasks', 'projects', 'team', 'okrs');

-- Afficher un message de confirmation
SELECT 'Séquences configurées avec succès! Les IDs devraient maintenant s''auto-incrémenter correctement.' AS message;
