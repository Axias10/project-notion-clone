import { useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { okrService } from '../services/okrService';
import { teamService } from '../services/teamService';
import { Task, Project, OKR, TeamMember, KeyResult } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend
} from 'recharts';

const COLORS = {
  todo: '#94a3b8',
  'in-progress': '#3b82f6',
  done: '#22c55e',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
  planning: '#3b82f6',
  active: '#8b5cf6',
  completed: '#22c55e',
};

export default function Reports() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [okrs, setOKRs] = useState<OKR[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      taskService.getAllTasks(),
      projectService.getAllProjects(),
      okrService.getAllOKRs(),
      teamService.getAllTeam(),
    ]).then(([t, p, o, tm]) => {
      setTasks(t || []);
      setProjects(p || []);
      setOKRs(o || []);
      setTeam(tm || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-72 bg-muted animate-pulse rounded-lg" />)}
        </div>
      </div>
    );
  }

  // Task metrics
  const tasksByStatus = [
    { name: 'À faire', value: tasks.filter(t => t.status === 'todo').length, color: COLORS.todo },
    { name: 'En cours', value: tasks.filter(t => t.status === 'in-progress').length, color: COLORS['in-progress'] },
    { name: 'Terminé', value: tasks.filter(t => t.status === 'done').length, color: COLORS.done },
  ];

  const tasksByPriority = [
    { name: 'Haute', value: tasks.filter(t => t.priority === 'high').length, color: COLORS.high },
    { name: 'Moyenne', value: tasks.filter(t => t.priority === 'medium').length, color: COLORS.medium },
    { name: 'Basse', value: tasks.filter(t => t.priority === 'low').length, color: COLORS.low },
  ];

  // Project metrics
  const projectsByStatus = [
    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: COLORS.planning },
    { name: 'Actif', value: projects.filter(p => p.status === 'active').length, color: COLORS.active },
    { name: 'Terminé', value: projects.filter(p => p.status === 'completed').length, color: COLORS.completed },
  ];

  const projectProgressData = projects
    .sort((a, b) => b.progress - a.progress)
    .map(p => ({
      name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
      progress: p.progress,
      fill: p.progress >= 70 ? '#22c55e' : p.progress >= 30 ? '#f59e0b' : '#ef4444',
    }));

  // Team workload: count tasks assigned per team member
  const teamWorkload = team.map(member => {
    const assignedTasks = tasks.filter(t => t.assigned_to?.includes(member.id));
    return {
      name: member.name.split(' ')[0],
      total: assignedTasks.length,
      todo: assignedTasks.filter(t => t.status === 'todo').length,
      'en-cours': assignedTasks.filter(t => t.status === 'in-progress').length,
      done: assignedTasks.filter(t => t.status === 'done').length,
    };
  }).filter(m => m.total > 0).sort((a, b) => b.total - a.total).slice(0, 8);

  // OKR progress
  const getOKRProgress = (okr: OKR): number => {
    const krs = Array.isArray(okr.key_results) ? okr.key_results as KeyResult[] : [];
    if (krs.length === 0) return 0;
    return Math.round(krs.reduce((sum, kr) => sum + (kr.progress / kr.target) * 100, 0) / krs.length);
  };

  // Global KPIs
  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
    : 0;
  const avgProjectProgress = projects.length > 0
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
    : 0;
  const onTrackOKRs = okrs.filter(o => o.status === 'on-track').length;
  const overdueProjects = projects.filter(p =>
    p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed'
  ).length;

  // Radar data for global health
  const healthData = [
    { metric: 'Tâches\ncomplétées', value: completionRate },
    { metric: 'Projets\nactifs', value: projects.length > 0 ? Math.round((projects.filter(p => p.status === 'active').length / projects.length) * 100) : 0 },
    { metric: 'OKRs\non track', value: okrs.length > 0 ? Math.round((onTrackOKRs / okrs.length) * 100) : 0 },
    { metric: 'Progression\nmoyenne', value: avgProjectProgress },
    { metric: 'Membres\nactifs', value: teamWorkload.length > 0 ? Math.min(100, Math.round((teamWorkload.length / Math.max(team.length, 1)) * 100)) : 0 },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rapports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vue synthétique de la performance de l'équipe
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/50 shadow-none">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium mb-2">Taux de complétion</p>
            <p className="text-3xl font-bold">{completionRate}%</p>
            <Progress value={completionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="border border-border/50 shadow-none">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium mb-2">Progression projets moy.</p>
            <p className="text-3xl font-bold">{avgProjectProgress}%</p>
            <Progress value={avgProjectProgress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="border border-border/50 shadow-none">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium mb-2">OKRs on track</p>
            <p className="text-3xl font-bold">{onTrackOKRs}<span className="text-lg text-muted-foreground font-normal">/{okrs.length}</span></p>
            <p className="text-xs text-muted-foreground mt-1">
              {okrs.filter(o => o.status === 'at-risk').length} à risque · {okrs.filter(o => o.status === 'off-track').length} off-track
            </p>
          </CardContent>
        </Card>
        <Card className={`border shadow-none ${overdueProjects > 0 ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20' : 'border-border/50'}`}>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium mb-2">Projets en retard</p>
            <p className={`text-3xl font-bold ${overdueProjects > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
              {overdueProjects}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueProjects === 0 ? 'Tout est dans les délais ✓' : 'deadline dépassée'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task status distribution */}
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">Répartition des tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 items-center">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={tasksByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                    {tasksByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'tâches']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {tasksByStatus.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <div>
                      <p className="text-xs text-muted-foreground">{d.name}</p>
                      <p className="text-lg font-bold leading-none">{d.value}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-1 border-t">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{tasks.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task priority distribution */}
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">Tâches par priorité</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tasksByPriority} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [v, 'tâches']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {tasksByPriority.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project progress */}
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">Progression des projets</CardTitle>
          </CardHeader>
          <CardContent>
            {projectProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={projectProgressData} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip formatter={v => [`${v}%`, 'Progression']} />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                    {projectProgressData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Aucun projet</div>
            )}
          </CardContent>
        </Card>

        {/* Team workload */}
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">Charge de travail par membre</CardTitle>
          </CardHeader>
          <CardContent>
            {teamWorkload.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={teamWorkload} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="todo" name="À faire" stackId="a" fill={COLORS.todo} />
                  <Bar dataKey="en-cours" name="En cours" stackId="a" fill={COLORS['in-progress']} />
                  <Bar dataKey="done" name="Terminé" stackId="a" fill={COLORS.done} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune tâche assignée à l'équipe
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* OKRs detail */}
      {okrs.length > 0 && (
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">État des OKRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {okrs.map(okr => {
                const progress = getOKRProgress(okr);
                const statusColors = {
                  'on-track': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
                  'at-risk': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
                  'off-track': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                };
                const barColors = {
                  'on-track': '[&>div]:bg-green-500',
                  'at-risk': '[&>div]:bg-yellow-500',
                  'off-track': '[&>div]:bg-red-500',
                };
                return (
                  <div key={okr.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${statusColors[okr.status]}`}>
                          {okr.status === 'on-track' ? 'On Track' : okr.status === 'at-risk' ? 'At Risk' : 'Off Track'}
                        </span>
                        <span className="text-sm font-medium truncate">{okr.objective}</span>
                        {okr.quarter && <span className="text-xs text-muted-foreground flex-shrink-0">{okr.quarter}</span>}
                      </div>
                      <span className="text-sm font-bold flex-shrink-0">{progress}%</span>
                    </div>
                    <Progress value={progress} className={`h-1.5 ${barColors[okr.status]}`} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health radar + project status pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Santé globale */}
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">Santé globale du projet</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={healthData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Statuts projets */}
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">Statuts des projets</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="flex gap-6 items-center">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={projectsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                      {projectsByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'projets']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {projectsByStatus.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <div>
                        <p className="text-xs text-muted-foreground">{d.name}</p>
                        <p className="text-lg font-bold leading-none">{d.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Aucun projet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
