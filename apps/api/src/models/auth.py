"""
Authentication and User Management
JWT-based authentication with user registration and login
"""
import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from src.models.user import User, db
import logging

logger = logging.getLogger(__name__)

class AuthManager:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET', 'asdf#FGSgvasgf$5$WGT')
        self.algorithm = 'HS256'
        self.token_expiry_hours = 24
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def generate_token(self, user_id: int, email: str) -> str:
        """Generate a JWT token for a user"""
        payload = {
            'user_id': user_id,
            'email': email,
            'exp': datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
            'iat': datetime.utcnow()
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
                created_at=datetime.utcnow()
            )
            
            db.session.add(user)
            db.session.commit()
            
            # Generate token
            token = self.generate_token(user.id, user.email)
            
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'created_at': user.created_at.isoformat()
                },
                'token': token
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
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Generate token
            token = self.generate_token(user.id, user.email)
            
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'last_login': user.last_login.isoformat()
                },
                'token': token
            }
            
        except Exception as e:
            logger.error(f"Error logging in user: {str(e)}")
            return {'error': 'Login failed', 'code': 'LOGIN_ERROR'}
    
    def get_user_from_token(self, token: str) -> User:
        """Get user object from JWT token"""
        try:
            payload = self.verify_token(token)
            user = User.query.get(payload['user_id'])
            
            if not user or not user.is_active:
                return None
                
            return user
            
        except Exception as e:
            logger.error(f"Error getting user from token: {str(e)}")
            return None
    
    def refresh_token(self, token: str) -> dict:
        """Refresh an existing token"""
        try:
            payload = self.verify_token(token)
            user = User.query.get(payload['user_id'])
            
            if not user or not user.is_active:
                return {'error': 'Invalid user', 'code': 'INVALID_USER'}
            
            # Generate new token
            new_token = self.generate_token(user.id, user.email)
            
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

# Global auth manager instance
auth_manager = AuthManager()

def require_auth(f):
    """Decorator to require authentication for API endpoints"""
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
            # Verify token and get user
            user = auth_manager.get_user_from_token(token)
            if not user:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            # Add user to request context
            request.current_user = user
            
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return jsonify({'error': 'Authentication failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def optional_auth(f):
    """Decorator for optional authentication (user context if token provided)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
                user = auth_manager.get_user_from_token(token)
                request.current_user = user
            except Exception:
                request.current_user = None
        else:
            request.current_user = None
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """Get the current authenticated user from request context"""
    return getattr(request, 'current_user', None)

