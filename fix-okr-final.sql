-- Script final pour corriger la table OKRs
-- À exécuter dans le SQL Editor de Supabase

-- 1. Rendre la colonne quarter optionnelle (nullable)
ALTER TABLE okrs ALTER COLUMN quarter DROP NOT NULL;

-- 2. Vérifier la structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'okrs'
ORDER BY ordinal_position;

-- 3. Test d'insertion sans quarter (avec string vide)
INSERT INTO okrs (objective, key_results, status, quarter)
VALUES (
    'Test OKR avec quarter vide',
    '[{"description":"KR Test 1","progress":10,"target":100}]',
    'on-track',
    ''
)
RETURNING id, objective, quarter;

-- 4. Test d'insertion sans quarter (avec NULL)
INSERT INTO okrs (objective, key_results, status, quarter)
VALUES (
    'Test OKR avec quarter NULL',
    '[{"description":"KR Test 2","progress":20,"target":100}]',
    'on-track',
    NULL
)
RETURNING id, objective, quarter;

-- 5. Test d'insertion complète (sans spécifier quarter)
INSERT INTO okrs (objective, key_results, status)
VALUES (
    'Test OKR sans quarter',
    '[{"description":"KR Test 3","progress":30,"target":100}]',
    'on-track'
)
RETURNING id, objective, quarter;

-- Message de confirmation
SELECT '✅ Tests terminés. Vérifiez que les 3 insertions ont réussi!' AS message;
