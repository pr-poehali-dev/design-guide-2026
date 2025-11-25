'''
Business: Handle user authentication (register, login, Google OAuth, password reset)
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name, function_version
Returns: HTTP response dict with user data and JWT token
'''

import json
import os
import re
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
import jwt
from pydantic import BaseModel, EmailStr, Field, ValidationError


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    google_id: str
    email: EmailStr
    name: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr


class UpdatePasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)


def generate_jwt(user_id: int, email: str, role: str) -> str:
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, jwt_secret, algorithm='HS256')


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def handle_register(body_data: Dict[str, Any]) -> Dict[str, Any]:
    req = RegisterRequest(**body_data)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT id FROM users WHERE email = %s", (req.email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email already registered'})
        }
    
    password_hash = hash_password(req.password)
    
    cur.execute(
        """
        INSERT INTO users (email, name, password_hash, role, created_at)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, email, name, role, created_at
        """,
        (req.email, req.name, password_hash, 'user', datetime.utcnow())
    )
    
    user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    token = generate_jwt(user['id'], user['email'], user['role'])
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role']
            },
            'token': token
        }, default=str)
    }


def handle_login(body_data: Dict[str, Any]) -> Dict[str, Any]:
    req = LoginRequest(**body_data)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "SELECT id, email, name, password_hash, role, subscription_date FROM users WHERE email = %s",
        (req.email,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user or not user['password_hash']:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid credentials'})
        }
    
    if not verify_password(req.password, user['password_hash']):
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid credentials'})
        }
    
    token = generate_jwt(user['id'], user['email'], user['role'])
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role'],
                'subscription_date': user['subscription_date']
            },
            'token': token
        }, default=str)
    }


def handle_google_auth(body_data: Dict[str, Any]) -> Dict[str, Any]:
    req = GoogleAuthRequest(**body_data)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT id, email, name, role, subscription_date FROM users WHERE google_id = %s", (req.google_id,))
    user = cur.fetchone()
    
    if user:
        cur.close()
        conn.close()
        token = generate_jwt(user['id'], user['email'], user['role'])
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role'],
                    'subscription_date': user['subscription_date']
                },
                'token': token
            }, default=str)
        }
    
    cur.execute(
        """
        INSERT INTO users (email, name, google_id, role, created_at)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, email, name, role
        """,
        (req.email, req.name, req.google_id, 'user', datetime.utcnow())
    )
    
    new_user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    token = generate_jwt(new_user['id'], new_user['email'], new_user['role'])
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'user': {
                'id': new_user['id'],
                'email': new_user['email'],
                'name': new_user['name'],
                'role': new_user['role']
            },
            'token': token
        }, default=str)
    }


def handle_verify_token(token: str) -> Dict[str, Any]:
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    
    decoded = jwt.decode(token, jwt_secret, algorithms=['HS256'])
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        "SELECT id, email, name, role, subscription_date FROM users WHERE id = %s",
        (decoded['user_id'],)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User not found'})
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role'],
                'subscription_date': user['subscription_date']
            }
        }, default=str)
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'register':
            return handle_register(body_data)
        elif action == 'login':
            return handle_login(body_data)
        elif action == 'google_auth':
            return handle_google_auth(body_data)
        elif action == 'verify_token':
            token = body_data.get('token', '')
            return handle_verify_token(token)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unknown action'})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
