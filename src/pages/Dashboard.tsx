import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { okrService } from '../services/okrService';
import { teamService } from '../services/teamService';
import { notificationService, Notification } from '../services/notificationService';
import { Task, Project, OKR, TeamMember } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  CheckSquare, FolderKanban, Target, Users,
  AlertTriangle, TrendingUp, Clock, ArrowRight
} from 'lucide-react';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
const STATUS_COLORS = { todo: '#94a3b8', 'in-progress': '#3b82f6', done: '#22c55e' };

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [okrs, setOKRs] = useState<OKR[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, projectsData, okrsData, teamData, notifData] = await Promise.all([
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
      setNotifications(notifData || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  };

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const onTrackOKRs = okrs.filter(o => o.status === 'on-track').length;
  const performance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const activeProjectsList = projects.filter(p => p.status === 'active');
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  // Data for charts
  const taskStatusData = [
    { name: 'À faire', value: tasks.filter(t => t.status === 'todo').length, color: STATUS_COLORS['todo'] },
    { name: 'En cours', value: tasks.filter(t => t.status === 'in-progress').length, color: STATUS_COLORS['in-progress'] },
    { name: 'Terminé', value: tasks.filter(t => t.status === 'done').length, color: STATUS_COLORS['done'] },
  ].filter(d => d.value > 0);

  const taskPriorityData = [
    { name: 'Haute', value: tasks.filter(t => t.priority === 'high').length, color: PRIORITY_COLORS.high },
    { name: 'Moyenne', value: tasks.filter(t => t.priority === 'medium').length, color: PRIORITY_COLORS.medium },
    { name: 'Basse', value: tasks.filter(t => t.priority === 'low').length, color: PRIORITY_COLORS.low },
  ].filter(d => d.value > 0);

  const projectProgressData = projects
    .filter(p => p.status !== 'completed')
    .slice(0, 6)
    .map(p => ({ name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name, progress: p.progress }));

  const getPriorityColor = (priority: string) => {
    const colors = { high: 'destructive', medium: 'default', low: 'secondary' };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return date;
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto p-8 space-y-8">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-muted-foreground mb-2">Tâches complétées</p>
                <div className="text-[32px] font-semibold tracking-tight leading-none">
                  {completedTasks}<span className="text-lg text-muted-foreground font-normal">/{totalTasks}</span>
                </div>
                <Progress value={performance} className="mt-3 h-1.5" />
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-muted-foreground mb-2">Projets actifs</p>
                <div className="text-[32px] font-semibold tracking-tight leading-none">
                  {activeProjects}<span className="text-lg text-muted-foreground font-normal">/{projects.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {projects.filter(p => p.status === 'completed').length} terminé{projects.filter(p => p.status === 'completed').length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-muted-foreground mb-2">OKRs on track</p>
                <div className="text-[32px] font-semibold tracking-tight leading-none">
                  {onTrackOKRs}<span className="text-lg text-muted-foreground font-normal">/{okrs.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {okrs.filter(o => o.status === 'at-risk').length} à risque
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-muted-foreground mb-2">Équipe</p>
                <div className="text-[32px] font-semibold tracking-tight leading-none">{team.length}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Set(team.map(m => m.role)).size} rôle{new Set(team.map(m => m.role)).size > 1 ? 's' : ''}
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes critiques */}
      {notifications.filter(n => n.type === 'error').length > 0 && (
        <Card className="border-l-4 border-l-red-500 border-border/50 shadow-none bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="py-4 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-red-700 dark:text-red-400">
                    {notifications.filter(n => n.type === 'error').length} alerte{notifications.filter(n => n.type === 'error').length > 1 ? 's' : ''} critique{notifications.filter(n => n.type === 'error').length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notifications.filter(n => n.type === 'error')[0]?.message}
                  </p>
                </div>
              </div>
              <Link to="/notifications">
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  Voir tout <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition statuts */}
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">Statuts des tâches</CardTitle>
          </CardHeader>
          <CardContent>
            {taskStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Tâches']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {taskStatusData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune tâche
              </div>
            )}
          </CardContent>
        </Card>

        {/* Répartition priorités */}
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">Priorités des tâches</CardTitle>
          </CardHeader>
          <CardContent>
            {taskPriorityData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={taskPriorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {taskPriorityData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Tâches']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {taskPriorityData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune tâche
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progression projets */}
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">Progression des projets</CardTitle>
          </CardHeader>
          <CardContent>
            {projectProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={projectProgressData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Progression']} />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                    {projectProgressData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.progress >= 70 ? '#22c55e' : entry.progress >= 30 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[210px] flex items-center justify-center text-muted-foreground text-sm">
                Aucun projet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tâches en cours + Priorités hautes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-semibold tracking-tight">Tâches en cours</h2>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Voir tout <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          {inProgressTasks.length > 0 ? (
            <div className="space-y-2.5">
              {inProgressTasks.slice(0, 5).map((task) => (
                <Card key={task.id} className="border border-border/50 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[14px] truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                          {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </Badge>
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(task.due_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-border/70">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                Aucune tâche en cours
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-semibold tracking-tight">
              Priorité haute
              {highPriorityCount > 0 && (
                <span className="ml-2 text-sm font-normal text-red-500 dark:text-red-400">({highPriorityCount})</span>
              )}
            </h2>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Voir tout <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          {tasks.filter(t => t.priority === 'high' && t.status !== 'done').length > 0 ? (
            <div className="space-y-2.5">
              {tasks
                .filter(t => t.priority === 'high' && t.status !== 'done')
                .slice(0, 5)
                .map((task) => (
                  <Card key={task.id} className="border border-red-200 dark:border-red-900/50 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-[14px] truncate flex-1">{task.title}</p>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {task.status === 'todo' ? 'À faire' : 'En cours'}
                        </Badge>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                          <Clock className="h-3 w-3" />
                          Échéance : {formatDate(task.due_date)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="border border-dashed border-border/70">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                Aucune tâche haute priorité en attente
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Projets actifs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-semibold tracking-tight">Projets actifs</h2>
          <Link to="/projects">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Voir tout <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
        {activeProjectsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeProjectsList.slice(0, 3).map((project) => (
              <Card key={project.id} className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200">
                <CardHeader className="pb-2 pt-5">
                  <CardTitle className="text-[16px] font-semibold line-clamp-1">{project.name}</CardTitle>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{project.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Progression</span>
                      <span className={`font-semibold ${project.progress >= 70 ? 'text-green-600' : project.progress >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {project.progress}%
                      </span>
                    </div>
                    <Progress
                      value={project.progress}
                      className={`h-2 ${project.progress >= 70 ? '[&>div]:bg-green-500' : project.progress >= 30 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                    />
                  </div>
                  {project.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Deadline : {formatDate(project.deadline)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-dashed border-border/70">
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              Aucun projet actif
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
