-- Script pour resynchroniser les colonnes IDENTITY
-- À exécuter dans le SQL Editor de Supabase

-- Les colonnes sont déjà des IDENTITY columns, on doit juste resynchroniser les séquences

-- Resynchroniser la séquence de tasks
SELECT setval(
    pg_get_serial_sequence('tasks', 'id'),
    COALESCE((SELECT MAX(id) FROM tasks), 0) + 1,
    false
);

-- Resynchroniser la séquence de projects
SELECT setval(
    pg_get_serial_sequence('projects', 'id'),
    COALESCE((SELECT MAX(id) FROM projects), 0) + 1,
    false
);

-- Resynchroniser la séquence de team
SELECT setval(
    pg_get_serial_sequence('team', 'id'),
    COALESCE((SELECT MAX(id) FROM team), 0) + 1,
    false
);

-- Resynchroniser la séquence de okrs
SELECT setval(
    pg_get_serial_sequence('okrs', 'id'),
    COALESCE((SELECT MAX(id) FROM okrs), 0) + 1,
    false
);

-- Vérifier l'état des séquences
SELECT
    'tasks' as table_name,
    pg_get_serial_sequence('tasks', 'id') as sequence_name,
    last_value
FROM pg_sequences
WHERE sequencename = (SELECT pg_get_serial_sequence('tasks', 'id')::text LIKE '%' || sequencename)
UNION ALL
SELECT
    'projects' as table_name,
    pg_get_serial_sequence('projects', 'id') as sequence_name,
    last_value
FROM pg_sequences
WHERE sequencename LIKE '%projects%'
UNION ALL
SELECT
    'team' as table_name,
    pg_get_serial_sequence('team', 'id') as sequence_name,
    last_value
FROM pg_sequences
WHERE sequencename LIKE '%team%'
UNION ALL
SELECT
    'okrs' as table_name,
    pg_get_serial_sequence('okrs', 'id') as sequence_name,
    last_value
FROM pg_sequences
WHERE sequencename LIKE '%okrs%';

-- Test d'insertion
INSERT INTO team (name, role) VALUES ('Test Auto-Increment', 'Testeur') RETURNING id, name, role;

-- Message de confirmation
SELECT '✅ Colonnes IDENTITY resynchronisées! Les IDs devraient maintenant s''auto-générer correctement.' AS message;
