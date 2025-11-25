import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { articlesApi, UserProgress } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

export default function ProfilePage() {
  const { user, logout, token } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      articlesApi.getUserProgress(token).then((data) => {
        if (data.progress) {
          setProgress(data.progress);
        }
        setLoading(false);
      });
    }
  }, [token]);

  if (!user) return null;

  const completedCount = progress.filter((p) => p.completed).length;
  const totalProgress = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.progress_percent, 0) / progress.length)
    : 0;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">Личный кабинет</h1>
          <Button variant="outline" onClick={logout}>
            <Icon name="LogOut" size={16} />
            Выйти
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription className="text-base">{user.email}</CardDescription>
                  {user.role === 'admin' && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                      Администратор
                    </span>
                  )}
                  {user.role === 'editor' && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                      Редактор
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Подписка</p>
                  <p className="text-base font-medium">
                    {user.subscription_date
                      ? `Активна с ${new Date(user.subscription_date).toLocaleDateString('ru-RU')}`
                      : 'Не оформлена'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Прогресс обучения</CardTitle>
              <CardDescription>Ваши изученные разделы</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : progress.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Вы еще не начали изучение разделов
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Общий прогресс</p>
                      <p className="text-3xl font-bold">{totalProgress}%</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Завершено {completedCount} из {progress.length}
                      </p>
                    </div>
                    <Icon name="TrendingUp" size={48} className="text-primary" />
                  </div>

                  <div className="space-y-4">
                    {progress.map((p) => (
                      <div key={p.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{p.title}</p>
                            {p.category && (
                              <p className="text-sm text-muted-foreground">{p.category}</p>
                            )}
                          </div>
                          <span className="text-sm font-medium">{p.progress_percent}%</span>
                        </div>
                        <Progress value={p.progress_percent} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
