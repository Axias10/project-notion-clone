-- Script pour convertir les colonnes ID de INTEGER vers BIGINT
-- À exécuter dans le SQL Editor de Supabase

-- Convertir la colonne id de tasks en BIGINT
ALTER TABLE tasks
ALTER COLUMN id TYPE BIGINT;

-- Convertir la colonne id de projects en BIGINT
ALTER TABLE projects
ALTER COLUMN id TYPE BIGINT;

-- Convertir la colonne id de team en BIGINT
ALTER TABLE team
ALTER COLUMN id TYPE BIGINT;

-- Convertir la colonne id de okrs en BIGINT
ALTER TABLE okrs
ALTER COLUMN id TYPE BIGINT;

-- Optionnel : Recréer les séquences pour utiliser BIGSERIAL
-- Cela garantit que les futurs IDs seront des BIGINT
DROP SEQUENCE IF EXISTS tasks_id_seq CASCADE;
CREATE SEQUENCE tasks_id_seq AS BIGINT;
ALTER TABLE tasks ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq');
ALTER SEQUENCE tasks_id_seq OWNED BY tasks.id;
SELECT setval('tasks_id_seq', COALESCE(MAX(id), 0) + 1, false) FROM tasks;

DROP SEQUENCE IF EXISTS projects_id_seq CASCADE;
CREATE SEQUENCE projects_id_seq AS BIGINT;
ALTER TABLE projects ALTER COLUMN id SET DEFAULT nextval('projects_id_seq');
ALTER SEQUENCE projects_id_seq OWNED BY projects.id;
SELECT setval('projects_id_seq', COALESCE(MAX(id), 0) + 1, false) FROM projects;

DROP SEQUENCE IF EXISTS team_id_seq CASCADE;
CREATE SEQUENCE team_id_seq AS BIGINT;
ALTER TABLE team ALTER COLUMN id SET DEFAULT nextval('team_id_seq');
ALTER SEQUENCE team_id_seq OWNED BY team.id;
SELECT setval('team_id_seq', COALESCE(MAX(id), 0) + 1, false) FROM team;

DROP SEQUENCE IF EXISTS okrs_id_seq CASCADE;
CREATE SEQUENCE okrs_id_seq AS BIGINT;
ALTER TABLE okrs ALTER COLUMN id SET DEFAULT nextval('okrs_id_seq');
ALTER SEQUENCE okrs_id_seq OWNED BY okrs.id;
SELECT setval('okrs_id_seq', COALESCE(MAX(id), 0) + 1, false) FROM okrs;

-- Afficher un message de confirmation
SELECT 'Colonnes ID converties en BIGINT avec succès!' AS message;
