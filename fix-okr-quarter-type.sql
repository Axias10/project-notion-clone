-- Script pour vérifier et corriger le type de la colonne quarter
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier le type actuel de la colonne quarter
SELECT
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'okrs'
  AND column_name = 'quarter';

-- 2. Si quarter est INTEGER, le convertir en TEXT
DO $$
BEGIN
    -- Vérifier si quarter est de type integer
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'okrs'
          AND column_name = 'quarter'
          AND data_type IN ('integer', 'bigint', 'smallint')
    ) THEN
        -- Convertir en TEXT
        ALTER TABLE okrs ALTER COLUMN quarter TYPE TEXT USING quarter::TEXT;
        RAISE NOTICE 'Colonne quarter convertie de INTEGER à TEXT';
    END IF;

    -- Rendre la colonne nullable
    ALTER TABLE okrs ALTER COLUMN quarter DROP NOT NULL;
    RAISE NOTICE 'Colonne quarter rendue optionnelle';
END $$;

-- 3. Vérifier la nouvelle structure
SELECT
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'okrs'
  AND column_name = 'quarter';

-- 4. Test d'insertion sans quarter
INSERT INTO okrs (objective, key_results, status)
VALUES (
    'Test OKR sans quarter',
    '[{"description":"KR Test Final","progress":50,"target":100}]',
    'on-track'
)
RETURNING id, objective, quarter, status;

-- 5. Test d'insertion avec quarter
INSERT INTO okrs (objective, key_results, status, quarter)
VALUES (
    'Test OKR avec quarter',
    '[{"description":"KR Test Final 2","progress":75,"target":100}]',
    'on-track',
    'Q1 2025'
)
RETURNING id, objective, quarter, status;

-- Message de confirmation
SELECT '✅ Type de colonne corrigé! Les OKRs devraient maintenant fonctionner.' AS message;
