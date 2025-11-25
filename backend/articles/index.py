'''
Business: Manage articles and content (CRUD operations, user progress tracking)
Args: event - dict with httpMethod, body, queryStringParameters, headers
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with articles data
'''

import json
import os
import re
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
from pydantic import BaseModel, Field, ValidationError


class CreateArticleRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)
    preview_text: Optional[str] = None
    category: Optional[str] = None
    main_image_url: Optional[str] = None
    status: str = Field(default='draft', pattern='^(draft|published)$')


class UpdateArticleRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None
    preview_text: Optional[str] = None
    category: Optional[str] = None
    main_image_url: Optional[str] = None
    status: Optional[str] = Field(None, pattern='^(draft|published)$')


class UpdateProgressRequest(BaseModel):
    article_id: int
    progress_percent: int = Field(..., ge=0, le=100)
    completed: bool = False


def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    decoded = jwt.decode(token, jwt_secret, algorithms=['HS256'])
    return decoded


def generate_slug(title: str) -> str:
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug[:500]


def handle_create_article(body_data: Dict[str, Any], user_data: Dict[str, Any]) -> Dict[str, Any]:
    if user_data['role'] not in ['admin', 'editor']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Insufficient permissions'})
        }
    
    req = CreateArticleRequest(**body_data)
    slug = generate_slug(req.title)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    published_at = datetime.utcnow() if req.status == 'published' else None
    
    cur.execute(
        """
        INSERT INTO articles (title, slug, content, preview_text, category, main_image_url, status, author_id, created_at, updated_at, published_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, title, slug, content, preview_text, category, main_image_url, status, author_id, created_at, updated_at, published_at
        """,
        (req.title, slug, req.content, req.preview_text, req.category, req.main_image_url, req.status, user_data['user_id'], datetime.utcnow(), datetime.utcnow(), published_at)
    )
    
    article = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'article': dict(article)}, default=str)
    }


def handle_update_article(article_id: int, body_data: Dict[str, Any], user_data: Dict[str, Any]) -> Dict[str, Any]:
    if user_data['role'] not in ['admin', 'editor']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Insufficient permissions'})
        }
    
    req = UpdateArticleRequest(**body_data)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    updates = []
    values = []
    
    if req.title is not None:
        updates.append("title = %s")
        values.append(req.title)
        updates.append("slug = %s")
        values.append(generate_slug(req.title))
    
    if req.content is not None:
        updates.append("content = %s")
        values.append(req.content)
    
    if req.preview_text is not None:
        updates.append("preview_text = %s")
        values.append(req.preview_text)
    
    if req.category is not None:
        updates.append("category = %s")
        values.append(req.category)
    
    if req.main_image_url is not None:
        updates.append("main_image_url = %s")
        values.append(req.main_image_url)
    
    if req.status is not None:
        updates.append("status = %s")
        values.append(req.status)
        if req.status == 'published':
            updates.append("published_at = %s")
            values.append(datetime.utcnow())
    
    updates.append("updated_at = %s")
    values.append(datetime.utcnow())
    
    values.append(article_id)
    
    query = f"UPDATE articles SET {', '.join(updates)} WHERE id = %s RETURNING id, title, slug, content, preview_text, category, main_image_url, status, author_id, created_at, updated_at, published_at"
    
    cur.execute(query, values)
    article = cur.fetchone()
    
    if not article:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Article not found'})
        }
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'article': dict(article)}, default=str)
    }


def handle_get_articles(query_params: Dict[str, Any]) -> Dict[str, Any]:
    status = query_params.get('status')
    category = query_params.get('category')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = "SELECT a.*, u.name as author_name FROM articles a JOIN users u ON a.author_id = u.id WHERE 1=1"
    params = []
    
    if status:
        query += " AND a.status = %s"
        params.append(status)
    
    if category:
        query += " AND a.category = %s"
        params.append(category)
    
    query += " ORDER BY a.created_at DESC"
    
    cur.execute(query, params)
    articles = cur.fetchall()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'articles': [dict(a) for a in articles]}, default=str)
    }


def handle_get_article(article_id: int) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "SELECT a.*, u.name as author_name FROM articles a JOIN users u ON a.author_id = u.id WHERE a.id = %s",
        (article_id,)
    )
    article = cur.fetchone()
    cur.close()
    conn.close()
    
    if not article:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Article not found'})
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'article': dict(article)}, default=str)
    }


def handle_update_progress(body_data: Dict[str, Any], user_data: Dict[str, Any]) -> Dict[str, Any]:
    req = UpdateProgressRequest(**body_data)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        """
        INSERT INTO user_progress (user_id, article_id, progress_percent, completed, last_visited_at)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (user_id, article_id) 
        DO UPDATE SET progress_percent = %s, completed = %s, last_visited_at = %s
        RETURNING id, user_id, article_id, progress_percent, completed, last_visited_at
        """,
        (user_data['user_id'], req.article_id, req.progress_percent, req.completed, datetime.utcnow(), req.progress_percent, req.completed, datetime.utcnow())
    )
    
    progress = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'progress': dict(progress)}, default=str)
    }


def handle_get_user_progress(user_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        """
        SELECT up.*, a.title, a.category 
        FROM user_progress up 
        JOIN articles a ON up.article_id = a.id 
        WHERE up.user_id = %s
        ORDER BY up.last_visited_at DESC
        """,
        (user_data['user_id'],)
    )
    
    progress_list = cur.fetchall()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'progress': [dict(p) for p in progress_list]}, default=str)
    }


def handle_get_stats(user_data: Dict[str, Any]) -> Dict[str, Any]:
    if user_data['role'] not in ['admin', 'editor']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Insufficient permissions'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT COUNT(*) as total_articles FROM articles")
    articles_count = cur.fetchone()['total_articles']
    
    cur.execute("SELECT COUNT(*) as total_users FROM users")
    users_count = cur.fetchone()['total_users']
    
    cur.execute("SELECT COUNT(*) as subscribers FROM users WHERE subscription_date IS NOT NULL")
    subscribers_count = cur.fetchone()['subscribers']
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'stats': {
                'total_articles': articles_count,
                'total_users': users_count,
                'subscribers': subscribers_count
            }
        })
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    user_data = None
    if auth_token:
        user_data = verify_token(auth_token)
    
    if method == 'GET':
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action')
        
        if action == 'stats':
            if not user_data:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'})
                }
            return handle_get_stats(user_data)
        
        if action == 'progress':
            if not user_data:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'})
                }
            return handle_get_user_progress(user_data)
        
        article_id = query_params.get('id')
        if article_id:
            return handle_get_article(int(article_id))
        
        return handle_get_articles(query_params)
    
    if method == 'POST':
        if not user_data:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'create':
            return handle_create_article(body_data, user_data)
        elif action == 'update_progress':
            return handle_update_progress(body_data, user_data)
    
    if method == 'PUT':
        if not user_data:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        article_id = body_data.get('id')
        
        if not article_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Article ID required'})
            }
        
        return handle_update_article(article_id, body_data, user_data)
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
