from db_config import execute_query

def create_tables():
    """Create all necessary tables if they don't exist"""
    
    # Create users table
    users_query = """
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        raw_user_meta_data TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    execute_query(users_query, fetch=False)
    print("Users table created or already exists")
    
    # Create verification_codes table
    codes_query = """
    CREATE TABLE IF NOT EXISTS verification_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36),
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """
    execute_query(codes_query, fetch=False)
    print("Verification codes table created or already exists")
    
    # Create profiles table
    profiles_query = """
    CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    )
    """
    execute_query(profiles_query, fetch=False)
    print("Profiles table created or already exists")
    
    # Create task_lists table
    task_lists_query = """
    CREATE TABLE IF NOT EXISTS task_lists (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """
    execute_query(task_lists_query, fetch=False)
    print("Task lists table created or already exists")
    
    # Create tasks table
    tasks_query = """
    CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'medium',
        due_date TIMESTAMP NULL,
        list_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES task_lists(id) ON DELETE CASCADE
    )
    """
    execute_query(tasks_query, fetch=False)
    print("Tasks table created or already exists")
    
    # Create profile_icons table
    profile_icons_query = """
    CREATE TABLE IF NOT EXISTS profile_icons (
        id VARCHAR(36) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        path VARCHAR(255) NOT NULL, 
        label VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    execute_query(profile_icons_query, fetch=False)
    print("Profile icons table created or already exists")

if __name__ == "__main__":
    print("Creating database tables...")
    create_tables()
    print("Database setup complete!") 