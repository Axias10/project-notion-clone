import { useEffect, useMemo, useState } from "react";
import {
  CalendarBlank,
  CaretRight,
  Check,
  CheckCircle,
  Circle,
  Clock,
  Flag,
  ListChecks,
  MagnifyingGlass,
  Plus,
  Trash,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { taskService } from "@/services/taskService";
import { teamService } from "@/services/teamService";
import { Task, TeamMember } from "@/lib/supabase";
import { InlineTextEdit } from "@/components/InlineTextEdit";
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
  todo: {
    label: "À faire",
    dotClassName: "bg-zinc-400",
    icon: Circle,
  },
  "in-progress": {
    label: "En cours",
    dotClassName: "bg-sky-500",
    icon: Clock,
  },
  done: {
    label: "Terminée",
    dotClassName: "bg-emerald-500",
    icon: CheckCircle,
  },
} satisfies Record<
  Task["status"],
  { label: string; dotClassName: string; icon: typeof Circle }
>;

const PRIORITY_CONFIG = {
  high: {
    label: "Haute",
    dotClassName: "bg-red-500",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  },
  medium: {
    label: "Moyenne",
    dotClassName: "bg-amber-500",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },
  low: {
    label: "Basse",
    dotClassName: "bg-zinc-400",
    className: "border-border bg-muted text-muted-foreground",
  },
} satisfies Record<
  Task["priority"],
  { label: string; dotClassName: string; className: string }
>;

const formatDate = (date?: string | null) => {
  if (!date) return "Sans échéance";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
};

const isOverdue = (task: Task) =>
  Boolean(
    task.due_date &&
      task.status !== "done" &&
      new Date(`${task.due_date}T23:59:59`) < new Date(),
  );

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingTeam, setUpdatingTeam] = useState(false);
  const { toast } = useToast();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    status: "todo" as Task["status"],
    assignee: "",
    assigned_to: [] as number[],
    due_date: "",
  });

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [tasksData, teamData] = await Promise.all([
      taskService.getAllTasks(),
      teamService.getAllTeam(),
    ]);
    setTasks(tasksData || []);
    setTeamMembers(teamData || []);
    setSelectedTaskId((currentId) => {
      if (currentId && tasksData.some((task) => task.id === currentId)) {
        return currentId;
      }
      return tasksData[0]?.id ?? null;
    });
    setLoading(false);
    return tasksData;
  };

  const handleAddTask = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newTask.title.trim()) {
      toast({
        title: "Titre requis",
        description: "Donnez un titre à la tâche.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    const success = await taskService.addTask({
      ...newTask,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
    });

    if (!success) {
      setCreating(false);
      toast({
        title: "Création impossible",
        description: "La tâche n’a pas pu être enregistrée.",
        variant: "destructive",
      });
      return;
    }

    const refreshedTasks = await loadData();
    setSelectedTaskId(refreshedTasks[0]?.id ?? null);
    setCreating(false);
    setShowCreateDialog(false);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      assignee: "",
      assigned_to: [],
      due_date: "",
    });
    toast({ title: "Tâche créée" });
  };

  const handleUpdateTask = async (
    taskId: number,
    updates: Partial<Task>,
  ): Promise<boolean> => {
    const success = await taskService.updateTask(taskId, updates);

    if (!success) {
      toast({
        title: "Modification non enregistrée",
        description: "Vérifiez votre connexion puis réessayez.",
        variant: "destructive",
      });
      return false;
    }

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    );
    return true;
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    const deletedTaskId = taskToDelete.id;
    const success = await taskService.deleteTask(deletedTaskId);
    if (!success) {
      toast({
        title: "Suppression impossible",
        description: "La tâche n’a pas pu être supprimée.",
        variant: "destructive",
      });
      return;
    }

    const remainingTasks = tasks.filter((task) => task.id !== deletedTaskId);
    setTasks(remainingTasks);
    setSelectedTaskId((currentId) =>
      currentId === deletedTaskId ? (remainingTasks[0]?.id ?? null) : currentId,
    );
    setTaskToDelete(null);
    toast({ title: "Tâche supprimée" });
  };

  const toggleNewTaskAssignee = (memberId: number) => {
    setNewTask((current) => ({
      ...current,
      assigned_to: current.assigned_to.includes(memberId)
        ? current.assigned_to.filter((id) => id !== memberId)
        : [...current.assigned_to, memberId],
    }));
  };

  const toggleTaskAssignee = async (task: Task, memberId: number) => {
    const currentAssignees = task.assigned_to || [];
    const assignedTo = currentAssignees.includes(memberId)
      ? currentAssignees.filter((id) => id !== memberId)
      : [...currentAssignees, memberId];

    setUpdatingTeam(true);
    const saved = await handleUpdateTask(task.id, {
      assigned_to: assignedTo,
    });
    setUpdatingTeam(false);
    return saved;
  };

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    return tasks.filter((task) => {
      const matchesSearch =
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description?.toLowerCase().includes(normalizedQuery);
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [filterPriority, searchQuery, tasks]);

  const selectedTask =
    filteredTasks.find((task) => task.id === selectedTaskId) ||
    filteredTasks[0] ||
    null;

  const assignedMembers = selectedTask
    ? teamMembers.filter((member) =>
        selectedTask.assigned_to?.includes(member.id),
      )
    : [];

  const stats = {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === "todo").length,
    inProgress: tasks.filter((task) => task.status === "in-progress").length,
    completion: tasks.length
      ? Math.round(
          (tasks.filter((task) => task.status === "done").length /
            tasks.length) *
            100,
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
            Execution management
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Registre des tâches
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm leading-6 text-muted-foreground">
            Priorisez le travail, attribuez les responsabilités et faites
            progresser chaque action depuis une vue unique.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <dl className="flex divide-x divide-border/70">
            {[
              { label: "Total", value: stats.total },
              { label: "À faire", value: stats.todo },
              { label: "En cours", value: stats.inProgress },
              { label: "Complétion", value: `${stats.completion}%` },
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
                Nouvelle tâche
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl tracking-[-0.035em]">
                  Créer une tâche
                </DialogTitle>
                <DialogDescription>
                  Définissez l’action, sa priorité et les personnes responsables.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddTask} className="mt-2 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="task-title" className="text-sm font-medium">
                      Titre
                    </label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange={(event) =>
                        setNewTask({ ...newTask, title: event.target.value })
                      }
                      placeholder="Ex. Finaliser le mémorandum d’investissement"
                      className="h-11 rounded-xl"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label
                      htmlFor="task-description"
                      className="text-sm font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      id="task-description"
                      value={newTask.description}
                      onChange={(event) =>
                        setNewTask({
                          ...newTask,
                          description: event.target.value,
                        })
                      }
                      placeholder="Résultat attendu et éléments de contexte."
                      className="min-h-24 resize-none rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="task-priority" className="text-sm font-medium">
                      Priorité
                    </label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) =>
                        setNewTask({
                          ...newTask,
                          priority: value as Task["priority"],
                        })
                      }
                    >
                      <SelectTrigger id="task-priority" className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="task-deadline" className="text-sm font-medium">
                      Échéance
                    </label>
                    <Input
                      id="task-deadline"
                      type="date"
                      value={newTask.due_date}
                      onChange={(event) =>
                        setNewTask({ ...newTask, due_date: event.target.value })
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>

                  {teamMembers.length > 0 && (
                    <div className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-medium">Responsables</span>
                      <div className="grid max-h-44 gap-1 overflow-y-auto rounded-xl border p-2 sm:grid-cols-2">
                        {teamMembers.map((member) => (
                          <label
                            key={member.id}
                            htmlFor={`new-task-member-${member.id}`}
                            className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted"
                          >
                            <Checkbox
                              id={`new-task-member-${member.id}`}
                              checked={newTask.assigned_to.includes(member.id)}
                              onCheckedChange={() =>
                                toggleNewTaskAssignee(member.id)
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
                    {creating ? "Création…" : "Créer la tâche"}
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
                placeholder="Rechercher une tâche"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 rounded-xl border-border/60 bg-background pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-9 rounded-xl border-border/60 bg-background text-xs">
                <SelectValue placeholder="Toutes les priorités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="high">Priorité haute</SelectItem>
                <SelectItem value="medium">Priorité moyenne</SelectItem>
                <SelectItem value="low">Priorité basse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-[310px] overflow-y-auto p-2 lg:max-h-[calc(100dvh-18rem)]">
            {filteredTasks.map((task) => {
              const selected = selectedTask?.id === task.id;
              const status = STATUS_CONFIG[task.status];
              const priority = PRIORITY_CONFIG[task.priority];

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`group/list mb-1 w-full rounded-xl p-3.5 text-left outline-none transition-[background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-ring ${
                    selected
                      ? "bg-[#20231e] text-[#f7f7f2] shadow-[0_14px_30px_-24px_rgba(20,24,18,0.8)] dark:bg-[#eceee7] dark:text-[#181a16]"
                      : "hover:translate-x-0.5 hover:bg-background"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priority.dotClassName}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="line-clamp-2 text-sm font-semibold leading-5">
                          {task.title}
                        </span>
                        <CaretRight
                          className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover/list:translate-x-0.5 ${
                            selected ? "opacity-80" : "text-muted-foreground"
                          }`}
                          weight="bold"
                        />
                      </span>
                      <span
                        className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${
                          selected
                            ? "text-[#bdc3b4] dark:text-[#55594f]"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span>{status.label}</span>
                        <span
                          className={
                            isOverdue(task) ? "text-red-400" : undefined
                          }
                        >
                          {formatDate(task.due_date)}
                        </span>
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}

            {!filteredTasks.length && (
              <div className="px-4 py-14 text-center">
                <ListChecks className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                  {tasks.length ? "Aucun résultat" : "Aucune tâche pour le moment"}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {tasks.length
                    ? "Modifiez la recherche ou la priorité."
                    : "Créez une première action à piloter."}
                </p>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          {selectedTask ? (
            <div className="p-5 sm:p-7 lg:p-10 xl:p-12">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <ListChecks className="h-4 w-4" weight="duotone" />
                  TASK-{String(selectedTask.id).padStart(3, "0")}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTaskToDelete(selectedTask)}
                  className="h-8 rounded-lg px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash className="mr-1.5 h-4 w-4" />
                  Supprimer
                </Button>
              </div>

              <div className="mt-5 max-w-4xl">
                <InlineTextEdit
                  value={selectedTask.title}
                  placeholder="Titre de la tâche"
                  ariaLabel="Titre de la tâche"
                  required
                  onSave={(title) =>
                    handleUpdateTask(selectedTask.id, { title })
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
                  value={selectedTask.description}
                  placeholder="Ajoutez le résultat attendu, les dépendances ou les points de contrôle."
                  ariaLabel={`Description de ${selectedTask.title}`}
                  multiline
                  onSave={(description) =>
                    handleUpdateTask(selectedTask.id, { description })
                  }
                  displayClassName="min-h-28 rounded-xl border border-dashed border-border/80 bg-muted/15 p-4 text-[15px] leading-7 transition-[border-color,background-color] hover:border-foreground/30 hover:bg-muted/30"
                  inputClassName="min-h-32 rounded-xl text-[15px] leading-7"
                  iconClassName="mt-1 h-4 w-4 opacity-50"
                />
              </section>

              <div className="mt-10 grid gap-10 border-t border-border/70 pt-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
                <div className="space-y-8">
                  <section>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Workflow
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                      État d’avancement
                    </h2>
                    <div className="mt-5 grid gap-2 sm:grid-cols-3">
                      {(Object.keys(STATUS_CONFIG) as Task["status"][]).map(
                        (statusKey) => {
                          const config = STATUS_CONFIG[statusKey];
                          const StatusIcon = config.icon;
                          const active = selectedTask.status === statusKey;

                          return (
                            <button
                              key={statusKey}
                              type="button"
                              onClick={() =>
                                void handleUpdateTask(selectedTask.id, {
                                  status: statusKey,
                                })
                              }
                              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm outline-none transition-[background-color,border-color,transform] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring ${
                                active
                                  ? "border-[#68764f] bg-[#eef1e6] font-semibold dark:border-[#9dab7f] dark:bg-[#252a21]"
                                  : "border-border/70 hover:bg-muted/30"
                              }`}
                            >
                              <StatusIcon
                                className={`h-4 w-4 ${
                                  active ? "text-[#68764f]" : "text-muted-foreground"
                                }`}
                                weight={active ? "fill" : "regular"}
                              />
                              {config.label}
                              {active && (
                                <Check
                                  className="ml-auto h-3.5 w-3.5 text-[#68764f]"
                                  weight="bold"
                                />
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </section>

                  <section className="grid overflow-hidden rounded-xl border border-border/70 sm:grid-cols-2">
                    <div className="space-y-2 border-b border-border/70 p-4 sm:border-b-0 sm:border-r">
                      <label
                        htmlFor={`priority-${selectedTask.id}`}
                        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Priorité
                      </label>
                      <Select
                        value={selectedTask.priority}
                        onValueChange={(value) =>
                          void handleUpdateTask(selectedTask.id, {
                            priority: value as Task["priority"],
                          })
                        }
                      >
                        <SelectTrigger
                          id={`priority-${selectedTask.id}`}
                          className={`h-10 rounded-lg ${
                            PRIORITY_CONFIG[selectedTask.priority].className
                          }`}
                        >
                          <Flag className="mr-2 h-4 w-4" weight="fill" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="low">Basse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 p-4">
                      <label
                        htmlFor={`task-deadline-${selectedTask.id}`}
                        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Échéance
                      </label>
                      <div className="relative">
                        <CalendarBlank
                          className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                            isOverdue(selectedTask)
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        />
                        <Input
                          id={`task-deadline-${selectedTask.id}`}
                          type="date"
                          value={selectedTask.due_date || ""}
                          onChange={(event) =>
                            void handleUpdateTask(selectedTask.id, {
                              due_date: event.target.value || null,
                            })
                          }
                          className={`h-10 rounded-lg pl-9 ${
                            isOverdue(selectedTask)
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
                        Responsables
                      </p>
                      <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                        Équipe assignée
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
                          Assignez les personnes chargées de cette action.
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
                    <PopoverContent align="end" className="w-80 rounded-xl p-2">
                      <div className="px-2 pb-2 pt-1">
                        <p className="text-sm font-semibold">Responsables</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Les changements sont enregistrés immédiatement.
                        </p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {teamMembers.map((member) => {
                          const checked =
                            selectedTask.assigned_to?.includes(member.id) ||
                            false;

                          return (
                            <label
                              key={member.id}
                              htmlFor={`task-assigned-${selectedTask.id}-${member.id}`}
                              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                            >
                              <Checkbox
                                id={`task-assigned-${selectedTask.id}-${member.id}`}
                                checked={checked}
                                disabled={updatingTeam}
                                onCheckedChange={() =>
                                  void toggleTaskAssignee(
                                    selectedTask,
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
                    <CalendarBlank
                      className={`h-4 w-4 ${
                        isOverdue(selectedTask) ? "text-destructive" : ""
                      }`}
                    />
                    <span
                      className={isOverdue(selectedTask) ? "text-destructive" : ""}
                    >
                      {isOverdue(selectedTask) && "Échéance dépassée · "}
                      {formatDate(selectedTask.due_date)}
                    </span>
                  </div>
                </aside>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[650px] place-items-center p-8 text-center">
              <div>
                <ListChecks
                  className="mx-auto h-8 w-8 text-muted-foreground"
                  weight="duotone"
                />
                <h2 className="mt-4 text-lg font-semibold">
                  Aucune tâche sélectionnée
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Créez une tâche ou modifiez les filtres pour ouvrir son espace
                  de suivi.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <AlertDialog
        open={Boolean(taskToDelete)}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette tâche ?</AlertDialogTitle>
            <AlertDialogDescription>
              {taskToDelete?.title} sera supprimée définitivement. Cette action
              ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Conserver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteTask()}
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
