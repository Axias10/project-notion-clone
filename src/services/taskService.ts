import { supabase, Task } from '../lib/supabase';

export const taskService = {
  // Récupérer toutes les tâches
  async getAllTasks(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  // Rechercher des tâches
  async searchTasks(query: string): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    if (!query) return tasks;

    const queryLower = query.toLowerCase();
    return tasks.filter(t =>
      t.title?.toLowerCase().includes(queryLower) ||
      t.description?.toLowerCase().includes(queryLower) ||
      t.assignee?.toLowerCase().includes(queryLower)
    );
  },

  // Filtrer les tâches
  filterTasks(
    tasks: Task[],
    assignee?: string,
    status?: string,
    priority?: string,
    dateRange?: string
  ): Task[] {
    let filtered = tasks;

    if (assignee && assignee !== "Tous") {
      filtered = filtered.filter(t => t.assignee === assignee);
    }

    if (status && status !== "Tous") {
      filtered = filtered.filter(t => t.status === status);
    }

    if (priority && priority !== "Tous") {
      filtered = filtered.filter(t => t.priority === priority);
    }

    if (dateRange) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateRange === "Cette semaine") {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        filtered = filtered.filter(t => {
          if (!t.due_date) return false;
          const dueDate = new Date(t.due_date);
          return dueDate >= today && dueDate <= weekEnd;
        });
      } else if (dateRange === "Ce mois") {
        const monthEnd = new Date(today);
        monthEnd.setDate(monthEnd.getDate() + 30);
        filtered = filtered.filter(t => {
          if (!t.due_date) return false;
          const dueDate = new Date(t.due_date);
          return dueDate >= today && dueDate <= monthEnd;
        });
      } else if (dateRange === "En retard") {
        filtered = filtered.filter(t => {
          if (!t.due_date || t.status === 'done') return false;
          const dueDate = new Date(t.due_date);
          return dueDate < today;
        });
      }
    }

    return filtered;
  },

  // Ajouter une tâche
  async addTask(task: Omit<Task, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase.from('tasks').insert(task);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding task:', error);
      return false;
    }
  },

  // Mettre à jour le statut d'une tâche
  async updateTaskStatus(taskId: number, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      return false;
    }
  },

  // Mettre à jour une tâche
  async updateTask(taskId: number, taskData: Partial<Task>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  },

  // Supprimer une tâche
  async deleteTask(taskId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },
};
