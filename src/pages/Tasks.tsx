import { useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import { teamService } from '../services/teamService';
import { Task, TeamMember } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    status: 'todo' as Task['status'],
    assignee: '',
    assigned_to: [] as number[],
    due_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, teamData] = await Promise.all([
        taskService.getAllTasks(),
        teamService.getAllTeam()
      ]);
      setTasks(tasksData || []);
      setTeamMembers(teamData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) {
      toast({ title: "Erreur", description: "Le titre est requis", variant: "destructive" });
      return;
    }

    const success = await taskService.addTask(newTask);
    if (success) {
      toast({ title: "Succès", description: "Tâche créée !" });
      setShowForm(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assignee: '',
        assigned_to: [],
        due_date: ''
      });
      loadData();
    } else {
      toast({ title: "Erreur", description: "Impossible de créer la tâche", variant: "destructive" });
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

  const toggleAssignee = (memberId: number) => {
    setNewTask(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(memberId)
        ? prev.assigned_to.filter(id => id !== memberId)
        : [...prev.assigned_to, memberId]
    }));
  };

  const getAssignedMembers = (task: Task): TeamMember[] => {
    if (!task.assigned_to || task.assigned_to.length === 0) return [];
    return teamMembers.filter(member => task.assigned_to?.includes(member.id));
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Assigner à:</label>
                <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun membre d'équipe disponible</p>
                  ) : (
                    teamMembers.map(member => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={newTask.assigned_to.includes(member.id)}
                          onCheckedChange={() => toggleAssignee(member.id)}
                        />
                        <label
                          htmlFor={`member-${member.id}`}
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.name}</span>
                          <span className="text-xs text-muted-foreground">({member.role})</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

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
                {statusTasks.map((task) => {
                  const assignedMembers = getAssignedMembers(task);
                  return (
                    <Card key={task.id} className="hover:shadow-md transition-all duration-200 hover:scale-[1.01] cursor-pointer">
                      <CardContent className="pt-6 space-y-3">
                        <h4 className="font-semibold">{task.title}</h4>
                        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}

                        {assignedMembers.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {assignedMembers.map(member => (
                              <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback className="text-[8px]">
                                    {member.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{member.name}</span>
                              </Badge>
                            ))}
                          </div>
                        )}

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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
