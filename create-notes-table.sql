-- Script pour créer la table notes dans Supabase
-- À exécuter dans le SQL Editor de Supabase
-- Exécutez ensuite supabase-auth-migration.sql pour harmoniser les politiques.

-- Créer la table notes
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Nouvelle note',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- Créer un index sur updated_at pour optimiser le tri
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for notes" ON notes;
DROP POLICY IF EXISTS "Users can manage own notes" ON notes;
CREATE POLICY "Users can manage own notes" ON notes
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);

-- Vérifier la structure de la table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notes'
ORDER BY ordinal_position;

-- Test d'insertion
INSERT INTO notes (title, content)
VALUES (
  'Note de bienvenue',
  '<h1>Bienvenue dans Notes!</h1><p>Ceci est un éditeur de texte riche style Notion.</p><p>Vous pouvez:</p><ul><li>Créer des titres</li><li>Écrire des paragraphes</li><li>Faire des listes</li><li>Et bien plus!</li></ul>'
)
RETURNING id, title, created_at;

-- Message de confirmation
SELECT '✅ Table notes créée avec succès!' AS message;
