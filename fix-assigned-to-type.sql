-- Script pour convertir les colonnes assigned_to en BIGINT[]
-- À exécuter dans le SQL Editor de Supabase

-- Vérifier d'abord les types actuels
SELECT
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'assigned_to'
  AND table_name IN ('tasks', 'projects');

-- Convertir assigned_to de INTEGER[] vers BIGINT[] pour tasks
ALTER TABLE tasks
ALTER COLUMN assigned_to TYPE BIGINT[];

-- Convertir assigned_to de INTEGER[] vers BIGINT[] pour projects
ALTER TABLE projects
ALTER COLUMN assigned_to TYPE BIGINT[];

-- Vérifier que la conversion a réussi
SELECT
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'assigned_to'
  AND table_name IN ('tasks', 'projects');

-- Message de confirmation
SELECT '✅ Colonnes assigned_to converties en BIGINT[] avec succès!' AS message;
