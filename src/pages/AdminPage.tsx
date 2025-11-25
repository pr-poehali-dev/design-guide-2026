import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { articlesApi, Article } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({ total_articles: 0, total_users: 0, subscribers: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    
    setLoading(true);
    const [articlesData, statsData] = await Promise.all([
      articlesApi.getAll(),
      articlesApi.getStats(token),
    ]);

    if (articlesData.articles) {
      setArticles(articlesData.articles);
    }
    if (statsData.stats) {
      setStats(statsData.stats);
    }
    setLoading(false);
  };

  const filteredArticles = articles.filter((article) => {
    if (filter === 'all') return true;
    return article.status === filter;
  });

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Доступ запрещен</CardTitle>
            <CardDescription>У вас нет прав для просмотра этой страницы</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">Админ-панель</h1>
          <Button onClick={() => navigate('/admin/article/new')}>
            <Icon name="Plus" size={16} />
            Новая статья
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Всего статей</CardDescription>
              <CardTitle className="text-3xl">{stats.total_articles}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Пользователей</CardDescription>
              <CardTitle className="text-3xl">{stats.total_users}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Подписчиков</CardDescription>
              <CardTitle className="text-3xl">{stats.subscribers}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Управление статьями</CardTitle>
            <CardDescription>Создавайте, редактируйте и публикуйте статьи</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="published">Опубликованные</TabsTrigger>
                <TabsTrigger value="draft">Черновики</TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="mt-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Статей не найдено
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Заголовок</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Автор</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.title}</TableCell>
                          <TableCell>
                            {article.category && (
                              <Badge variant="outline">{article.category}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{article.author_name}</TableCell>
                          <TableCell>
                            {article.status === 'published' ? (
                              <Badge>Опубликовано</Badge>
                            ) : (
                              <Badge variant="secondary">Черновик</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(article.created_at).toLocaleDateString('ru-RU')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/admin/article/${article.id}`)}
                            >
                              <Icon name="Edit" size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
