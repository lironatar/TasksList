import os
import argparse
from dotenv import load_dotenv
import mysql.connector
from db_config import execute_batch, execute_query, get_connection, DB_CONFIG

# Load environment variables
load_dotenv('.env')

# SQL to create the database schema
CREATE_SCHEMA = """
-- Create users table (replacing auth.users)
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    raw_user_meta_data JSON DEFAULT ('{}'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create task_lists table
CREATE TABLE IF NOT EXISTS task_lists (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id CHAR(36) PRIMARY KEY,
    list_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    due_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES task_lists(id) ON DELETE CASCADE
);
"""

# Create indexes for better performance
CREATE_INDEXES = """
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_task_lists_user_id ON task_lists(user_id);
CREATE INDEX idx_verification_codes_email ON verification_codes(email);
"""

# Create procedures for the database
CREATE_REGISTER_USER = """
CREATE PROCEDURE IF NOT EXISTS register_user(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_username VARCHAR(255),
    IN p_first_name VARCHAR(255),
    IN p_last_name VARCHAR(255),
    OUT p_user_id CHAR(36)
)
BEGIN
    SET p_user_id = UUID();
    
    INSERT INTO users (
        id, 
        email, 
        password, 
        username,
        raw_user_meta_data
    ) VALUES (
        p_user_id,
        p_email,
        p_password,
        COALESCE(p_username, CONCAT('user_', LEFT(p_user_id, 8))),
        JSON_OBJECT(
            'username', COALESCE(p_username, CONCAT('user_', LEFT(p_user_id, 8))),
            'firstName', p_first_name,
            'lastName', p_last_name
        )
    );
    
    INSERT INTO profiles (
        id,
        email,
        username,
        first_name,
        last_name,
        is_verified
    ) VALUES (
        p_user_id,
        p_email,
        COALESCE(p_username, CONCAT('user_', LEFT(p_user_id, 8))),
        p_first_name,
        p_last_name,
        FALSE
    );
END
"""

CREATE_VERIFY_USER = """
CREATE PROCEDURE IF NOT EXISTS verify_user(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255)
)
BEGIN
    SELECT u.id, u.email, u.username, u.raw_user_meta_data
    FROM users u
    WHERE u.email = p_email AND u.password = p_password;
END
"""

CREATE_GET_USER_PROFILE = """
CREATE PROCEDURE IF NOT EXISTS get_user_profile(
    IN p_user_id CHAR(36)
)
BEGIN
    SELECT p.id, p.email, p.username, p.first_name, p.last_name, p.is_verified
    FROM profiles p
    WHERE p.id = p_user_id;
END
"""

def create_database():
    """Create the database if it doesn't exist"""
    # First connect to MySQL server without specifying a database
    db_name = os.getenv('DB_NAME', 'taskslistDB')
    
    # Connect to MySQL server
    conn_params = {
        'host': os.getenv('DB_HOST', '127.0.0.1'),
        'port': int(os.getenv('DB_PORT', '3306')),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', '5327158')
    }
    
    try:
        conn = mysql.connector.connect(**conn_params)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SHOW DATABASES LIKE '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Creating database {db_name}...")
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"Database {db_name} created successfully")
        else:
            print(f"Database {db_name} already exists")
            
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error creating database: {e}")
        return False

def setup_database():
    """Set up the database schema"""
    try:
        print("Creating tables and schema...")
        # Split the schema into individual statements and execute them
        statements = [stmt.strip() for stmt in CREATE_SCHEMA.split(';') if stmt.strip()]
        for stmt in statements:
            try:
                execute_query(stmt, fetch=False)
            except Exception as e:
                print(f"Error executing statement: {e}")
                print(f"Statement: {stmt}")
                raise
        
        print("Creating indexes...")
        # Split the indexes into individual statements and execute them
        index_statements = [stmt.strip() for stmt in CREATE_INDEXES.split(';') if stmt.strip()]
        for stmt in index_statements:
            try:
                execute_query(stmt, fetch=False)
            except Exception as e:
                print(f"Error creating index: {e}")
                print(f"Statement: {stmt}")
                # Continue even if an index fails, it might already exist
        
        print("Creating stored procedures...")
        # Execute each stored procedure separately
        try:
            execute_query(CREATE_REGISTER_USER, fetch=False)
            print("Created register_user procedure")
            
            execute_query(CREATE_VERIFY_USER, fetch=False)
            print("Created verify_user procedure")
            
            execute_query(CREATE_GET_USER_PROFILE, fetch=False)
            print("Created get_user_profile procedure")
        except Exception as e:
            print(f"Error creating stored procedures: {e}")
            raise
        
        print("Database setup completed successfully!")
        return True
    except Exception as e:
        print(f"Error setting up database schema: {e}")
        return False

def check_database():
    """Check if the database is set up correctly"""
    try:
        # Check tables
        table_query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = %s
        """
        tables = execute_query(table_query, (DB_CONFIG['database'],))
        
        print("\nDatabase Tables:")
        for table in tables:
            print(f"  - {table['TABLE_NAME']}")
            
            # Get column info for each table
            column_query = f"""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = %s
            AND table_name = %s
            """
            columns = execute_query(column_query, (DB_CONFIG['database'], table['TABLE_NAME']))
            
            for column in columns:
                print(f"      {column['COLUMN_NAME']}: {column['DATA_TYPE']}")
        
        return True
    except Exception as e:
        print(f"Error checking database: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Set up local MySQL database for TasksLists')
    parser.add_argument('--create', action='store_true', help='Create the database')
    parser.add_argument('--setup', action='store_true', help='Set up the database schema')
    parser.add_argument('--check', action='store_true', help='Check database setup')
    
    args = parser.parse_args()
    
    if not any([args.create, args.setup, args.check]):
        # If no arguments provided, run all steps
        args.create = args.setup = args.check = True
    
    if args.create:
        if not create_database():
            print("Database creation failed, exiting.")
            return
    
    if args.setup:
        if not setup_database():
            print("Database schema setup failed, exiting.")
            return
    
    if args.check:
        check_database()

if __name__ == "__main__":
    main() 