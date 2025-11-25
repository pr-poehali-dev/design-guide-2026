const AUTH_API_URL = 'https://functions.poehali.dev/10e5cca3-a0d1-4446-8603-cbe09825fee8';
const ARTICLES_API_URL = 'https://functions.poehali.dev/731eee2e-5164-469e-a9e3-2f082079a4bf';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'user';
  subscription_date?: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  preview_text?: string;
  category?: string;
  main_image_url?: string;
  status: 'draft' | 'published';
  author_id: number;
  author_name?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  article_id: number;
  progress_percent: number;
  completed: boolean;
  last_visited_at: string;
  title?: string;
  category?: string;
}

export const authApi = {
  async register(email: string, name: string, password: string) {
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, name, password }),
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    return response.json();
  },

  async googleAuth(google_id: string, email: string, name: string) {
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'google_auth', google_id, email, name }),
    });
    return response.json();
  },

  async verifyToken(token: string) {
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_token', token }),
    });
    return response.json();
  },
};

export const articlesApi = {
  async getAll(status?: 'draft' | 'published', category?: string) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    
    const response = await fetch(`${ARTICLES_API_URL}?${params.toString()}`);
    return response.json();
  },

  async getById(id: number) {
    const response = await fetch(`${ARTICLES_API_URL}?id=${id}`);
    return response.json();
  },

  async create(token: string, articleData: Partial<Article>) {
    const response = await fetch(ARTICLES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ action: 'create', ...articleData }),
    });
    return response.json();
  },

  async update(token: string, id: number, articleData: Partial<Article>) {
    const response = await fetch(ARTICLES_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ id, ...articleData }),
    });
    return response.json();
  },

  async updateProgress(token: string, article_id: number, progress_percent: number, completed: boolean) {
    const response = await fetch(ARTICLES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ action: 'update_progress', article_id, progress_percent, completed }),
    });
    return response.json();
  },

  async getUserProgress(token: string) {
    const response = await fetch(`${ARTICLES_API_URL}?action=progress`, {
      headers: { 'X-Auth-Token': token },
    });
    return response.json();
  },

  async getStats(token: string) {
    const response = await fetch(`${ARTICLES_API_URL}?action=stats`, {
      headers: { 'X-Auth-Token': token },
    });
    return response.json();
  },
};
