-- Script pour vérifier et corriger toutes les tables
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier les types de colonnes ID
SELECT
    table_name,
    column_name,
    data_type,
    udt_name,
    is_identity
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
  AND table_name IN ('tasks', 'projects', 'team', 'okrs')
ORDER BY table_name;

-- 2. Vérifier les types de colonnes assigned_to
SELECT
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'assigned_to'
  AND table_name IN ('tasks', 'projects')
ORDER BY table_name;

-- 3. Test d'insertion pour chaque table
-- Test Team
INSERT INTO team (name, role)
VALUES ('Test Member', 'Testeur')
RETURNING id, name;

-- Test OKR
INSERT INTO okrs (objective, key_results, status, quarter)
VALUES (
    'Test OKR Auto',
    '[{"description":"Test KR","progress":10,"target":100}]',
    'on-track',
    'Q1 2025'
)
RETURNING id, objective;

-- Test Task avec assigned_to
INSERT INTO tasks (title, status, priority, assigned_to)
VALUES (
    'Test Task Auto',
    'todo',
    'medium',
    ARRAY[1, 2]::BIGINT[]
)
RETURNING id, title, assigned_to;

-- Test Project avec assigned_to
INSERT INTO projects (name, status, progress, assigned_to)
VALUES (
    'Test Project Auto',
    'planning',
    0,
    ARRAY[1]::BIGINT[]
)
RETURNING id, name, assigned_to;

-- Message final
SELECT '✅ Tests terminés. Si tous les INSERT ont réussi, les tables sont correctement configurées!' AS message;
