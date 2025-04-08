import os
import uuid
import secrets
import hashlib
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from db_config import execute_query

# Load environment variables
load_dotenv('.env')

# JWT Configuration - Use the same SECRET_KEY as in routes/auth.py
JWT_SECRET = os.getenv('SECRET_KEY', 'your-secret-key')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXPIRES_MINUTES = int(os.getenv('JWT_EXPIRES_MINUTES', '60'))

def hash_password(password):
    """Hash a password for storing."""
    # Use passlib's CryptContext for proper password hashing
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)

def register_user(email, password, username=None, first_name=None, last_name=None):
    """Register a new user"""
    try:
        # Hash the password
        hashed_password = hash_password(password)
        
        # Generate a random username if not provided
        if not username:
            # Generate user_[randomchars]
            random_id = str(uuid.uuid4())[:8]
            username = f"user_{random_id}"
        
        # Generate a UUID for the user
        user_id = str(uuid.uuid4())
        
        # Insert into users and profiles tables directly
        user_query = """
        INSERT INTO users (id, email, password, username, raw_user_meta_data)
        VALUES (%s, %s, %s, %s, %s)
        """
        
        user_metadata = {
            "username": username,
            "firstName": first_name,
            "lastName": last_name
        }
        
        # Convert dict to JSON string for MySQL
        import json
        user_metadata_json = json.dumps(user_metadata)
        
        execute_query(user_query, (
            user_id, 
            email, 
            hashed_password, 
            username, 
            user_metadata_json
        ), fetch=False)
        
        profile_query = """
        INSERT INTO profiles (id, email, username, first_name, last_name, is_verified)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        execute_query(profile_query, (
            user_id,
            email,
            username,
            first_name,
            last_name,
            False
        ), fetch=False)
        
        return {
            'user': {
                'id': user_id,
                'email': email,
                'username': username,
                'user_metadata': {
                    'username': username,
                    'firstName': first_name,
                    'lastName': last_name
                }
            }
        }
    except Exception as e:
        print(f"Error registering user: {e}")
        return None

def login_user(email, password):
    """Authenticate a user and generate JWT token"""
    try:
        # Get user from database
        user = get_user_by_email(email)
        if not user:
            return None
        
        # Verify password
        if not verify_password(password, user['password']):
            return None
        
        # Check if user is verified
        if not user.get('is_verified', False):
            return None
        
        # Get user's name
        user_name = user.get('name', '')
        
        # Get user's profile icon
        profile_icon = user.get('profile_icon', '')
        
        # Generate JWT token
        payload = {
            'sub': user['id'],
            'email': user['email'],
            'name': user_name,
            'exp': datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MINUTES)
        }
        
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return {
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user_name,
                'profile_icon': profile_icon
            },
            'session': {
                'access_token': token
            }
        }
    except Exception as e:
        print(f"Error during login: {e}")
        return None

def verify_token(token):
    """Verify a JWT token and return the user information"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Get user profile
        query = """
        SELECT p.id, p.email, p.username, p.first_name, p.last_name, p.is_verified
        FROM profiles p
        WHERE p.id = %s
        """
        result = execute_query(query, (payload['sub'],))
        
        if not result or len(result) == 0:
            return None
        
        # Get ASCII-safe versions of the names
        first_name = str(result[0]['first_name'] or '').encode('ascii', 'ignore').decode('ascii')
        last_name = str(result[0]['last_name'] or '').encode('ascii', 'ignore').decode('ascii')
        username = str(result[0]['username'] or '').encode('ascii', 'ignore').decode('ascii')
            
        return {
            'user': {
                'id': payload['sub'],
                'email': payload['email'],
                'username': username,
                'is_verified': result[0]['is_verified'],
                'first_name': first_name,
                'last_name': last_name
            }
        }
    except jwt.ExpiredSignatureError:
        return {'error': 'Token expired'}
    except jwt.InvalidTokenError:
        return {'error': 'Invalid token'}
    except Exception as e:
        print(f"Error verifying token: {e}")
        return {'error': str(e)}

def generate_verification_code(email):
    """Generate a 6-digit verification code and store it"""
    try:
        # Generate a 6-digit code
        code = ''.join(secrets.choice('0123456789') for _ in range(6))
        
        # Set expiration time (30 minutes from now to ensure enough time)
        expires_at = datetime.now() + timedelta(minutes=30)  # Use local time instead of UTC
        
        # Store the code in the database
        query = """
        INSERT INTO verification_codes (email, code, expires_at)
        VALUES (%s, %s, %s)
        """
        execute_query(query, (email, code, expires_at), fetch=False)
        
        return code
    except Exception as e:
        print(f"Error generating verification code: {e}")
        return None

def verify_code(email, code):
    """Verify a verification code"""
    try:
        print(f"Verifying code {code} for email {email}")
        
        # Get the most recent code for this email
        query = """
        SELECT * FROM verification_codes 
        WHERE email = %s AND code = %s
        ORDER BY created_at DESC
        LIMIT 1
        """
        result = execute_query(query, (email, code))
        
        if not result or len(result) == 0:
            print(f"No matching code found for {email}")
            return False
        
        # Check if the code is still valid (not expired)
        now = datetime.now()
        expires_at = result[0]['expires_at']
        
        if expires_at < now:
            print(f"Code expired at {expires_at}, current time is {now}")
            return False
            
        # Update user to verified status in profiles table
        update_query = """
        UPDATE profiles
        SET is_verified = true
        WHERE email = %s
        """
        execute_query(update_query, (email,), fetch=False)
        
        # Delete the used code
        delete_query = """
        DELETE FROM verification_codes
        WHERE id = %s
        """
        execute_query(delete_query, (result[0]['id'],), fetch=False)
        
        print(f"Successfully verified code for {email}")
        return True
    except Exception as e:
        print(f"Error verifying code: {e}")
        return False

def get_user(user_id):
    """Get user details by ID"""
    try:
        query = """
        SELECT p.*, u.raw_user_meta_data 
        FROM profiles p
        JOIN users u ON p.id = u.id
        WHERE p.id = %s
        """
        result = execute_query(query, (user_id,))
        
        if not result or len(result) == 0:
            return None
        
        # Parse JSON if needed
        import json
        if isinstance(result[0]['raw_user_meta_data'], str):
            user_metadata = json.loads(result[0]['raw_user_meta_data'])
        else:
            user_metadata = result[0]['raw_user_meta_data']
            
        user_data = result[0]
        user_data['user_metadata'] = user_metadata
        
        return user_data
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

def verify_password(plain_password, hashed_password):
    """Verify password against hash, supporting both old SHA-256 and new bcrypt hashes"""
    # First try bcrypt verification
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        if pwd_context.verify(plain_password, hashed_password):
            return True
    except Exception as e:
        print(f"Bcrypt verification failed: {e}")
    
    # If that fails, try legacy SHA-256 verification
    try:
        old_hash = hashlib.sha256(plain_password.encode()).hexdigest()
        if old_hash == hashed_password:
            print("Verified with legacy SHA-256 hash")
            return True
    except Exception as e:
        print(f"SHA-256 verification failed: {e}")
    
    # All verification methods failed
    return False

def get_user_by_email(email):
    """Get user by email"""
    try:
        query = """
        SELECT u.id, u.email, u.username, u.raw_user_meta_data, u.password, u.profile_icon, p.is_verified
        FROM users u
        JOIN profiles p ON u.id = p.id
        WHERE u.email = %s
        """
        result = execute_query(query, (email,))
        
        if not result or len(result) == 0:
            return None
            
        return result[0]
    except Exception as e:
        print(f"Error getting user by email: {e}")
        return None 