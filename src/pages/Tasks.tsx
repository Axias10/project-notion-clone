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
import { Plus, X, Filter } from 'lucide-react';

const PRIORITY_CONFIG = {
  high: { label: 'Haute', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', dot: 'bg-red-500' },
  medium: { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400', dot: 'bg-yellow-500' },
  low: { label: 'Basse', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400', dot: 'bg-green-500' },
};

const COLUMN_CONFIG = {
  todo: { label: 'À faire', color: 'bg-slate-100 dark:bg-slate-800', headerColor: 'text-slate-600 dark:text-slate-300' },
  'in-progress': { label: 'En cours', color: 'bg-blue-50 dark:bg-blue-950/30', headerColor: 'text-blue-600 dark:text-blue-400' },
  done: { label: 'Terminé', color: 'bg-green-50 dark:bg-green-950/30', headerColor: 'text-green-600 dark:text-green-400' },
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
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
      toast({ title: "Tâche créée !" });
      setShowForm(false);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', assignee: '', assigned_to: [], due_date: '' });
      loadData();
    } else {
      toast({ title: "Erreur", description: "Impossible de créer la tâche", variant: "destructive" });
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    const success = await taskService.updateTask(taskId, updates);
    if (success) {
      toast({ title: "Tâche mise à jour" });
      loadData();
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Supprimer cette tâche ?')) {
      const success = await taskService.deleteTask(taskId);
      if (success) {
        toast({ title: "Tâche supprimée" });
        setExpandedTaskId(null);
        loadData();
      }
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

  const filteredTasks = tasks.filter(t => {
    const matchSearch = !searchQuery ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const totalFiltered = filteredTasks.length;
  const hasFilters = searchQuery || filterPriority !== 'all';

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="h-9 w-full bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tâches</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tasks.filter(t => t.status === 'done').length}/{tasks.length} tâches complétées
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4 mr-2" />Annuler</> : <><Plus className="h-4 w-4 mr-2" />Nouvelle tâche</>}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Input
            placeholder="Rechercher une tâche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Basse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setFilterPriority('all'); }}>
            Réinitialiser
          </Button>
        )}

        {hasFilters && (
          <span className="text-sm text-muted-foreground">
            {totalFiltered} résultat{totalFiltered !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <form onSubmit={handleAddTask} className="space-y-4">
              <h3 className="text-base font-semibold">Nouvelle tâche</h3>

              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Titre de la tâche *"
                required
                autoFocus
              />

              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Description (optionnel)"
                rows={2}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Priorité</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v) => setNewTask({ ...newTask, priority: v as Task['priority'] })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="low">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Date d'échéance</label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              {teamMembers.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Assigner à</label>
                  <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto bg-background">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={newTask.assigned_to.includes(member.id)}
                          onCheckedChange={() => toggleAssignee(member.id)}
                        />
                        <label htmlFor={`member-${member.id}`} className="flex items-center gap-2 flex-1 cursor-pointer">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-[9px]">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.name}</span>
                          <span className="text-xs text-muted-foreground">({member.role})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm">Créer la tâche</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(COLUMN_CONFIG) as Array<keyof typeof COLUMN_CONFIG>).map((status) => {
          const statusTasks = filteredTasks.filter(t => t.status === status);
          const config = COLUMN_CONFIG[status];

          return (
            <div key={status} className="flex flex-col gap-3">
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${config.color}`}>
                <h3 className={`font-semibold text-sm ${config.headerColor}`}>
                  {config.label}
                </h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 ${config.headerColor}`}>
                  {statusTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-2.5">
                {statusTasks.map((task) => {
                  const assignedMembers = getAssignedMembers(task);
                  const isExpanded = expandedTaskId === task.id;
                  const prioConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

                  return (
                    <Card
                      key={task.id}
                      className={`transition-all duration-200 cursor-pointer border hover:shadow-md ${
                        isExpanded ? 'ring-2 ring-primary shadow-md' : 'hover:border-border shadow-none border-border/50'
                      }`}
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Priority dot + title */}
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${prioConfig.dot}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[14px] leading-snug">{task.title}</h4>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${prioConfig.color}`}>
                            {prioConfig.label}
                          </span>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.due_date) < new Date() && task.status !== 'done'
                                ? <span className="text-red-500 font-medium">⚠ {task.due_date}</span>
                                : task.due_date
                              }
                            </span>
                          )}
                        </div>

                        {/* Assignees */}
                        {assignedMembers.length > 0 && (
                          <div className="flex -space-x-1">
                            {assignedMembers.slice(0, 4).map(member => (
                              <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="text-[8px] font-bold">
                                  {member.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {assignedMembers.length > 4 && (
                              <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold">
                                +{assignedMembers.length - 4}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expanded edit panel */}
                        {isExpanded && (
                          <div className="pt-3 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Modifier</p>

                            <Input
                              placeholder="Titre"
                              defaultValue={task.title}
                              className="h-8 text-sm"
                              onBlur={(e) => {
                                if (e.target.value !== task.title) {
                                  handleUpdateTask(task.id, { title: e.target.value });
                                }
                              }}
                            />

                            <Textarea
                              placeholder="Description"
                              defaultValue={task.description || ''}
                              rows={2}
                              className="text-sm resize-none"
                              onBlur={(e) => {
                                if (e.target.value !== task.description) {
                                  handleUpdateTask(task.id, { description: e.target.value });
                                }
                              }}
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] text-muted-foreground mb-1">Statut</label>
                                <Select
                                  value={task.status}
                                  onValueChange={(value) => handleUpdateTask(task.id, { status: value as Task['status'] })}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="todo">À faire</SelectItem>
                                    <SelectItem value="in-progress">En cours</SelectItem>
                                    <SelectItem value="done">Terminé</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-[11px] text-muted-foreground mb-1">Priorité</label>
                                <Select
                                  value={task.priority}
                                  onValueChange={(value) => handleUpdateTask(task.id, { priority: value as Task['priority'] })}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="high">Haute</SelectItem>
                                    <SelectItem value="medium">Moyenne</SelectItem>
                                    <SelectItem value="low">Basse</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] text-muted-foreground mb-1">Date d'échéance</label>
                              <Input
                                type="date"
                                defaultValue={task.due_date || ''}
                                className="h-8 text-sm"
                                onBlur={(e) => {
                                  if (e.target.value !== task.due_date) {
                                    handleUpdateTask(task.id, { due_date: e.target.value || undefined });
                                  }
                                }}
                              />
                            </div>

                            <div className="flex gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setExpandedTaskId(null)}
                                className="flex-1 h-8 text-xs"
                              >
                                Fermer
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteTask(task.id)}
                                className="h-8 text-xs"
                              >
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {statusTasks.length === 0 && (
                  <div className="border border-dashed border-border/50 rounded-lg py-8 text-center text-xs text-muted-foreground">
                    Aucune tâche
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
