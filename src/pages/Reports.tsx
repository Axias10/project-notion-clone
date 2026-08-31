import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CalendarBlank,
  ChartBar,
  CheckCircle,
  Flag,
  Pulse,
  Target,
  TrendUp,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { teamService } from "@/services/teamService";
import { okrService } from "@/services/okrService";
import { OKR, Project, Task, TeamMember } from "@/lib/supabase";

type DeadlineHorizon = "7" | "30" | "90" | "all";

const statusLabels: Record<Task["status"], string> = {
  todo: "À faire",
  "in-progress": "En cours",
  done: "Terminées",
};

const statusColors: Record<Task["status"], string> = {
  todo: "#a1a1aa",
  "in-progress": "#7390a6",
  done: "#75845a",
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));

export default function Reports() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [okrs, setOKRs] = useState<OKR[]>([]);
  const [deadlineHorizon, setDeadlineHorizon] =
    useState<DeadlineHorizon>("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [projectsData, tasksData, teamData, okrsData] = await Promise.all([
      projectService.getAllProjects(),
      taskService.getAllTasks(),
      teamService.getAllTeam(),
      okrService.getAllOKRs(),
    ]);
    setProjects(projectsData || []);
    setTasks(tasksData || []);
    setTeam(teamData || []);
    setOKRs(okrsData || []);
    setLoading(false);
  };

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const limit =
      deadlineHorizon === "all"
        ? null
        : new Date(now.getTime() + Number(deadlineHorizon) * 86_400_000);

    return tasks
      .filter((task) => {
        if (!task.due_date || task.status === "done") return false;
        const deadline = new Date(`${task.due_date}T12:00:00`);
        return !limit || deadline <= limit;
      })
      .sort(
        (a, b) =>
          new Date(`${a.due_date}T12:00:00`).getTime() -
          new Date(`${b.due_date}T12:00:00`).getTime(),
      );
  }, [deadlineHorizon, tasks]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1480px] space-y-7 p-5 sm:p-8">
        <div className="h-12 w-80 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress",
  ).length;
  const taskCompletionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const averageProjectProgress = projects.length
    ? Math.round(
        projects.reduce((sum, project) => sum + project.progress, 0) /
          projects.length,
      )
    : 0;
  const averageOKRProgress = okrs.length
    ? Math.round(
        okrs.reduce((sum, okr) => sum + okr.progress, 0) / okrs.length,
      )
    : 0;
  const deliveryIndex = Math.round(
    (taskCompletionRate + averageProjectProgress + averageOKRProgress) / 3,
  );
  const activeProjects = projects.filter(
    (project) => project.status === "active",
  ).length;
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === "done") return false;
    return new Date(`${task.due_date}T23:59:59`) < new Date();
  }).length;

  const projectProgressData = [...projects]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 8)
    .map((project) => ({
      name:
        project.name.length > 21
          ? `${project.name.slice(0, 21)}…`
          : project.name,
      progression: project.progress,
    }));

  const teamWorkloadData = team
    .map((member) => ({
      name:
        member.name.length > 16
          ? `${member.name.slice(0, 16)}…`
          : member.name,
      tâches: tasks.filter((task) => task.assigned_to?.includes(member.id))
        .length,
    }))
    .sort((a, b) => b.tâches - a.tâches)
    .slice(0, 8);

  const taskSegments = (
    ["todo", "in-progress", "done"] as Task["status"][]
  ).map((status) => {
    const count = tasks.filter((task) => task.status === status).length;
    return {
      status,
      count,
      percentage: tasks.length ? (count / tasks.length) * 100 : 0,
    };
  });

  const metrics = [
    {
      label: "Tâches livrées",
      value: `${taskCompletionRate}%`,
      detail: `${completedTasks} sur ${tasks.length}`,
      icon: CheckCircle,
    },
    {
      label: "Progression projets",
      value: `${averageProjectProgress}%`,
      detail: `${activeProjects} actifs`,
      icon: Briefcase,
    },
    {
      label: "Progression OKR",
      value: `${averageOKRProgress}%`,
      detail: `${okrs.length} objectifs`,
      icon: Target,
    },
    {
      label: "Échéances dépassées",
      value: overdueTasks,
      detail: overdueTasks ? "À régulariser" : "Aucun retard",
      icon: Warning,
      critical: overdueTasks > 0,
    },
  ];

  return (
    <div className="mx-auto max-w-[1480px] space-y-7 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Portfolio intelligence
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Rapports
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Une lecture consolidée de l’exécution, des objectifs et des
            capacités de l’équipe.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Horizon des échéances
          </span>
          <Select
            value={deadlineHorizon}
            onValueChange={(value) =>
              setDeadlineHorizon(value as DeadlineHorizon)
            }
          >
            <SelectTrigger className="w-[150px] rounded-xl bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="90">90 jours</SelectItem>
              <SelectItem value="all">Tout afficher</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-2xl bg-[#20231e] p-6 text-[#f2f4ed] sm:p-8">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_86%_10%,rgba(210,224,164,0.4),transparent_34%)]" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-[#b8bfb0]">
                <Pulse className="h-4 w-4 text-[#d4dfaa]" weight="fill" />
                Indice de livraison
              </div>
              <TrendUp className="h-5 w-5 text-[#d4dfaa]" weight="duotone" />
            </div>
            <div className="mt-10 flex items-end gap-4">
              <span className="font-mono text-7xl font-semibold tracking-[-0.09em] sm:text-8xl">
                {deliveryIndex}
              </span>
              <span className="mb-3 text-2xl text-[#aeb5a4]">/100</span>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#bdc3b7]">
              Synthèse de la livraison des tâches, de l’avancement des projets
              et de la progression des objectifs.
            </p>

            <div className="mt-10">
              <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.13em] text-[#9fa798]">
                <span>Fragile</span>
                <span>Maîtrisé</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full origin-left rounded-full bg-[#d4dfaa]"
                  style={{ transform: `scaleX(${deliveryIndex / 100})` }}
                />
              </div>
            </div>
          </div>
        </div>

        <dl className="grid overflow-hidden rounded-2xl border border-border/70 sm:grid-cols-2">
          {metrics.map(
            ({ label, value, detail, icon: Icon, critical }, index) => (
              <div
                key={label}
                className={`p-5 sm:p-6 ${
                  index % 2 === 1 ? "sm:border-l" : ""
                } ${index > 1 ? "border-t" : index === 1 ? "border-t sm:border-t-0" : ""} border-border/70`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    critical ? "text-red-500" : "text-muted-foreground"
                  }`}
                  weight="duotone"
                />
                <dd
                  className={`mt-7 font-mono text-3xl font-semibold tracking-[-0.04em] tabular-nums ${
                    critical ? "text-red-600 dark:text-red-400" : ""
                  }`}
                >
                  {value}
                </dd>
                <dt className="mt-2 text-sm font-medium">{label}</dt>
                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
              </div>
            ),
          )}
        </dl>
      </section>

      <section className="rounded-2xl border border-border/70 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Flux d’exécution
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
              État du travail
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {inProgressTasks} tâche{inProgressTasks > 1 ? "s" : ""} en cours
              sur {tasks.length} éléments suivis.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="self-start rounded-lg">
            <Link to="/tasks">
              Ouvrir le registre
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {tasks.length ? (
          <>
            <div className="mt-8 flex h-3 overflow-hidden rounded-full bg-muted">
              {taskSegments.map((segment) => (
                <div
                  key={segment.status}
                  className="h-full"
                  style={{
                    width: `${segment.percentage}%`,
                    backgroundColor: statusColors[segment.status],
                  }}
                />
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {taskSegments.map((segment) => (
                <div
                  key={segment.status}
                  className="flex items-center justify-between border-t border-border/70 pt-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: statusColors[segment.status] }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {statusLabels[segment.status]}
                    </span>
                  </div>
                  <span className="font-mono text-lg font-semibold">
                    {segment.count}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Aucun travail enregistré pour le moment.
          </div>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-border/70 p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Portefeuille
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                Avancement par projet
              </h2>
            </div>
            <ChartBar className="h-5 w-5 text-muted-foreground" weight="duotone" />
          </div>

          {projectProgressData.length ? (
            <div className="mt-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectProgressData}
                  layout="vertical"
                  margin={{ left: 8, right: 24, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="2 5"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={130}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
                    dataKey="progression"
                    fill="#75845a"
                    radius={[0, 6, 6, 0]}
                    barSize={15}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid h-[320px] place-items-center text-center">
              <div>
                <Briefcase className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Aucun projet à analyser.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70">
          <div className="border-b border-border/70 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Risques
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                  Prochaines échéances
                </h2>
              </div>
              <span className="font-mono text-2xl font-semibold">
                {upcomingDeadlines.length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-border/70">
            {upcomingDeadlines.slice(0, 7).map((task) => {
              const isOverdue =
                new Date(`${task.due_date}T23:59:59`) < new Date();
              return (
                <Link
                  key={task.id}
                  to="/tasks"
                  className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:px-6"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      isOverdue
                        ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isOverdue ? (
                      <Warning className="h-4 w-4" weight="fill" />
                    ) : (
                      <CalendarBlank className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {task.title}
                    </span>
                    <span
                      className={`mt-1 block text-xs ${
                        isOverdue
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue ? "En retard · " : ""}
                      {formatDate(task.due_date!)}
                    </span>
                  </span>
                  {task.priority === "high" && (
                    <Flag className="h-3.5 w-3.5 text-red-500" weight="fill" />
                  )}
                </Link>
              );
            })}
            {!upcomingDeadlines.length && (
              <div className="px-6 py-14 text-center">
                <CheckCircle
                  className="mx-auto h-6 w-6 text-emerald-600"
                  weight="fill"
                />
                <p className="mt-3 text-sm font-medium">
                  Aucune échéance à risque
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sur l’horizon sélectionné.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-border/70 p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Capacité
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                Charge attribuée
              </h2>
            </div>
            <UsersThree
              className="h-5 w-5 text-muted-foreground"
              weight="duotone"
            />
          </div>
          {teamWorkloadData.length ? (
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teamWorkloadData}
                  layout="vertical"
                  margin={{ left: 2, right: 20, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="2 5"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={108}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    formatter={(value) => [value, "Tâches attribuées"]}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "hsl(var(--border))",
                      background: "hsl(var(--popover))",
                    }}
                  />
                  <Bar
                    dataKey="tâches"
                    fill="#7390a6"
                    radius={[0, 6, 6, 0]}
                    barSize={13}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid h-[300px] place-items-center text-center">
              <div>
                <UsersThree className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Aucun membre visible.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-5 sm:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Stratégie
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                Santé des objectifs
              </h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-lg">
              <Link to="/okrs">
                Piloter
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-border/70">
            {[...okrs]
              .sort((a, b) => a.progress - b.progress)
              .slice(0, 6)
              .map((okr) => (
                <Link
                  key={okr.id}
                  to="/okrs"
                  className="grid gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[1fr_180px_48px] sm:items-center sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{okr.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{okr.period}</span>
                      <span aria-hidden="true">·</span>
                      <span>{okr.key_results.length} résultats clés</span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full origin-left rounded-full ${
                        okr.status === "at-risk"
                          ? "bg-red-500"
                          : okr.status === "completed"
                            ? "bg-emerald-600"
                            : "bg-[#75845a]"
                      }`}
                      style={{ transform: `scaleX(${okr.progress / 100})` }}
                    />
                  </div>
                  <span className="font-mono text-sm font-semibold tabular-nums sm:text-right">
                    {okr.progress}%
                  </span>
                </Link>
              ))}
            {!okrs.length && (
              <div className="px-6 py-14 text-center">
                <Target className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Aucun objectif à analyser.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="flex flex-col justify-between gap-2 border-t border-border/70 pt-5 text-xs text-muted-foreground sm:flex-row">
        <span>
          Rapport instantané · données actuelles de Pantheon Capital Management
        </span>
        <span>
          Généré le{" "}
          {new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).format(new Date())}
        </span>
      </footer>
    </div>
  );
}
