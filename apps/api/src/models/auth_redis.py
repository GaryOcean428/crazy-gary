"""
Redis-Enhanced Authentication and Session Management
JWT-based authentication with Redis session storage
"""
import os
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from src.models.user import User, db
from src.models.redis_client import redis_client
import logging

logger = logging.getLogger(__name__)

class RedisAuthManager:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET', 'asdf#FGSgvasgf$5$WGT')
        self.algorithm = 'HS256'
        self.token_expiry_hours = 24
        self.session_expiry_seconds = 86400  # 24 hours
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def generate_session_id(self) -> str:
        """Generate a unique session ID"""
        return str(uuid.uuid4())
    
    def generate_token(self, user_id: int, email: str, session_id: str) -> str:
        """Generate a JWT token for a user with session ID"""
        payload = {
            'user_id': user_id,
            'email': email,
            'session_id': session_id,
            'exp': datetime.now(timezone.utc) + timedelta(hours=self.token_expiry_hours),
            'iat': datetime.now(timezone.utc)
        }
        
        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        return token
    
    def verify_token(self, token: str) -> dict:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")
    
    def create_session(self, user: User) -> tuple[str, str]:
        """Create a new session for user"""
        session_id = self.generate_session_id()
        
        # Store session data in Redis
        session_data = {
            'user_id': user.id,
            'email': user.email,
            'name': user.name,
            'login_time': datetime.now(timezone.utc).isoformat(),
            'last_activity': datetime.now(timezone.utc).isoformat(),
            'is_active': True
        }
        
        redis_client.set_session(session_id, session_data, self.session_expiry_seconds)
        
        # Generate JWT token with session ID
        token = self.generate_token(user.id, user.email, session_id)
        
        return token, session_id
    
    def get_session(self, session_id: str) -> dict:
        """Get session data from Redis"""
        return redis_client.get_session(session_id)
    
    def update_session_activity(self, session_id: str) -> bool:
        """Update last activity time for session"""
        session_data = self.get_session(session_id)
        if session_data:
            session_data['last_activity'] = datetime.now(timezone.utc).isoformat()
            return redis_client.set_session(session_id, session_data, self.session_expiry_seconds)
        return False
    
    def invalidate_session(self, session_id: str) -> bool:
        """Invalidate a session"""
        return redis_client.delete_session(session_id)
    
    def register_user(self, email: str, password: str, name: str = None) -> dict:
        """Register a new user"""
        try:
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return {'error': 'User already exists', 'code': 'USER_EXISTS'}
            
            # Validate password strength
            if len(password) < 8:
                return {'error': 'Password must be at least 8 characters long', 'code': 'WEAK_PASSWORD'}
            
            # Hash password
            hashed_password = self.hash_password(password)
            
            # Create new user
            user = User(
                email=email,
                password_hash=hashed_password,
                name=name or email.split('@')[0],
                is_active=True,
                created_at=datetime.now(timezone.utc)
            )
            
            db.session.add(user)
            db.session.commit()
            
            # Create session and generate token
            token, session_id = self.create_session(user)
            
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'created_at': user.created_at.isoformat()
                },
                'token': token,
                'session_id': session_id
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error registering user: {str(e)}")
            return {'error': 'Registration failed', 'code': 'REGISTRATION_ERROR'}
    
    def login_user(self, email: str, password: str) -> dict:
        """Authenticate a user and return a token"""
        try:
            # Find user
            user = User.query.filter_by(email=email).first()
            if not user:
                return {'error': 'Invalid credentials', 'code': 'INVALID_CREDENTIALS'}
            
            # Check if user is active
            if not user.is_active:
                return {'error': 'Account is disabled', 'code': 'ACCOUNT_DISABLED'}
            
            # Verify password
            if not self.verify_password(password, user.password_hash):
                return {'error': 'Invalid credentials', 'code': 'INVALID_CREDENTIALS'}
            
            # Update last login
            user.last_login = datetime.now(timezone.utc)
            db.session.commit()
            
            # Create session and generate token
            token, session_id = self.create_session(user)
            
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'last_login': user.last_login.isoformat()
                },
                'token': token,
                'session_id': session_id
            }
            
        except Exception as e:
            logger.error(f"Error logging in user: {str(e)}")
            return {'error': 'Login failed', 'code': 'LOGIN_ERROR'}
    
    def get_user_from_token(self, token: str) -> tuple[User, dict]:
        """Get user object and session data from JWT token"""
        try:
            payload = self.verify_token(token)
            session_id = payload.get('session_id')
            
            if not session_id:
                return None, None
            
            # Get session data from Redis
            session_data = self.get_session(session_id)
            if not session_data or not session_data.get('is_active'):
                return None, None
            
            # Get user from database
            user = User.query.get(payload['user_id'])
            if not user or not user.is_active:
                return None, None
            
            # Update session activity
            self.update_session_activity(session_id)
            
            return user, session_data
            
        except Exception as e:
            logger.error(f"Error getting user from token: {str(e)}")
            return None, None
    
    def logout_user(self, token: str) -> dict:
        """Logout user and invalidate session"""
        try:
            payload = self.verify_token(token)
            session_id = payload.get('session_id')
            
            if session_id:
                self.invalidate_session(session_id)
            
            return {'success': True, 'message': 'Logged out successfully'}
            
        except Exception as e:
            logger.error(f"Error logging out user: {str(e)}")
            return {'error': 'Logout failed', 'code': 'LOGOUT_ERROR'}
    
    def refresh_token(self, token: str) -> dict:
        """Refresh an existing token"""
        try:
            user, session_data = self.get_user_from_token(token)
            
            if not user or not session_data:
                return {'error': 'Invalid session', 'code': 'INVALID_SESSION'}
            
            # Generate new token with same session ID
            session_id = self.verify_token(token)['session_id']
            new_token = self.generate_token(user.id, user.email, session_id)
            
            return {
                'success': True,
                'token': new_token,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name
                }
            }
            
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            return {'error': 'Token refresh failed', 'code': 'REFRESH_ERROR'}
    
    def get_active_sessions(self, user_id: int) -> list:
        """Get all active sessions for a user (requires Redis scan)"""
        # This would require scanning Redis keys, which is expensive
        # For now, return empty list - implement if needed
        return []

# Global Redis auth manager instance
redis_auth_manager = RedisAuthManager()

def require_redis_auth(f):
    """Decorator to require Redis-based authentication for API endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid authorization header format'}), 401
        
        if not token:
            return jsonify({'error': 'Authentication token is required'}), 401
        
        try:
            # Verify token and get user with session
            user, session_data = redis_auth_manager.get_user_from_token(token)
            if not user or not session_data:
                return jsonify({'error': 'Invalid or expired session'}), 401
            
            # Add user and session to request context
            request.current_user = user
            request.current_session = session_data
            
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return jsonify({'error': 'Authentication failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def optional_redis_auth(f):
    """Decorator for optional Redis-based authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
                user, session_data = redis_auth_manager.get_user_from_token(token)
                request.current_user = user
                request.current_session = session_data
            except Exception:
                request.current_user = None
                request.current_session = None
        else:
            request.current_user = None
            request.current_session = None
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """Get the current authenticated user from request context"""
    return getattr(request, 'current_user', None)

def get_current_session():
    """Get the current session data from request context"""
    return getattr(request, 'current_session', None)

