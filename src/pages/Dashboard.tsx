import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CalendarBlank,
  ChartLineUp,
  CheckCircle,
  Clock,
  Flag,
  Pulse,
  Target,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { okrService } from "@/services/okrService";
import { teamService } from "@/services/teamService";
import {
  notificationService,
  Notification,
} from "@/services/notificationService";
import { OKR, Project, Task, TeamMember } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const TASK_STATUS_COLORS = {
  todo: "#a1a1aa",
  "in-progress": "#7390a6",
  done: "#75845a",
};

const formatDate = (date?: string | null) => {
  if (!date) return "Sans échéance";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [okrs, setOKRs] = useState<OKR[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [tasksData, projectsData, okrsData, teamData, notificationData] =
      await Promise.all([
        taskService.getAllTasks(),
        projectService.getAllProjects(),
        okrService.getAllOKRs(),
        teamService.getAllTeam(),
        notificationService.getNotifications(),
      ]);
    setTasks(tasksData || []);
    setProjects(projectsData || []);
    setOKRs(okrsData || []);
    setTeam(teamData || []);
    setNotifications(notificationData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1480px] space-y-7 p-5 sm:p-8">
        <div className="h-12 w-72 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="h-80 animate-pulse rounded-2xl bg-muted" />
          <div className="h-80 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const taskCompletion = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const activeProjects = projects.filter(
    (project) => project.status === "active",
  );
  const averageProjectProgress = projects.length
    ? Math.round(
        projects.reduce((total, project) => total + project.progress, 0) /
          projects.length,
      )
    : 0;
  const onTrackOKRs = okrs.filter((okr) => okr.status === "on-track").length;
  const okrHealth = okrs.length
    ? Math.round((onTrackOKRs / okrs.length) * 100)
    : 0;
  const portfolioHealth = Math.round(
    (taskCompletion + averageProjectProgress + okrHealth) / 3,
  );
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress",
  );
  const priorityTasks = tasks.filter(
    (task) => task.priority === "high" && task.status !== "done",
  );
  const criticalNotifications = notifications.filter(
    (notification) => notification.type === "error",
  );

  const projectProgressData = projects
    .filter((project) => project.status !== "completed")
    .slice(0, 7)
    .map((project) => ({
      name:
        project.name.length > 18
          ? `${project.name.slice(0, 18)}…`
          : project.name,
      progress: project.progress,
    }));

  const taskStatusData = [
    {
      name: "À faire",
      value: tasks.filter((task) => task.status === "todo").length,
      color: TASK_STATUS_COLORS.todo,
    },
    {
      name: "En cours",
      value: inProgressTasks.length,
      color: TASK_STATUS_COLORS["in-progress"],
    },
    {
      name: "Terminées",
      value: completedTasks,
      color: TASK_STATUS_COLORS.done,
    },
  ].filter((item) => item.value > 0);

  const metrics = [
    {
      label: "Exécution des tâches",
      value: `${taskCompletion}%`,
      detail: `${completedTasks} sur ${tasks.length}`,
      icon: CheckCircle,
    },
    {
      label: "Projets actifs",
      value: activeProjects.length,
      detail: `${projects.length} au total`,
      icon: Briefcase,
    },
    {
      label: "OKR dans les temps",
      value: onTrackOKRs,
      detail: `${okrs.length} suivis`,
      icon: Target,
    },
    {
      label: "Membres",
      value: team.length,
      detail: `${new Set(team.map((member) => member.role)).size} rôles`,
      icon: UsersThree,
    },
  ];

  return (
    <div className="mx-auto max-w-[1480px] space-y-7 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Executive overview
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Vue d’ensemble
          </h1>
          <p className="mt-2 text-sm capitalize text-muted-foreground">
            {new Intl.DateTimeFormat("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </p>
        </div>
        <Button asChild variant="outline" className="self-start rounded-xl lg:self-auto">
          <Link to="/reports">
            Ouvrir le rapport complet
            <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
          </Link>
        </Button>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-2xl bg-[#20231e] p-6 text-[#f2f4ed] sm:p-8">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_88%_18%,rgba(210,224,164,0.32),transparent_30%)]" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-[#b8bfb0]">
                <Pulse className="h-4 w-4 text-[#d4dfaa]" weight="fill" />
                Santé du portefeuille
              </div>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-[#c5cbbf]">
                Temps réel
              </span>
            </div>

            <div className="mt-10 flex items-end gap-4">
              <span className="font-mono text-7xl font-semibold tracking-[-0.09em] sm:text-8xl">
                {portfolioHealth}
              </span>
              <span className="mb-3 text-2xl text-[#aeb5a4]">/100</span>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#bdc3b7]">
              Indice calculé à partir de la complétion des tâches, de la
              progression moyenne des projets et des OKR dans les temps.
            </p>

            <div className="mt-10 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
              {[
                { label: "Tâches", value: taskCompletion },
                { label: "Projets", value: averageProjectProgress },
                { label: "OKR", value: okrHealth },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#aeb5a4]">{label}</span>
                    <span className="font-mono">{value}%</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full origin-left rounded-full bg-[#d4dfaa]"
                      style={{ transform: `scaleX(${value / 100})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <dl className="grid overflow-hidden rounded-2xl border border-border/70 sm:grid-cols-2">
          {metrics.map(({ label, value, detail, icon: Icon }, index) => (
            <div
              key={label}
              className={`p-5 sm:p-6 ${
                index % 2 === 1 ? "sm:border-l" : ""
              } ${index > 1 ? "border-t" : index === 1 ? "border-t sm:border-t-0" : ""} border-border/70`}
            >
              <Icon className="h-5 w-5 text-muted-foreground" weight="duotone" />
              <dd className="mt-7 font-mono text-3xl font-semibold tracking-[-0.04em] tabular-nums">
                {value}
              </dd>
              <dt className="mt-2 text-sm font-medium">{label}</dt>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </dl>
      </section>

      {criticalNotifications.length > 0 && (
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-red-200 bg-red-50/70 p-4 sm:flex-row sm:items-center dark:border-red-900/60 dark:bg-red-950/25">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300">
              <Warning className="h-4 w-4" weight="fill" />
            </span>
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                {criticalNotifications.length} alerte
                {criticalNotifications.length > 1 ? "s" : ""} à traiter
              </p>
              <p className="mt-1 text-xs text-red-700/75 dark:text-red-300/75">
                {criticalNotifications[0]?.message}
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="self-start text-red-700 hover:bg-red-100 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-900/40 sm:self-auto"
          >
            <Link to="/notifications">
              Voir les alertes
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-border/70 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Portefeuille
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                Progression des projets ouverts
              </h2>
            </div>
            <ChartLineUp className="h-5 w-5 text-muted-foreground" weight="duotone" />
          </div>

          {projectProgressData.length ? (
            <div className="mt-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectProgressData}
                  layout="vertical"
                  margin={{ left: 4, right: 24, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="2 5"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `${value}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    width={112}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Progression"]}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "hsl(var(--border))",
                      background: "hsl(var(--popover))",
                    }}
                  />
                  <Bar
                    dataKey="progress"
                    fill="#75845a"
                    radius={[0, 6, 6, 0]}
                    barSize={13}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid h-[280px] place-items-center text-center">
              <div>
                <Briefcase className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Aucun projet ouvert</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Les projets actifs apparaîtront ici.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/70 p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Exécution
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
              Répartition des tâches
            </h2>
          </div>

          {taskStatusData.length ? (
            <>
              <div className="relative mt-3 h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={84}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {taskStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "Tâches"]}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: "hsl(var(--border))",
                        background: "hsl(var(--popover))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <p className="font-mono text-3xl font-semibold">{tasks.length}</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      tâches
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-border/70 pt-4">
                {taskStatusData.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-lg font-semibold">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid h-[280px] place-items-center text-center">
              <div>
                <CheckCircle className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Aucune tâche</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border/70">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Actions en cours</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Travail actuellement engagé
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-lg">
              <Link to="/tasks">
                Tout voir
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-border/70">
            {inProgressTasks.slice(0, 5).map((task) => (
              <Link
                key={task.id}
                to="/tasks"
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    task.priority === "high"
                      ? "bg-red-500"
                      : task.priority === "medium"
                        ? "bg-amber-500"
                        : "bg-zinc-400"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {task.title}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {task.assigned_to?.length || 0} responsable
                    {(task.assigned_to?.length || 0) > 1 ? "s" : ""}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarBlank className="h-3.5 w-3.5" />
                  {formatDate(task.due_date)}
                </span>
              </Link>
            ))}
            {!inProgressTasks.length && (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                Aucune tâche en cours.
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Points d’attention</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tâches de priorité haute
              </p>
            </div>
            <span className="font-mono text-xl font-semibold text-red-600 dark:text-red-400">
              {priorityTasks.length}
            </span>
          </div>
          <div className="divide-y divide-border/70">
            {priorityTasks.slice(0, 5).map((task) => (
              <Link
                key={task.id}
                to="/tasks"
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
              >
                <Flag className="h-4 w-4 shrink-0 text-red-500" weight="fill" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {task.title}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(task.due_date)}
                </span>
              </Link>
            ))}
            {!priorityTasks.length && (
              <div className="px-5 py-10 text-center">
                <CheckCircle
                  className="mx-auto h-5 w-5 text-emerald-600"
                  weight="fill"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucun point critique en attente.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
