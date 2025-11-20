import { useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import { Task } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    status: 'todo' as Task['status'],
    assignee: '',
    due_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const tasksData = await taskService.getAllTasks();
      setTasks(tasksData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) {
      alert('Le titre est requis');
      return;
    }

    const success = await taskService.addTask(newTask);
    if (success) {
      alert('Tâche créée !');
      setShowForm(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assignee: '',
        due_date: ''
      });
      loadData();
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    await taskService.updateTaskStatus(taskId, newStatus);
    loadData();
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Supprimer cette tâche ?')) {
      await taskService.deleteTask(taskId);
      loadData();
    }
  };

  const filteredTasks = searchQuery
    ? tasks.filter(t =>
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">✓ Gestion des Tâches</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Annuler' : '➕ Nouvelle tâche'}
        </Button>
      </div>

      <Input
        placeholder="Rechercher..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAddTask} className="space-y-4">
              <h3 className="text-lg font-semibold">➕ Nouvelle tâche</h3>

              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Titre *"
                required
              />

              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Description"
              />

              <Input
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                placeholder="Assigné à"
              />

              <Input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />

              <div className="flex gap-2">
                <Button type="submit">Créer</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        {['todo', 'in-progress', 'done'].map((status) => {
          const statusTasks = filteredTasks.filter(t => t.status === status);
          return (
            <div key={status}>
              <h3 className="font-semibold mb-3">
                {status === 'todo' ? '📝 À faire' : status === 'in-progress' ? '🚧 En cours' : '✅ Terminé'} ({statusTasks.length})
              </h3>
              <div className="space-y-3">
                {statusTasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="pt-6 space-y-3">
                      <h4 className="font-semibold">{task.title}</h4>
                      {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                      <div className="flex gap-2">
                        <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v)}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">À faire</SelectItem>
                            <SelectItem value="in-progress">En cours</SelectItem>
                            <SelectItem value="done">Terminé</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTask(task.id)}>
                          🗑️
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
