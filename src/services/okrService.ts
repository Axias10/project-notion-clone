import { supabase, OKR, KeyResult } from '../lib/supabase';

export const okrService = {
  // Récupérer tous les OKRs
  async getAllOKRs(): Promise<OKR[]> {
    try {
      const { data, error } = await supabase
        .from('okrs')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      // Parser les key_results si c'est une string JSON
      const parsedData = (data || []).map(okr => ({
        ...okr,
        key_results: typeof okr.key_results === 'string'
          ? JSON.parse(okr.key_results)
          : okr.key_results
      }));

      return parsedData;
    } catch (error) {
      console.error('Error fetching OKRs:', error);
      return [];
    }
  },

  // Ajouter un OKR
  async addOKR(okr: Omit<OKR, 'id'>): Promise<boolean> {
    try {
      const okrToInsert = {
        ...okr,
        key_results: Array.isArray(okr.key_results)
          ? JSON.stringify(okr.key_results)
          : okr.key_results
      };

      const { error } = await supabase.from('okrs').insert(okrToInsert);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding OKR:', error);
      return false;
    }
  },

  // Mettre à jour un OKR
  async updateOKR(okrId: number, okrData: Partial<OKR>): Promise<boolean> {
    try {
      const okrToUpdate = {
        ...okrData,
        key_results: okrData.key_results && Array.isArray(okrData.key_results)
          ? JSON.stringify(okrData.key_results)
          : okrData.key_results
      };

      const { error } = await supabase
        .from('okrs')
        .update(okrToUpdate)
        .eq('id', okrId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating OKR:', error);
      return false;
    }
  },

  // Supprimer un OKR
  async deleteOKR(okrId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('okrs')
        .delete()
        .eq('id', okrId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting OKR:', error);
      return false;
    }
  },
};
