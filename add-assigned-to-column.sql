-- Script pour ajouter UNIQUEMENT la colonne assigned_to aux tables existantes
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter la colonne assigned_to à la table tasks (si elle n'existe pas déjà)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assigned_to INTEGER[];

-- Ajouter la colonne assigned_to à la table projects (si elle n'existe pas déjà)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS assigned_to INTEGER[];

-- Afficher un message de confirmation
SELECT 'Colonnes assigned_to ajoutées avec succès!' AS message;
