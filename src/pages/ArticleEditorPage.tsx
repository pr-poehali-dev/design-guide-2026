import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { articlesApi, Article } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/RichTextEditor';
import Icon from '@/components/ui/icon';

export default function ArticleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [category, setCategory] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      articlesApi.getById(parseInt(id)).then((data) => {
        if (data.article) {
          const article: Article = data.article;
          setTitle(article.title);
          setContent(article.content);
          setPreviewText(article.preview_text || '');
          setCategory(article.category || '');
          setMainImageUrl(article.main_image_url || '');
          setStatus(article.status);
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const handleSave = async (newStatus: 'draft' | 'published') => {
    if (!token || !title || !content) return;

    setSaving(true);
    const articleData = {
      title,
      content,
      preview_text: previewText,
      category,
      main_image_url: mainImageUrl,
      status: newStatus,
    };

    const result = isNew
      ? await articlesApi.create(token, articleData)
      : await articlesApi.update(token, parseInt(id!), articleData);

    setSaving(false);

    if (result.article) {
      navigate('/admin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">
            {isNew ? 'Новая статья' : 'Редактировать статью'}
          </h1>
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <Icon name="X" size={16} />
            Закрыть
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок статьи</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите заголовок..."
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preview">Превью текст</Label>
              <Input
                id="preview"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Краткое описание статьи..."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Типографика">Типографика</SelectItem>
                    <SelectItem value="Колористика">Колористика</SelectItem>
                    <SelectItem value="Композиция">Композиция</SelectItem>
                    <SelectItem value="Сетки">Сетки</SelectItem>
                    <SelectItem value="Стили">Стили</SelectItem>
                    <SelectItem value="Анимация">Анимация</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL главного изображения</Label>
                <Input
                  id="image"
                  value={mainImageUrl}
                  onChange={(e) => setMainImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Содержание статьи</Label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={saving || !title || !content}
              >
                <Icon name="Save" size={16} />
                Сохранить черновик
              </Button>
              
              <Button
                size="lg"
                onClick={() => handleSave('published')}
                disabled={saving || !title || !content}
              >
                <Icon name="Send" size={16} />
                Опубликовать
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
