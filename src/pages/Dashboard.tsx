import { useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { okrService } from '../services/okrService';
import { notificationService, Notification } from '../services/notificationService';
import { Task, Project, OKR } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [okrs, setOKRs] = useState<OKR[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [tasksData, projectsData, okrsData, notifData] = await Promise.all([
      taskService.getAllTasks(),
      projectService.getAllProjects(),
      okrService.getAllOKRs(),
      notificationService.getNotifications(),
    ]);

    setTasks(tasksData);
    setProjects(projectsData);
    setOKRs(okrsData);
    setNotifications(notifData);
    setLoading(false);
  };

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const onTrackOKRs = okrs.filter(o => o.status === 'on-track').length;
  const performance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const activeProjectsList = projects.filter(p => p.status === 'active');

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      high: '🔴 Haute',
      medium: '🟡 Moyenne',
      low: '🟢 Basse'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-12 space-y-10">
      <div>
        <h1 className="text-[40px] font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-[15px]">Vue d'ensemble de vos projets et tâches</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">
              Tâches complétées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[32px] font-semibold tracking-tight">
              {completedTasks}/{totalTasks}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">
              Projets actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[32px] font-semibold tracking-tight">{activeProjects}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">
              OKRs on track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[32px] font-semibold tracking-tight">{onTrackOKRs}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-[13px] font-medium text-muted-foreground">
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[32px] font-semibold tracking-tight">{performance}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes importantes */}
      {notifications.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">🔔 Alertes importantes</h2>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notif, index) => (
              <Card key={index} className={`border-l-4 ${
                notif.type === 'error' ? 'border-l-red-500' :
                notif.type === 'warning' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <CardContent className="py-3">
                  <span>{notif.icon} {notif.message}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          {notifications.length > 3 && (
            <p className="text-sm text-muted-foreground mt-2">
              📢 +{notifications.length - 3} autres notifications. Voir la page Notifications.
            </p>
          )}
        </div>
      )}

      {/* Tâches en cours et Répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-[24px] font-semibold mb-5 tracking-tight">Tâches en cours</h2>
          {inProgressTasks.length > 0 ? (
            <div className="space-y-3">
              {inProgressTasks.slice(0, 5).map((task) => (
                <Card key={task.id} className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-[15px] mb-2.5">{task.title}</h3>
                        <div className="flex flex-wrap gap-2 text-[13px] text-muted-foreground">
                          <Badge variant={getPriorityColor(task.priority) as any}>
                            {getPriorityLabel(task.priority)}
                          </Badge>
                          <span>👤 {task.assignee || 'Non assigné'}</span>
                          <span>📅 {task.due_date || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucune tâche en cours
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-[24px] font-semibold mb-5 tracking-tight">Répartition</h2>
          <Card className="border border-border/50 shadow-none">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">📝 À faire</span>
                <span className="font-semibold">
                  {tasks.filter(t => t.status === 'todo').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">🚧 En cours</span>
                <span className="font-semibold">
                  {tasks.filter(t => t.status === 'in-progress').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">✅ Terminées</span>
                <span className="font-semibold">{completedTasks}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="py-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">👥 Membres d'équipe</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">📁 Total projets</span>
                <span className="font-semibold">{projects.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Projets actifs */}
      <div>
        <h2 className="text-[24px] font-semibold mb-5 tracking-tight">Projets actifs</h2>
        {activeProjectsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeProjectsList.slice(0, 3).map((project) => (
              <Card key={project.id} className="border border-border/50 shadow-none hover:shadow-sm hover:border-border transition-all duration-200 cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[17px] font-semibold">{project.name}</CardTitle>
                  <Badge className="w-fit">🟢 Actif</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-semibold">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                  {project.deadline && (
                    <div className="text-sm text-muted-foreground">
                      📅 {project.deadline}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun projet actif
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
