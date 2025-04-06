import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector.cursor import MySQLCursorDict

# Load environment variables
load_dotenv('backend/.env')

# Database connection configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'database': os.getenv('DB_NAME', 'taskslistDB'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '5327158'),
}

def get_connection():
    """Get a connection to the database"""
    try:
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise

def execute_query(query, params=None, fetch=True):
    """Execute a SQL query and return the results"""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or {})
            
        if fetch:
            result = cursor.fetchall()
        else:
            result = None
                
        conn.commit()
        cursor.close()
        return result
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error executing query: {e}")
        raise
    finally:
        if conn:
            conn.close()

def execute_batch(queries):
    """Execute multiple SQL queries in a single transaction"""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        for query in queries:
            if query.strip():  # Skip empty queries
                cursor.execute(query)
        conn.commit()
        cursor.close()
        return True
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error executing batch queries: {e}")
        raise
    finally:
        if conn:
            conn.close() 