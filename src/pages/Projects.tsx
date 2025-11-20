import { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import { Project } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
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
    deadline: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await projectService.getAllProjects();
    setProjects(data);
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

          return (
            <Card
              key={project.id}
              className={`hover:shadow-lg transition-all cursor-pointer ${isExpanded ? 'ring-2 ring-primary' : ''}`}
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

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
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

                      <Input
                        type="number"
                        placeholder="Progression"
                        defaultValue={project.progress}
                        min="0"
                        max="100"
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val !== project.progress) {
                            handleUpdateProject(project.id, { progress: val });
                          }
                        }}
                      />
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
