"""
Authentication System Tests
Tests for user registration, login, and JWT token management
"""
import pytest
import json
from datetime import datetime, timedelta
from apps.api.src.main import app
from apps.api.src.models.user import db, User
from apps.api.src.models.auth import auth_manager

@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

@pytest.fixture
def test_user_data():
    """Test user data"""
    return {
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'TestPassword123!'
    }

class TestUserRegistration:
    """Test user registration functionality"""
    
    def test_successful_registration(self, client, test_user_data):
        """Test successful user registration"""
        response = client.post('/api/auth/register', 
                             data=json.dumps(test_user_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'token' in data
        assert data['user']['email'] == test_user_data['email']
        assert data['user']['name'] == test_user_data['name']
    
    def test_duplicate_email_registration(self, client, test_user_data):
        """Test registration with duplicate email"""
        # Register first user
        client.post('/api/auth/register', 
                   data=json.dumps(test_user_data),
                   content_type='application/json')
        
        # Try to register again with same email
        response = client.post('/api/auth/register', 
                             data=json.dumps(test_user_data),
                             content_type='application/json')
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already exists' in data['error'].lower()
    
    def test_weak_password_registration(self, client, test_user_data):
        """Test registration with weak password"""
        test_user_data['password'] = '123'  # Too short
        
        response = client.post('/api/auth/register', 
                             data=json.dumps(test_user_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'password' in data['error'].lower()
    
    def test_missing_fields_registration(self, client):
        """Test registration with missing fields"""
        incomplete_data = {'email': 'test@example.com'}
        
        response = client.post('/api/auth/register', 
                             data=json.dumps(incomplete_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

class TestUserLogin:
    """Test user login functionality"""
    
    def test_successful_login(self, client, test_user_data):
        """Test successful user login"""
        # Register user first
        client.post('/api/auth/register', 
                   data=json.dumps(test_user_data),
                   content_type='application/json')
        
        # Login
        login_data = {
            'email': test_user_data['email'],
            'password': test_user_data['password']
        }
        
        response = client.post('/api/auth/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'token' in data
        assert data['user']['email'] == test_user_data['email']
    
    def test_invalid_credentials_login(self, client, test_user_data):
        """Test login with invalid credentials"""
        # Register user first
        client.post('/api/auth/register', 
                   data=json.dumps(test_user_data),
                   content_type='application/json')
        
        # Try login with wrong password
        login_data = {
            'email': test_user_data['email'],
            'password': 'WrongPassword123!'
        }
        
        response = client.post('/api/auth/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'credentials' in data['error'].lower()
    
    def test_nonexistent_user_login(self, client):
        """Test login with non-existent user"""
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'SomePassword123!'
        }
        
        response = client.post('/api/auth/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data

class TestTokenManagement:
    """Test JWT token management"""
    
    def test_token_validation(self, client, test_user_data):
        """Test token validation"""
        # Register and get token
        response = client.post('/api/auth/register', 
                             data=json.dumps(test_user_data),
                             content_type='application/json')
        
        data = json.loads(response.data)
        token = data['token']
        
        # Validate token
        response = client.get('/api/auth/validate',
                            headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['valid'] is True
        assert data['user']['email'] == test_user_data['email']
    
    def test_invalid_token_validation(self, client):
        """Test validation with invalid token"""
        response = client.get('/api/auth/validate',
                            headers={'Authorization': 'Bearer invalid_token'})
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['valid'] is False
    
    def test_token_refresh(self, client, test_user_data):
        """Test token refresh"""
        # Register and get token
        response = client.post('/api/auth/register', 
                             data=json.dumps(test_user_data),
                             content_type='application/json')
        
        data = json.loads(response.data)
        token = data['token']
        
        # Refresh token
        response = client.post('/api/auth/refresh',
                             headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'token' in data
        assert data['token'] != token  # New token should be different

class TestProtectedRoutes:
    """Test protected route access"""
    
    def test_protected_route_without_token(self, client):
        """Test accessing protected route without token"""
        response = client.get('/api/auth/me')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_protected_route_with_valid_token(self, client, test_user_data):
        """Test accessing protected route with valid token"""
        # Register and get token
        response = client.post('/api/auth/register', 
                             data=json.dumps(test_user_data),
                             content_type='application/json')
        
        data = json.loads(response.data)
        token = data['token']
        
        # Access protected route
        response = client.get('/api/auth/me',
                            headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['user']['email'] == test_user_data['email']

class TestPasswordManagement:
    """Test password change functionality"""
    
    def test_password_change(self, client, test_user_data):
        """Test successful password change"""
        # Register and get token
        response = client.post('/api/auth/register', 
                             data=json.dumps(test_user_data),
                             content_type='application/json')
        
        data = json.loads(response.data)
        token = data['token']
        
        # Change password
        password_data = {
            'current_password': test_user_data['password'],
            'new_password': 'NewPassword123!'
        }
        
        response = client.post('/api/auth/change-password',
                             data=json.dumps(password_data),
                             content_type='application/json',
                             headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
    
    def test_password_change_wrong_current(self, client, test_user_data):
        """Test password change with wrong current password"""
        # Register and get token
        response = client.post('/api/auth/register', 
                             data=json.dumps(test_user_data),
                             content_type='application/json')
        
        data = json.loads(response.data)
        token = data['token']
        
        # Try to change password with wrong current password
        password_data = {
            'current_password': 'WrongPassword123!',
            'new_password': 'NewPassword123!'
        }
        
        response = client.post('/api/auth/change-password',
                             data=json.dumps(password_data),
                             content_type='application/json',
                             headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

class TestAuthManager:
    """Test AuthManager class directly"""
    
    def test_password_hashing(self):
        """Test password hashing and verification"""
        password = "TestPassword123!"
        hashed = auth_manager.hash_password(password)
        
        assert hashed != password
        assert auth_manager.verify_password(password, hashed) is True
        assert auth_manager.verify_password("WrongPassword", hashed) is False
    
    def test_token_generation_and_verification(self):
        """Test JWT token generation and verification"""
        user_id = 1
        email = "test@example.com"
        
        token = auth_manager.generate_token(user_id, email)
        assert token is not None
        
        payload = auth_manager.verify_token(token)
        assert payload['user_id'] == user_id
        assert payload['email'] == email
    
    def test_expired_token(self):
        """Test expired token handling"""
        # Create a token that expires immediately
        auth_manager.token_expiry_hours = -1  # Negative to make it expired
        
        user_id = 1
        email = "test@example.com"
        token = auth_manager.generate_token(user_id, email)
        
        # Reset expiry
        auth_manager.token_expiry_hours = 24
        
        with pytest.raises(ValueError, match="Token has expired"):
            auth_manager.verify_token(token)

if __name__ == '__main__':
    pytest.main([__file__])

