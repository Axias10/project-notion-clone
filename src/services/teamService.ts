import { supabase, TeamMember } from '../lib/supabase';

export const teamService = {
  // Récupérer tous les membres de l'équipe
  async getAllTeam(): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching team:', error);
      return [];
    }
  },

  // Rechercher des membres
  async searchTeam(query: string): Promise<TeamMember[]> {
    const team = await this.getAllTeam();
    if (!query) return team;

    const queryLower = query.toLowerCase();
    return team.filter(m =>
      m.name?.toLowerCase().includes(queryLower) ||
      m.role?.toLowerCase().includes(queryLower) ||
      m.email?.toLowerCase().includes(queryLower)
    );
  },

  // Ajouter un membre
  async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase.from('team').insert(member);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding team member:', error);
      return false;
    }
  },

  // Mettre à jour un membre
  async updateTeamMember(memberId: number, memberData: Partial<TeamMember>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team')
        .update(memberData)
        .eq('id', memberId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating team member:', error);
      return false;
    }
  },

  // Supprimer un membre
  async deleteTeamMember(memberId: number): Promise<boolean> {
    try {
      const { error} = await supabase
        .from('team')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting team member:', error);
      return false;
    }
  },
};
