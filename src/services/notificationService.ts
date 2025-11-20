import { taskService } from './taskService';
import { projectService } from './projectService';
import { okrService } from './okrService';

export interface Notification {
  type: 'error' | 'warning' | 'info';
  icon: string;
  message: string;
  link?: string;
  task_id?: number;
  project_id?: number;
  okr_id?: number;
}

export const notificationService = {
  // Générer les notifications en temps réel
  async getNotifications(): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tâches en retard
    const tasks = await taskService.getAllTasks();
    for (const task of tasks) {
      if (task.due_date && task.status !== 'done') {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          notifications.push({
            type: 'error',
            icon: '🔴',
            message: `Tâche en retard: ${task.title} (${daysLate} jour${daysLate > 1 ? 's' : ''})`,
            link: 'tasks',
            task_id: task.id
          });
        } else {
          const threeDaysFromNow = new Date(today);
          threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

          if (dueDate <= threeDaysFromNow) {
            const daysLeft = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            notifications.push({
              type: 'warning',
              icon: '⚠️',
              message: `Deadline proche: ${task.title} (dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''})`,
              link: 'tasks',
              task_id: task.id
            });
          }
        }
      }
    }

    // OKRs off-track
    const okrs = await okrService.getAllOKRs();
    for (const okr of okrs) {
      if (okr.status === 'off-track') {
        notifications.push({
          type: 'warning',
          icon: '🎯',
          message: `OKR off-track: ${okr.objective}`,
          link: 'okrs',
          okr_id: okr.id
        });
      }
    }

    // Projets bloqués (progression < 10%)
    const projects = await projectService.getAllProjects();
    for (const project of projects) {
      if (project.status === 'active' && project.progress < 10) {
        notifications.push({
          type: 'info',
          icon: '📁',
          message: `Projet bloqué: ${project.name} (${project.progress}%)`,
          link: 'projects',
          project_id: project.id
        });
      }
    }

    return notifications;
  },
};
