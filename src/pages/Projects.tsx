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

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      toast({ title: "Succès", description: "Projet créé !" });
      setShowForm(false);
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        progress: 0,
        assigned_to: [],
        deadline: ''
      });
      loadData();
    } else {
      toast({ title: "Erreur", description: "Impossible de créer le projet", variant: "destructive" });
    }
  };

  const handleUpdateProject = async (projectId: number, updates: Partial<Project>) => {
    const success = await projectService.updateProject(projectId, updates);
    if (success) {
      toast({ title: "Succès", description: "Projet mis à jour" });
      loadData();
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      const success = await projectService.deleteProject(projectId);
      if (success) {
        toast({ title: "Succès", description: "Projet supprimé" });
        setExpandedProjectId(null);
        loadData();
      }
    }
  };

  const filteredProjects = searchQuery
    ? projects.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const getStatusLabel = (status: string) => {
    const labels = { planning: '🔵 Planning', active: '🟢 Actif', completed: '⚫ Terminé' };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = { planning: 'default', active: 'default', completed: 'secondary' };
    return colors[status as keyof typeof colors] || 'default';
  };

  const toggleAssignee = (memberId: number) => {
    setNewProject(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(memberId)
        ? prev.assigned_to.filter(id => id !== memberId)
        : [...prev.assigned_to, memberId]
    }));
  };

  const getAssignedMembers = (project: Project): TeamMember[] => {
    if (!project.assigned_to || project.assigned_to.length === 0) return [];
    return teamMembers.filter(member => project.assigned_to?.includes(member.id));
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📁 Gestion des Projets</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Annuler' : '➕ Nouveau projet'}
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Rechercher un projet..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAddProject} className="space-y-4">
              <h3 className="text-lg font-semibold">➕ Nouveau projet</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom *</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Ex: Refonte du site web"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Statut</label>
                  <Select
                    value={newProject.status}
                    onValueChange={(value) => setNewProject({ ...newProject, status: value as Project['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">🔵 Planning</SelectItem>
                      <SelectItem value="active">🟢 Actif</SelectItem>
                      <SelectItem value="completed">⚫ Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Progression (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newProject.progress}
                    onChange={(e) => setNewProject({ ...newProject, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date limite</label>
                  <Input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Détails du projet..."
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Assigner à:</label>
                  <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                    {teamMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucun membre d'équipe disponible</p>
                    ) : (
                      teamMembers.map(member => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`project-member-${member.id}`}
                            checked={newProject.assigned_to.includes(member.id)}
                            onCheckedChange={() => toggleAssignee(member.id)}
                          />
                          <label
                            htmlFor={`project-member-${member.id}`}
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
              </div>

              <div className="flex gap-2">
                <Button type="submit">✅ Créer le projet</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const isExpanded = expandedProjectId === project.id;
          const assignedMembers = getAssignedMembers(project);

          return (
            <Card
              key={project.id}
              className={`hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] ${isExpanded ? 'ring-2 ring-primary shadow-lg' : ''}`}
            >
              <CardHeader onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}>
                <CardTitle className="text-lg flex items-start justify-between">
                  <span>{project.name}</span>
                  <Badge variant={getStatusColor(project.status) as any}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}

                {assignedMembers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Équipe:</p>
                    <div className="flex flex-wrap gap-2">
                      {assignedMembers.map(member => (
                        <Badge key={member.id} variant="outline" className="flex items-center gap-1">
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
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />

                  {/* Slider pour modifier la progression quand étendu */}
                  {isExpanded && (
                    <div className="pt-2">
                      <Slider
                        value={[project.progress]}
                        max={100}
                        step={1}
                        onValueChange={(value) => handleUpdateProject(project.id, { progress: value[0] })}
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {project.deadline && (
                  <div className="text-sm text-muted-foreground">
                    📅 Deadline: {project.deadline}
                  </div>
                )}

                {/* Edit Panel */}
                {isExpanded && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">Modifier le projet</h4>

                    <div className="space-y-2">
                      <Input
                        placeholder="Nom"
                        defaultValue={project.name}
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
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">🔵 Planning</SelectItem>
                          <SelectItem value="active">🟢 Actif</SelectItem>
                          <SelectItem value="completed">⚫ Terminé</SelectItem>
                        </SelectContent>
                      </Select>

                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Deadline</label>
                        <Input
                          type="date"
                          defaultValue={project.deadline || ''}
                          onBlur={(e) => {
                            if (e.target.value !== project.deadline) {
                              handleUpdateProject(project.id, { deadline: e.target.value || undefined });
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedProjectId(null)}
                        className="flex-1"
                      >
                        Fermer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        🗑️ Supprimer
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
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun projet trouvé
          </CardContent>
        </Card>
      )}
    </div>
  );
}
