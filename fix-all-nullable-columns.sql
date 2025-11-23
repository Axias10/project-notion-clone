-- Script pour rendre optionnelles toutes les colonnes qui devraient l'être
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier les contraintes actuelles de toutes les tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('tasks', 'projects', 'team', 'okrs')
  AND is_nullable = 'NO'
  AND column_name NOT IN ('id', 'name', 'title', 'objective', 'created_at')
ORDER BY table_name, column_name;

-- 2. Rendre optionnelles les colonnes de la table team
ALTER TABLE team
ALTER COLUMN email DROP NOT NULL;

ALTER TABLE team
ALTER COLUMN avatar DROP NOT NULL;

-- 3. Rendre optionnelles les colonnes de la table okrs
ALTER TABLE okrs
ALTER COLUMN quarter DROP NOT NULL;

-- 4. Rendre optionnelles les colonnes de la table tasks (si nécessaire)
-- Vérifier d'abord quelles colonnes sont NOT NULL
DO $$
BEGIN
    -- Description
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'description' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN description DROP NOT NULL;
    END IF;

    -- Assignee
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'assignee' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN assignee DROP NOT NULL;
    END IF;

    -- Due date
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'due_date' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN due_date DROP NOT NULL;
    END IF;

    -- Assigned to
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'assigned_to' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN assigned_to DROP NOT NULL;
    END IF;
END $$;

-- 5. Rendre optionnelles les colonnes de la table projects (si nécessaire)
DO $$
BEGIN
    -- Description
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'description' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE projects ALTER COLUMN description DROP NOT NULL;
    END IF;

    -- Deadline
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'deadline' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE projects ALTER COLUMN deadline DROP NOT NULL;
    END IF;

    -- Assigned to
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'assigned_to' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE projects ALTER COLUMN assigned_to DROP NOT NULL;
    END IF;
END $$;

-- 6. Vérifier que tous les changements ont été appliqués
SELECT
    table_name,
    column_name,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('tasks', 'projects', 'team', 'okrs')
  AND column_name IN ('email', 'avatar', 'quarter', 'description', 'assignee', 'due_date', 'assigned_to', 'deadline')
ORDER BY table_name, column_name;

-- 7. Tests d'insertion
-- Test Team sans email ni avatar
INSERT INTO team (name, role)
VALUES ('Membre Test Final', 'Designer')
RETURNING id, name, role, email, avatar;

-- Test OKR sans quarter
INSERT INTO okrs (objective, key_results, status)
VALUES (
    'OKR Test Final',
    '[{"description":"KR Test","progress":25,"target":100}]',
    'on-track'
)
RETURNING id, objective, quarter;

-- Test Task sans description ni dates
INSERT INTO tasks (title, status, priority)
VALUES ('Task Test Final', 'todo', 'low')
RETURNING id, title, description, due_date, assigned_to;

-- Test Project sans description ni deadline
INSERT INTO projects (name, status, progress)
VALUES ('Project Test Final', 'planning', 5)
RETURNING id, name, description, deadline, assigned_to;

-- Message de confirmation
SELECT '✅ Toutes les colonnes optionnelles ont été configurées correctement!' AS message;
