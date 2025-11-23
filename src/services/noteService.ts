import { supabase, Note } from '../lib/supabase';

export const noteService = {
  async getAllNotes(): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  },

  async addNote(note: Omit<Note, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase.from('notes').insert(note);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding note:', error);
      return false;
    }
  },

  async updateNote(noteId: number, noteData: Partial<Note>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ ...noteData, updated_at: new Date().toISOString() })
        .eq('id', noteId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  },

  async deleteNote(noteId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },
};
