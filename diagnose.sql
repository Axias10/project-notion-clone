-- Script de diagnostic pour comprendre le problème
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier la structure des colonnes ID
SELECT
    table_name,
    column_name,
    data_type,
    column_default,
    is_identity,
    identity_generation
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
  AND table_name IN ('tasks', 'projects', 'team', 'okrs')
ORDER BY table_name;

-- 2. Vérifier les séquences existantes
SELECT
    schemaname,
    sequencename,
    last_value
FROM pg_sequences
WHERE schemaname = 'public'
  AND sequencename LIKE '%_id_seq';

-- 3. Essayer d'insérer une tâche de test SANS spécifier l'ID
-- Si cela échoue, le problème vient de la configuration de la table
INSERT INTO tasks (title, status, priority)
VALUES ('Test de diagnostic', 'todo', 'low')
RETURNING id, title;

-- Si l'insert ci-dessus a réussi, afficher les résultats
SELECT 'Diagnostic terminé. Vérifiez les résultats ci-dessus.' AS message;
