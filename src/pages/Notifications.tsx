import { useEffect, useState } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await notificationService.getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  const handleNotificationClick = (notif: Notification) => {
    if (notif.link === 'tasks') {
      navigate('/tasks');
    } else if (notif.link === 'projects') {
      navigate('/projects');
    } else if (notif.link === 'okrs') {
      navigate('/okrs');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const errors = notifications.filter(n => n.type === 'error');
  const warnings = notifications.filter(n => n.type === 'warning');
  const infos = notifications.filter(n => n.type === 'info');

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔔 Centre de notifications</h1>
        <p className="text-muted-foreground mt-2">
          Restez informé des tâches urgentes, deadlines et alertes importantes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-500">{errors.length}</div>
                <div className="text-sm text-muted-foreground">Urgent</div>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-500">{warnings.length}</div>
                <div className="text-sm text-muted-foreground">Attention</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-500">{infos.length}</div>
                <div className="text-sm text-muted-foreground">Info</div>
              </div>
              <Info className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <Bell className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">✅ Aucune notification !</h3>
              <p className="text-muted-foreground">Tout va bien. Continuez votre excellent travail !</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Urgent - Action requise */}
          {errors.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                🔴 Urgent - Action requise ({errors.length})
              </h2>
              {errors.map((notif, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${getBorderColor(notif.type)} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getIcon(notif.type)}
                        <div>
                          <p className="font-medium">{notif.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Cliquez pour voir les détails
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Attention requise */}
          {warnings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ⚠️ Attention requise ({warnings.length})
              </h2>
              {warnings.map((notif, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${getBorderColor(notif.type)} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getIcon(notif.type)}
                        <div>
                          <p className="font-medium">{notif.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Cliquez pour voir les détails
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Informations */}
          {infos.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                ℹ️ Informations ({infos.length})
              </h2>
              {infos.map((notif, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${getBorderColor(notif.type)} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getIcon(notif.type)}
                        <div>
                          <p className="font-medium">{notif.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Cliquez pour voir les détails
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={loadNotifications}>
          🔄 Actualiser les notifications
        </Button>
      </div>
    </div>
  );
}
