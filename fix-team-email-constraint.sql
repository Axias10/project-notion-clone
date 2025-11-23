-- Script pour rendre la colonne email OPTIONNELLE dans la table team
-- À exécuter dans le SQL Editor de Supabase

-- Vérifier la contrainte actuelle
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'team'
  AND column_name IN ('name', 'role', 'email', 'avatar');

-- Rendre la colonne email nullable (optionnelle)
ALTER TABLE team
ALTER COLUMN email DROP NOT NULL;

-- Vérifier que le changement a été appliqué
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'team'
  AND column_name = 'email';

-- Test d'insertion sans email
INSERT INTO team (name, role)
VALUES ('Test Member Sans Email', 'Développeur')
RETURNING id, name, role, email;

-- Message de confirmation
SELECT '✅ Colonne email rendue optionnelle! Les membres peuvent maintenant être créés sans email.' AS message;
