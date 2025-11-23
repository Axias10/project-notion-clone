-- Script SÉCURISÉ pour rendre optionnelles les colonnes existantes
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier quelles colonnes existent réellement
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('tasks', 'projects', 'team', 'okrs')
ORDER BY table_name, ordinal_position;

-- 2. Rendre optionnelles SEULEMENT les colonnes qui existent

-- Table TEAM
DO $$
BEGIN
    -- Email
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'team' AND column_name = 'email'
    ) THEN
        ALTER TABLE team ALTER COLUMN email DROP NOT NULL;
    END IF;

    -- Avatar (créer si n'existe pas)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'team' AND column_name = 'avatar'
    ) THEN
        ALTER TABLE team ADD COLUMN avatar TEXT;
    ELSE
        ALTER TABLE team ALTER COLUMN avatar DROP NOT NULL;
    END IF;
END $$;

-- Table OKRS
DO $$
BEGIN
    -- Quarter
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'okrs' AND column_name = 'quarter'
    ) THEN
        ALTER TABLE okrs ALTER COLUMN quarter DROP NOT NULL;
    END IF;
END $$;

-- Table TASKS
DO $$
BEGIN
    -- Description
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'description'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN description DROP NOT NULL;
    END IF;

    -- Assignee
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'assignee'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN assignee DROP NOT NULL;
    END IF;

    -- Due date
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'due_date'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN due_date DROP NOT NULL;
    END IF;

    -- Assigned to
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE tasks ALTER COLUMN assigned_to DROP NOT NULL;
    END IF;
END $$;

-- Table PROJECTS
DO $$
BEGIN
    -- Description
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'description'
    ) THEN
        ALTER TABLE projects ALTER COLUMN description DROP NOT NULL;
    END IF;

    -- Deadline
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'deadline'
    ) THEN
        ALTER TABLE projects ALTER COLUMN deadline DROP NOT NULL;
    END IF;

    -- Assigned to
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE projects ALTER COLUMN assigned_to DROP NOT NULL;
    END IF;
END $$;

-- 3. Vérifier la structure finale
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('tasks', 'projects', 'team', 'okrs')
ORDER BY table_name, ordinal_position;

-- 4. Tests d'insertion
-- Test Team sans email
INSERT INTO team (name, role)
VALUES ('Test Member Final', 'Testeur Final')
RETURNING id, name, role, email, avatar;

-- Test OKR sans quarter
INSERT INTO okrs (objective, key_results, status)
VALUES (
    'Test OKR Final',
    '[{"description":"KR Final","progress":30,"target":100}]',
    'on-track'
)
RETURNING id, objective, quarter;

-- Message de confirmation
SELECT '✅ Colonnes optionnelles configurées! Team et OKR devraient maintenant fonctionner.' AS message;
