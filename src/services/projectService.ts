import { supabase, Project } from '../lib/supabase';

export const projectService = {
  // Récupérer tous les projets
  async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  // Rechercher des projets
  async searchProjects(query: string): Promise<Project[]> {
    const projects = await this.getAllProjects();
    if (!query) return projects;

    const queryLower = query.toLowerCase();
    return projects.filter(p =>
      p.name?.toLowerCase().includes(queryLower) ||
      p.description?.toLowerCase().includes(queryLower)
    );
  },

  // Filtrer les projets
  filterProjects(
    projects: Project[],
    status?: string,
    deadlineSoon?: boolean
  ): Project[] {
    let filtered = projects;

    if (status && status !== "Tous") {
      filtered = filtered.filter(p => p.status === status);
    }

    if (deadlineSoon) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);

      filtered = filtered.filter(p => {
        if (!p.deadline) return false;
        const deadline = new Date(p.deadline);
        return deadline >= today && deadline <= weekEnd;
      });
    }

    return filtered;
  },

  // Ajouter un projet
  async addProject(project: Omit<Project, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase.from('projects').insert(project);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding project:', error);
      return false;
    }
  },

  // Mettre à jour un projet
  async updateProject(projectId: number, projectData: Partial<Project>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  },

  // Supprimer un projet
  async deleteProject(projectId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  },
};
