-- Script pour vérifier la structure de la table okrs
-- À exécuter dans le SQL Editor de Supabase

-- Vérifier la structure de la table okrs
SELECT
    column_name,
    data_type,
    udt_name,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'okrs'
ORDER BY ordinal_position;

-- Essayer d'insérer un OKR de test
INSERT INTO okrs (objective, key_results, status, quarter)
VALUES (
    'Test OKR',
    '[{"description":"Test KR","progress":50,"target":100}]',
    'on-track',
    'Q1 2025'
)
RETURNING id, objective, key_results;

-- Message de confirmation
SELECT 'Vérification de la table okrs terminée. Si l''insert a réussi, le problème est ailleurs.' AS message;
