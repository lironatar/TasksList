import os
import psycopg2
from dotenv import load_dotenv
import sys
from pathlib import Path

# Load environment variables
load_dotenv()

# Database connection parameters
db_url = os.getenv('DATABASE_URL')

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from db_config import execute_query

def execute_sql_file(file_path, connection):
    """Execute SQL commands from a file"""
    try:
        with open(file_path, 'r') as file:
            sql_commands = file.read()
            cursor = connection.cursor()
            cursor.execute(sql_commands)
            connection.commit()
            print(f"Successfully executed SQL from {file_path}")
    except Exception as e:
        connection.rollback()
        print(f"Error executing SQL from {file_path}: {e}")

def main():
    """Apply database migrations"""
    try:
        # Connect to the database
        print("Connecting to the database...")
        connection = psycopg2.connect(db_url)
        
        # First run the schema if it hasn't been applied yet
        schema_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'schema.sql')
        execute_sql_file(schema_path, connection)
        
        # Then apply migrations
        migrations_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'migrations.sql')
        execute_sql_file(migrations_path, connection)
        
        # Create the users table if it doesn't exist
        execute_query("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reset_token VARCHAR(255),
            reset_token_expires TIMESTAMP,
            verification_code VARCHAR(10),
            verification_code_expires TIMESTAMP,
            profile_icon VARCHAR(255) DEFAULT '/profile-icons/avatar1.png'
        )
        """, fetch=False)
        
        print("✓ Users table checked/created")
        
        # Check if profile_icon column exists in users table
        column_exists = execute_query("""
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='profile_icon'
        );
        """, fetch=True)
        
        if not column_exists[0][0]:
            # Add profile_icon column if it doesn't exist
            execute_query("""
            ALTER TABLE users 
            ADD COLUMN profile_icon VARCHAR(255) DEFAULT '/profile-icons/avatar1.png'
            """, fetch=False)
            print("✓ Added profile_icon column to users table")
        else:
            print("✓ profile_icon column already exists")
        
        # Close the connection
        connection.close()
        print("Database migrations completed successfully")
    except Exception as e:
        print(f"Error applying migrations: {e}")

if __name__ == "__main__":
    main() 