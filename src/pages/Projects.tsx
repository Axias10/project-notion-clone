import { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import { teamService } from '../services/teamService';
import { Project, TeamMember } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';
import { Plus, X, Calendar, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

const getProgressColor = (progress: number) => {
  if (progress >= 70) return { bar: '[&>div]:bg-green-500', text: 'text-green-600 dark:text-green-400' };
  if (progress >= 30) return { bar: '[&>div]:bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' };
  return { bar: '[&>div]:bg-red-500', text: 'text-red-600 dark:text-red-400' };
};

const STATUS_CONFIG = {
  planning: { label: 'Planning', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', dot: 'bg-blue-500' },
  active: { label: 'Actif', badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', dot: 'bg-green-500' },
  completed: { label: 'Terminé', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400' },
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  const { toast } = useToast();

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as Project['status'],
    progress: 0,
    assigned_to: [] as number[],
    deadline: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [projectsData, teamData] = await Promise.all([
      projectService.getAllProjects(),
      teamService.getAllTeam()
    ]);
    setProjects(projectsData);
    setTeamMembers(teamData || []);
    setLoading(false);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) {
      toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" });
      return;
    }

    const success = await projectService.addProject(newProject);
    if (success) {
      toast({ title: "Projet créé !" });
      setShowForm(false);
      setNewProject({ name: '', description: '', status: 'planning', progress: 0, assigned_to: [], deadline: '' });
      loadData();
    } else {
      toast({ title: "Erreur", description: "Impossible de créer le projet", variant: "destructive" });
    }
  };

  const handleUpdateProject = async (projectId: number, updates: Partial<Project>) => {
    const success = await projectService.updateProject(projectId, updates);
    if (success) {
      toast({ title: "Projet mis à jour" });
      loadData();
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      const success = await projectService.deleteProject(projectId);
      if (success) {
        toast({ title: "Projet supprimé" });
        setExpandedProjectId(null);
        loadData();
      }
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchSearch = !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getAssignedMembers = (project: Project): TeamMember[] => {
    if (!project.assigned_to || project.assigned_to.length === 0) return [];
    return teamMembers.filter(member => project.assigned_to?.includes(member.id));
  };

  const toggleAssignee = (memberId: number) => {
    setNewProject(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(memberId)
        ? prev.assigned_to.filter(id => id !== memberId)
        : [...prev.assigned_to, memberId]
    }));
  };

  const isOverdue = (deadline: string | undefined) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    avgProgress: projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0,
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground text-sm mt-1">{stats.active} actif{stats.active !== 1 ? 's' : ''} · {stats.completed} terminé{stats.completed !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4 mr-2" />Annuler</> : <><Plus className="h-4 w-4 mr-2" />Nouveau projet</>}
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-border/50 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.planning}</p>
              <p className="text-xs text-muted-foreground">En planning</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/50 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/50 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Terminés</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/50 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgProgress}%</p>
              <p className="text-xs text-muted-foreground">Progression moy.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Input
            placeholder="Rechercher un projet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="completed">Terminés</SelectItem>
          </SelectContent>
        </Select>
        {(searchQuery || filterStatus !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}>
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <form onSubmit={handleAddProject} className="space-y-4">
              <h3 className="text-base font-semibold">Nouveau projet</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nom *</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Nom du projet"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Statut</label>
                  <Select
                    value={newProject.status}
                    onValueChange={(value) => setNewProject({ ...newProject, status: value as Project['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Progression (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newProject.progress}
                    onChange={(e) => setNewProject({ ...newProject, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Date limite</label>
                  <Input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Description du projet..."
                    rows={2}
                  />
                </div>
                {teamMembers.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Assigner à</label>
                    <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto bg-background">
                      {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`proj-member-${member.id}`}
                            checked={newProject.assigned_to.includes(member.id)}
                            onCheckedChange={() => toggleAssignee(member.id)}
                          />
                          <label htmlFor={`proj-member-${member.id}`} className="flex items-center gap-2 flex-1 cursor-pointer">
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
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm">Créer le projet</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const isExpanded = expandedProjectId === project.id;
          const assignedMembers = getAssignedMembers(project);
          const statusConf = STATUS_CONFIG[project.status];
          const progressColors = getProgressColor(project.progress);
          const overdue = isOverdue(project.deadline) && project.status !== 'completed';

          return (
            <Card
              key={project.id}
              className={`transition-all duration-200 cursor-pointer ${
                isExpanded ? 'ring-2 ring-primary shadow-lg' : 'border-border/50 shadow-none hover:shadow-md hover:border-border'
              }`}
            >
              <CardHeader
                className="pb-3 pt-5"
                onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-[16px] font-semibold leading-tight line-clamp-2 flex-1">
                    {project.name}
                  </CardTitle>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusConf.badge}`}>
                    {statusConf.label}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4" onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                )}

                {/* Assignees */}
                {assignedMembers.length > 0 && (
                  <div className="flex -space-x-1.5">
                    {assignedMembers.slice(0, 5).map(member => (
                      <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-[9px] font-bold">
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {assignedMembers.length > 5 && (
                      <div className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-bold">
                        +{assignedMembers.length - 5}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Progression</span>
                    <span className={`font-semibold ${progressColors.text}`}>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className={`h-2 ${progressColors.bar}`} />
                </div>

                {/* Deadline */}
                {project.deadline && (
                  <div className={`flex items-center gap-1.5 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                    <Calendar className="h-3 w-3" />
                    {overdue ? '⚠ Dépassé : ' : ''}{project.deadline}
                  </div>
                )}

                {/* Expanded slider + edit */}
                {isExpanded && (
                  <div className="pt-3 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ajuster la progression</p>
                    <Slider
                      value={[project.progress]}
                      max={100}
                      step={5}
                      onValueChange={(value) => handleUpdateProject(project.id, { progress: value[0] })}
                      className="cursor-pointer"
                    />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">Modifier</p>
                    <Input
                      placeholder="Nom"
                      defaultValue={project.name}
                      className="h-8 text-sm"
                      onBlur={(e) => {
                        if (e.target.value !== project.name) {
                          handleUpdateProject(project.id, { name: e.target.value });
                        }
                      }}
                    />
                    <Select
                      value={project.status}
                      onValueChange={(value) => handleUpdateProject(project.id, { status: value as Project['status'] })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Deadline</label>
                      <Input
                        type="date"
                        defaultValue={project.deadline || ''}
                        className="h-8 text-sm"
                        onBlur={(e) => {
                          if (e.target.value !== project.deadline) {
                            handleUpdateProject(project.id, { deadline: e.target.value || undefined });
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => setExpandedProjectId(null)} className="flex-1 h-8 text-xs">
                        Fermer
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)} className="h-8 text-xs">
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="border border-dashed border-border/70">
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery || filterStatus !== 'all' ? 'Aucun projet correspond aux filtres' : 'Aucun projet. Créez votre premier projet !'}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
