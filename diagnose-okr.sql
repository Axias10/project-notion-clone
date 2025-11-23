-- Script de diagnostic pour la table OKRs
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier la structure complète de la table okrs
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

-- 2. Tester différents formats d'insertion

-- Test 1: Avec key_results comme string JSON
INSERT INTO okrs (objective, key_results, status, quarter)
VALUES (
    'Test 1 - JSON String',
    '[{"description":"KR avec string","progress":10,"target":100}]',
    'on-track',
    'Q1 2025'
)
RETURNING id, objective, key_results, status;

-- Test 2: Sans quarter (optionnel)
INSERT INTO okrs (objective, key_results, status)
VALUES (
    'Test 2 - Sans quarter',
    '[{"description":"KR sans quarter","progress":20,"target":100}]',
    'on-track'
)
RETURNING id, objective, key_results, status, quarter;

-- Test 3: Avec JSONB (si la colonne est de ce type)
INSERT INTO okrs (objective, key_results, status)
VALUES (
    'Test 3 - JSONB',
    '[{"description":"KR avec JSONB","progress":30,"target":100}]'::jsonb,
    'at-risk'
)
RETURNING id, objective, key_results, status;

-- 3. Afficher tous les OKRs existants
SELECT id, objective, key_results, status, quarter, created_at
FROM okrs
ORDER BY id DESC
LIMIT 10;

-- Message final
SELECT 'Diagnostic OKR terminé. Vérifiez quel test a réussi.' AS message;
