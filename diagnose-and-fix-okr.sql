-- Script complet pour diagnostiquer et corriger la table OKRs
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier la structure actuelle de la table okrs
SELECT
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'okrs'
ORDER BY ordinal_position;

-- 2. Rendre la colonne quarter optionnelle si elle existe et est NOT NULL
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'okrs'
          AND column_name = 'quarter'
          AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE okrs ALTER COLUMN quarter DROP NOT NULL;
        RAISE NOTICE 'Colonne quarter rendue optionnelle';
    END IF;
END $$;

-- 3. Vérifier le type de key_results (TEXT ou JSONB)
SELECT
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'okrs'
  AND column_name = 'key_results';

-- 4. Test d'insertion simple (le format qui devrait fonctionner)
INSERT INTO okrs (objective, key_results, status)
VALUES (
    'Test OKR Diagnostic',
    '[{"description":"KR Test","progress":10,"target":100}]',
    'on-track'
)
RETURNING id, objective, key_results, status, quarter;

-- 5. Vérifier que l'insertion a réussi
SELECT id, objective, key_results, status, quarter, created_at
FROM okrs
WHERE objective = 'Test OKR Diagnostic'
ORDER BY created_at DESC
LIMIT 1;

-- Message de confirmation
SELECT '✅ Diagnostic terminé. Si l''insertion a réussi, le problème est résolu!' AS message;
