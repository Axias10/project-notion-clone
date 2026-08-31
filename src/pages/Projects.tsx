import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CalendarBlank,
  CaretRight,
  Check,
  Clock,
  FolderOpen,
  MagnifyingGlass,
  Plus,
  Trash,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { projectService } from "@/services/projectService";
import { teamService } from "@/services/teamService";
import { Project, TeamMember } from "@/lib/supabase";
import { InlineTextEdit } from "@/components/InlineTextEdit";
import { PercentageEditor } from "@/components/PercentageEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const STATUS_CONFIG = {
  planning: {
    label: "Planifié",
    dotClassName: "bg-sky-500",
    badgeClassName:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
    barClassName: "[&>div]:bg-sky-500",
  },
  active: {
    label: "Actif",
    dotClassName: "bg-emerald-500",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    barClassName: "[&>div]:bg-emerald-600",
  },
  completed: {
    label: "Terminé",
    dotClassName: "bg-zinc-400",
    badgeClassName: "border-border bg-muted text-muted-foreground",
    barClassName: "[&>div]:bg-zinc-500",
  },
} satisfies Record<
  Project["status"],
  {
    label: string;
    dotClassName: string;
    badgeClassName: string;
    barClassName: string;
  }
>;

const formatDeadline = (deadline?: string | null) => {
  if (!deadline) return "Sans échéance";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${deadline}T12:00:00`));
};

const isOverdue = (project: Project) => {
  if (!project.deadline || project.status === "completed") return false;
  return new Date(`${project.deadline}T23:59:59`) < new Date();
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingTeam, setUpdatingTeam] = useState(false);
  const { toast } = useToast();

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "planning" as Project["status"],
    progress: 0,
    assigned_to: [] as number[],
    deadline: "",
  });

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [projectsData, teamData] = await Promise.all([
      projectService.getAllProjects(),
      teamService.getAllTeam(),
    ]);
    setProjects(projectsData);
    setTeamMembers(teamData || []);
    setSelectedProjectId((currentId) => {
      if (currentId && projectsData.some((project) => project.id === currentId)) {
        return currentId;
      }
      return projectsData[0]?.id ?? null;
    });
    setLoading(false);
    return projectsData;
  };

  const handleAddProject = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newProject.name.trim()) {
      toast({
        title: "Nom requis",
        description: "Donnez un nom au projet.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    const success = await projectService.addProject({
      ...newProject,
      name: newProject.name.trim(),
      description: newProject.description.trim(),
    });

    if (!success) {
      setCreating(false);
      toast({
        title: "Création impossible",
        description: "Le projet n’a pas pu être enregistré.",
        variant: "destructive",
      });
      return;
    }

    const refreshedProjects = await loadData();
    setSelectedProjectId(refreshedProjects[0]?.id ?? null);
    setCreating(false);
    setShowCreateDialog(false);
    setNewProject({
      name: "",
      description: "",
      status: "planning",
      progress: 0,
      assigned_to: [],
      deadline: "",
    });
    toast({ title: "Projet créé" });
  };

  const handleUpdateProject = async (
    projectId: number,
    updates: Partial<Project>,
  ): Promise<boolean> => {
    const success = await projectService.updateProject(projectId, updates);

    if (!success) {
      toast({
        title: "Modification non enregistrée",
        description: "Vérifiez votre connexion puis réessayez.",
        variant: "destructive",
      });
      return false;
    }

    setProjects((current) =>
      current.map((project) =>
        project.id === projectId ? { ...project, ...updates } : project,
      ),
    );
    return true;
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    const deletedProjectId = projectToDelete.id;
    const success = await projectService.deleteProject(deletedProjectId);
    if (!success) {
      toast({
        title: "Suppression impossible",
        description: "Le projet n’a pas pu être supprimé.",
        variant: "destructive",
      });
      return;
    }

    const remainingProjects = projects.filter(
      (project) => project.id !== deletedProjectId,
    );
    setProjects(remainingProjects);
    setSelectedProjectId((currentId) =>
      currentId === deletedProjectId
        ? (remainingProjects[0]?.id ?? null)
        : currentId,
    );
    setProjectToDelete(null);
    toast({ title: "Projet supprimé" });
  };

  const toggleNewProjectAssignee = (memberId: number) => {
    setNewProject((current) => ({
      ...current,
      assigned_to: current.assigned_to.includes(memberId)
        ? current.assigned_to.filter((id) => id !== memberId)
        : [...current.assigned_to, memberId],
    }));
  };

  const toggleProjectAssignee = async (
    project: Project,
    memberId: number,
  ) => {
    const currentAssignees = project.assigned_to || [];
    const assignedTo = currentAssignees.includes(memberId)
      ? currentAssignees.filter((id) => id !== memberId)
      : [...currentAssignees, memberId];

    setUpdatingTeam(true);
    const saved = await handleUpdateProject(project.id, {
      assigned_to: assignedTo,
    });
    setUpdatingTeam(false);
    return saved;
  };

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return projects.filter((project) => {
      const matchesSearch =
        !normalizedQuery ||
        project.name.toLowerCase().includes(normalizedQuery) ||
        project.description?.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        filterStatus === "all" || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, projects, searchQuery]);

  const selectedProject =
    filteredProjects.find((project) => project.id === selectedProjectId) ||
    filteredProjects[0] ||
    null;

  const assignedMembers = selectedProject
    ? teamMembers.filter((member) =>
        selectedProject.assigned_to?.includes(member.id),
      )
    : [];

  const stats = {
    total: projects.length,
    active: projects.filter((project) => project.status === "active").length,
    completed: projects.filter((project) => project.status === "completed")
      .length,
    average: projects.length
      ? Math.round(
          projects.reduce((total, project) => total + project.progress, 0) /
            projects.length,
        )
      : 0,
  };

  if (loading) {
    return (
      <div className="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-[1480px] p-5 sm:p-8">
        <div className="h-10 w-52 animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 grid min-h-[640px] overflow-hidden rounded-2xl border border-border/60 lg:grid-cols-[340px_1fr]">
          <div className="space-y-3 border-r border-border/60 bg-muted/20 p-4">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="space-y-8 p-8 lg:p-12">
            <div className="h-12 w-2/3 animate-pulse rounded-xl bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-[1480px] p-4 sm:p-6 lg:p-8">
      <header className="mb-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Portfolio management
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Portefeuille projets
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm leading-6 text-muted-foreground">
            Sélectionnez un projet, puis modifiez chaque information directement
            dans son espace de pilotage.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <dl className="flex divide-x divide-border/70">
            {[
              { label: "Projets", value: stats.total },
              { label: "Actifs", value: stats.active },
              { label: "Finalisés", value: stats.completed },
              { label: "Moyenne", value: `${stats.average}%` },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 first:pl-0">
                <dd className="font-mono text-xl font-semibold tabular-nums">
                  {value}
                </dd>
                <dt className="mt-0.5 text-[11px] text-muted-foreground">
                  {label}
                </dt>
              </div>
            ))}
          </dl>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="h-10 rounded-xl px-4 active:scale-[0.98]">
                <Plus className="mr-2 h-4 w-4" weight="bold" />
                Nouveau projet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl tracking-[-0.035em]">
                  Créer un projet
                </DialogTitle>
                <DialogDescription>
                  Posez le cadre initial. Chaque champ restera modifiable dans
                  l’espace de pilotage.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddProject} className="mt-2 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="project-name" className="text-sm font-medium">
                      Nom du projet
                    </label>
                    <Input
                      id="project-name"
                      value={newProject.name}
                      onChange={(event) =>
                        setNewProject({
                          ...newProject,
                          name: event.target.value,
                        })
                      }
                      placeholder="Ex. Acquisition Atlas"
                      className="h-11 rounded-xl"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label
                      htmlFor="project-description"
                      className="text-sm font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      id="project-description"
                      value={newProject.description}
                      onChange={(event) =>
                        setNewProject({
                          ...newProject,
                          description: event.target.value,
                        })
                      }
                      placeholder="Objectif, périmètre et résultat attendu."
                      className="min-h-24 resize-none rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="project-status" className="text-sm font-medium">
                      Statut
                    </label>
                    <Select
                      value={newProject.status}
                      onValueChange={(value) =>
                        setNewProject({
                          ...newProject,
                          status: value as Project["status"],
                        })
                      }
                    >
                      <SelectTrigger id="project-status" className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planifié</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="project-deadline"
                      className="text-sm font-medium"
                    >
                      Échéance
                    </label>
                    <Input
                      id="project-deadline"
                      type="date"
                      value={newProject.deadline}
                      onChange={(event) =>
                        setNewProject({
                          ...newProject,
                          deadline: event.target.value,
                        })
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label
                      htmlFor="project-progress"
                      className="text-sm font-medium"
                    >
                      Progression initiale
                    </label>
                    <div className="relative max-w-36">
                      <Input
                        id="project-progress"
                        type="number"
                        min={0}
                        max={100}
                        value={newProject.progress}
                        onChange={(event) =>
                          setNewProject({
                            ...newProject,
                            progress: Math.min(
                              100,
                              Math.max(0, Number(event.target.value)),
                            ),
                          })
                        }
                        className="h-11 rounded-xl pr-9 font-mono tabular-nums"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>

                  {teamMembers.length > 0 && (
                    <div className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-medium">Équipe assignée</span>
                      <div className="grid max-h-44 gap-1 overflow-y-auto rounded-xl border p-2 sm:grid-cols-2">
                        {teamMembers.map((member) => (
                          <label
                            key={member.id}
                            htmlFor={`new-project-member-${member.id}`}
                            className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted"
                          >
                            <Checkbox
                              id={`new-project-member-${member.id}`}
                              checked={newProject.assigned_to.includes(member.id)}
                              onCheckedChange={() =>
                                toggleNewProjectAssignee(member.id)
                              }
                            />
                            <Avatar className="h-7 w-7 rounded-lg">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="rounded-lg text-[9px]">
                                {member.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {member.name}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {member.role}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Création…" : "Créer le projet"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid min-h-[650px] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_26px_70px_-48px_rgba(24,24,20,0.45)] lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="border-b border-border/70 bg-muted/20 lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b border-border/70 p-4">
            <div className="relative">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans le portefeuille"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 rounded-xl border-border/60 bg-background pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 rounded-xl border-border/60 bg-background text-xs">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="planning">Planifiés</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-[310px] overflow-y-auto p-2 lg:max-h-[calc(100dvh-18rem)]">
            {filteredProjects.map((project) => {
              const selected = selectedProject?.id === project.id;
              const status = STATUS_CONFIG[project.status];

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`group/list relative mb-1 w-full rounded-xl p-3.5 text-left outline-none transition-[background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-ring ${
                    selected
                      ? "bg-[#20231e] text-[#f7f7f2] shadow-[0_14px_30px_-24px_rgba(20,24,18,0.8)] dark:bg-[#eceee7] dark:text-[#181a16]"
                      : "hover:translate-x-0.5 hover:bg-background"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${status.dotClassName}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold">
                          {project.name}
                        </span>
                        <CaretRight
                          className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover/list:translate-x-0.5 ${
                            selected ? "opacity-80" : "text-muted-foreground"
                          }`}
                          weight="bold"
                        />
                      </span>
                      <span
                        className={`mt-1.5 flex items-center justify-between gap-3 text-[11px] ${
                          selected
                            ? "text-[#bdc3b4] dark:text-[#55594f]"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span>{status.label}</span>
                        <span className="font-mono tabular-nums">
                          {project.progress}%
                        </span>
                      </span>
                      <span
                        className={`mt-2 block h-1 overflow-hidden rounded-full ${
                          selected
                            ? "bg-white/15 dark:bg-black/10"
                            : "bg-muted"
                        }`}
                      >
                        <span
                          className={`block h-full rounded-full transition-transform duration-300 ${
                            selected
                              ? "bg-[#d4dfaa] dark:bg-[#596446]"
                              : status.dotClassName
                          }`}
                          style={{
                            transform: `translateX(-${100 - project.progress}%)`,
                          }}
                        />
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}

            {!filteredProjects.length && (
              <div className="px-4 py-14 text-center">
                <FolderOpen className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                  {projects.length
                    ? "Aucun résultat"
                    : "Aucun projet pour le moment"}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {projects.length
                    ? "Essayez un autre filtre ou une autre recherche."
                    : "Créez un projet pour ouvrir votre portefeuille."}
                </p>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          {selectedProject ? (
            <div className="p-5 sm:p-7 lg:p-10 xl:p-12">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Briefcase className="h-4 w-4" weight="duotone" />
                  PCM-{String(selectedProject.id).padStart(3, "0")}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setProjectToDelete(selectedProject)}
                  className="h-8 rounded-lg px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash className="mr-1.5 h-4 w-4" />
                  Supprimer
                </Button>
              </div>

              <div className="mt-5 max-w-4xl">
                <InlineTextEdit
                  value={selectedProject.name}
                  placeholder="Nom du projet"
                  ariaLabel="Nom du projet"
                  required
                  onSave={(name) =>
                    handleUpdateProject(selectedProject.id, { name })
                  }
                  displayClassName="py-1 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl"
                  inputClassName="h-14 rounded-xl text-2xl font-semibold tracking-[-0.03em]"
                  iconClassName="mt-2 h-5 w-5 opacity-40"
                />
              </div>

              <section className="mt-8 max-w-4xl">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Description
                  </h2>
                  <span className="text-[11px] text-muted-foreground">
                    Cliquez dans le texte pour modifier
                  </span>
                </div>
                <InlineTextEdit
                  value={selectedProject.description}
                  placeholder="Ajoutez le contexte, l’objectif et le résultat attendu de ce projet."
                  ariaLabel={`Description de ${selectedProject.name}`}
                  multiline
                  onSave={(description) =>
                    handleUpdateProject(selectedProject.id, { description })
                  }
                  displayClassName="min-h-28 rounded-xl border border-dashed border-border/80 bg-muted/15 p-4 text-[15px] leading-7 text-foreground transition-[border-color,background-color] hover:border-foreground/30 hover:bg-muted/30"
                  inputClassName="min-h-32 rounded-xl text-[15px] leading-7"
                  iconClassName="mt-1 h-4 w-4 opacity-50"
                />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Enregistrement au clic extérieur · Échap pour annuler
                </p>
              </section>

              <div className="mt-10 grid gap-10 border-t border-border/70 pt-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
                <div className="space-y-8">
                  <section>
                    <div className="mb-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Avancement
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                        Progression du mandat
                      </h2>
                    </div>
                    <PercentageEditor
                      value={selectedProject.progress}
                      onSave={(progress) =>
                        handleUpdateProject(selectedProject.id, { progress })
                      }
                      label={
                        <div>
                          <p className="text-sm font-medium">Taux d’exécution</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Saisissez directement une valeur entre 0 et 100.
                          </p>
                        </div>
                      }
                      ariaLabel={`Progression de ${selectedProject.name} en pourcentage`}
                      barClassName={
                        STATUS_CONFIG[selectedProject.status].barClassName
                      }
                      controlClassName="h-14 rounded-xl px-3"
                      inputClassName="w-16 text-2xl"
                      progressClassName="mt-4 h-2.5 rounded-full"
                    />
                  </section>

                  <section className="grid overflow-hidden rounded-xl border border-border/70 sm:grid-cols-2">
                    <div className="space-y-2 border-b border-border/70 p-4 sm:border-b-0 sm:border-r">
                      <label
                        htmlFor={`status-${selectedProject.id}`}
                        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Statut
                      </label>
                      <Select
                        value={selectedProject.status}
                        onValueChange={(value) =>
                          void handleUpdateProject(selectedProject.id, {
                            status: value as Project["status"],
                          })
                        }
                      >
                        <SelectTrigger
                          id={`status-${selectedProject.id}`}
                          className={`h-10 rounded-lg ${
                            STATUS_CONFIG[selectedProject.status].badgeClassName
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planifié</SelectItem>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="completed">Terminé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 p-4">
                      <label
                        htmlFor={`deadline-${selectedProject.id}`}
                        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Échéance
                      </label>
                      <div className="relative">
                        <CalendarBlank
                          className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                            isOverdue(selectedProject)
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        />
                        <Input
                          id={`deadline-${selectedProject.id}`}
                          type="date"
                          value={selectedProject.deadline || ""}
                          onChange={(event) =>
                            void handleUpdateProject(selectedProject.id, {
                              deadline: event.target.value || null,
                            })
                          }
                          className={`h-10 rounded-lg pl-9 ${
                            isOverdue(selectedProject)
                              ? "border-destructive/40 text-destructive"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="h-fit rounded-2xl bg-[#f0f1eb] p-5 dark:bg-[#1a1c18]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Équipe
                      </p>
                      <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                        Responsables du projet
                      </h2>
                    </div>
                    <UsersThree
                      className="h-5 w-5 text-muted-foreground"
                      weight="duotone"
                    />
                  </div>

                  <div className="mt-5 space-y-2">
                    {assignedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 rounded-xl bg-background/70 p-2.5"
                      >
                        <Avatar className="h-9 w-9 rounded-xl">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="rounded-xl text-[10px] font-semibold">
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {member.name}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    ))}

                    {!assignedMembers.length && (
                      <div className="rounded-xl border border-dashed border-border/80 px-4 py-6 text-center">
                        <p className="text-sm font-medium">Aucun responsable</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ajoutez les personnes qui pilotent ce projet.
                        </p>
                      </div>
                    )}
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="mt-4 h-10 w-full rounded-xl bg-background"
                        disabled={updatingTeam}
                      >
                        <Plus className="mr-2 h-4 w-4" weight="bold" />
                        Modifier l’équipe
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-80 rounded-xl p-2"
                    >
                      <div className="px-2 pb-2 pt-1">
                        <p className="text-sm font-semibold">
                          Membres assignés
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Les changements sont enregistrés immédiatement.
                        </p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {teamMembers.map((member) => {
                          const checked =
                            selectedProject.assigned_to?.includes(member.id) ||
                            false;

                          return (
                            <label
                              key={member.id}
                              htmlFor={`assigned-${selectedProject.id}-${member.id}`}
                              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                            >
                              <Checkbox
                                id={`assigned-${selectedProject.id}-${member.id}`}
                                checked={checked}
                                disabled={updatingTeam}
                                onCheckedChange={() =>
                                  void toggleProjectAssignee(
                                    selectedProject,
                                    member.id,
                                  )
                                }
                              />
                              <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="rounded-lg text-[9px]">
                                  {member.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">
                                  {member.name}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {member.role}
                                </span>
                              </span>
                              {checked && (
                                <Check
                                  className="ml-auto h-4 w-4 text-emerald-600"
                                  weight="bold"
                                />
                              )}
                            </label>
                          );
                        })}

                        {!teamMembers.length && (
                          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            Ajoutez d’abord des membres depuis la page Équipe.
                          </p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
                    {isOverdue(selectedProject) ? (
                      <>
                        <Clock className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">
                          Échéance dépassée ·{" "}
                          {formatDeadline(selectedProject.deadline)}
                        </span>
                      </>
                    ) : (
                      <>
                        <CalendarBlank className="h-4 w-4" />
                        <span>{formatDeadline(selectedProject.deadline)}</span>
                      </>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[650px] place-items-center p-8 text-center">
              <div>
                <Briefcase
                  className="mx-auto h-8 w-8 text-muted-foreground"
                  weight="duotone"
                />
                <h2 className="mt-4 text-lg font-semibold">
                  Aucun projet sélectionné
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Créez un projet ou modifiez vos filtres pour ouvrir un espace
                  de pilotage.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <AlertDialog
        open={Boolean(projectToDelete)}
        onOpenChange={(open) => {
          if (!open) setProjectToDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              {projectToDelete?.name} sera supprimé définitivement. Cette action
              ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Conserver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteProject()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
