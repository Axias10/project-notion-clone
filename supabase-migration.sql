-- Migration pour ajouter la colonne assigned_to aux tables tasks et projects
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter la colonne assigned_to à la table tasks
-- Cette colonne stockera un tableau d'IDs de membres d'équipe
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assigned_to INTEGER[];

-- Ajouter la colonne assigned_to à la table projects
-- Cette colonne stockera un tableau d'IDs de membres d'équipe
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS assigned_to INTEGER[];

-- Ajouter un commentaire pour documenter les colonnes
COMMENT ON COLUMN tasks.assigned_to IS 'Array of team member IDs assigned to this task';
COMMENT ON COLUMN projects.assigned_to IS 'Array of team member IDs assigned to this project';
