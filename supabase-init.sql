-- Script d'initialisation complet de la base de données Supabase
-- À exécuter dans le SQL Editor de Supabase

-- Supprimer les tables existantes si nécessaire (ATTENTION: supprime les données)
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS team CASCADE;
-- DROP TABLE IF EXISTS okrs CASCADE;

-- Table des membres d'équipe
CREATE TABLE IF NOT EXISTS team (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
  assignee TEXT, -- Legacy field for backward compatibility
  assigned_to INTEGER[], -- Array of team member IDs
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des projets
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('planning', 'active', 'completed')) DEFAULT 'planning',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assigned_to INTEGER[], -- Array of team member IDs
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des OKRs
CREATE TABLE IF NOT EXISTS okrs (
  id BIGSERIAL PRIMARY KEY,
  objective TEXT NOT NULL,
  key_results TEXT, -- Stored as JSON string
  status TEXT CHECK (status IN ('on-track', 'at-risk', 'off-track')) DEFAULT 'on-track',
  quarter TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter des commentaires pour documenter les tables
COMMENT ON TABLE team IS 'Table des membres de l équipe';
COMMENT ON TABLE tasks IS 'Table des tâches';
COMMENT ON TABLE projects IS 'Table des projets';
COMMENT ON TABLE okrs IS 'Table des Objectives and Key Results';

COMMENT ON COLUMN tasks.assigned_to IS 'Array of team member IDs assigned to this task';
COMMENT ON COLUMN projects.assigned_to IS 'Array of team member IDs assigned to this project';

-- Activer Row Level Security (RLS) mais désactiver les politiques pour simplifier
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE okrs ENABLE ROW LEVEL SECURITY;

-- Créer des politiques permissives pour permettre toutes les opérations
-- (À adapter selon vos besoins de sécurité)
CREATE POLICY "Enable all operations for team" ON team FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for okrs" ON okrs FOR ALL USING (true) WITH CHECK (true);

-- Insérer des données de démonstration (optionnel)
-- Membres d'équipe
INSERT INTO team (name, role, email) VALUES
  ('Alice Martin', 'Product Manager', 'alice@example.com'),
  ('Bob Dupont', 'Développeur Frontend', 'bob@example.com'),
  ('Charlie Bernard', 'Développeur Backend', 'charlie@example.com'),
  ('Diana Lambert', 'Designer UX/UI', 'diana@example.com'),
  ('Étienne Moreau', 'DevOps Engineer', 'etienne@example.com')
ON CONFLICT DO NOTHING;

-- Tâches d'exemple
INSERT INTO tasks (title, description, priority, status, assigned_to, due_date) VALUES
  ('Créer la maquette homepage', 'Concevoir la nouvelle page d''accueil', 'high', 'in-progress', ARRAY[4], CURRENT_DATE + 3),
  ('Développer l''API REST', 'Implémenter les endpoints de l''API', 'high', 'todo', ARRAY[3], CURRENT_DATE + 7),
  ('Tests unitaires', 'Écrire les tests pour les composants', 'medium', 'todo', ARRAY[2], CURRENT_DATE + 5),
  ('Documentation technique', 'Rédiger la documentation du projet', 'low', 'todo', ARRAY[1, 2], CURRENT_DATE + 10)
ON CONFLICT DO NOTHING;

-- Projets d'exemple
INSERT INTO projects (name, description, status, progress, assigned_to, deadline) VALUES
  ('Refonte du site web', 'Moderniser l''interface et améliorer l''UX', 'active', 35, ARRAY[1, 2, 4], CURRENT_DATE + 30),
  ('Application mobile', 'Développer l''app iOS et Android', 'planning', 10, ARRAY[2, 3], CURRENT_DATE + 60),
  ('Migration cloud', 'Migrer l''infrastructure vers AWS', 'active', 60, ARRAY[3, 5], CURRENT_DATE + 20)
ON CONFLICT DO NOTHING;

-- OKRs d'exemple
INSERT INTO okrs (objective, key_results, status, quarter) VALUES
  ('Améliorer l''expérience utilisateur', '[{"description":"Réduire le temps de chargement de 50%","progress":30,"target":100},{"description":"Augmenter le NPS de 20 points","progress":15,"target":100}]', 'on-track', 'Q1 2025'),
  ('Accroître la base d''utilisateurs', '[{"description":"Atteindre 10000 utilisateurs actifs","progress":60,"target":100},{"description":"Taux de conversion de 5%","progress":40,"target":100}]', 'at-risk', 'Q1 2025')
ON CONFLICT DO NOTHING;

-- Afficher un message de confirmation
SELECT 'Base de données initialisée avec succès!' AS message;
