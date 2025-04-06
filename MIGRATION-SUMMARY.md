# Migration from Supabase to Local MySQL Database

## Overview
This document summarizes the changes made to migrate the TasksLists application from Supabase to a local MySQL database.

## Backend Changes

1. **Database Connection**
   - Removed Supabase client
   - Added MySQL connector configuration
   - Set up environment variables for database connection in `.env` file

2. **Authentication System**
   - Implemented JWT-based authentication
   - Created email verification system with verification codes
   - Added password hashing and security

3. **API Routes**
   - Updated `/api/v1/auth/*` routes to use local database
   - Created task list and task management endpoints
   - Implemented proper error handling

## Frontend Changes

1. **API Service**
   - Removed Supabase client
   - Created dedicated API service with axios
   - Implemented proper token management for authentication

2. **Components**
   - Updated `TaskList` component to use new API service
   - Updated `TaskListDetail` component to use new API service
   - Fixed API method calls to match updated interfaces

3. **Authentication**
   - Maintained existing login and registration flow
   - Updated to use JWT-based authentication
   - Retained email verification process

## Database Schema

The database now includes these tables:
- users
- profiles
- tasks
- task_lists
- verification_codes

## Running the Application

### Backend
```
cd backend
# Make sure the virtual environment is activated
# On Windows: .\venv\Scripts\activate
# On Unix: source venv/bin/activate
python main.py
```

### Frontend
```
cd frontend
npm start
```

## API Endpoints

- Authentication:
  - POST `/api/v1/auth/register`
  - POST `/api/v1/auth/login`
  - POST `/api/v1/auth/verify`
  - GET `/api/v1/auth/me`

- Task Lists:
  - GET `/api/v1/task-lists`
  - GET `/api/v1/task-lists/{id}`
  - POST `/api/v1/task-lists`
  - PUT `/api/v1/task-lists/{id}`
  - DELETE `/api/v1/task-lists/{id}`
  - GET `/api/v1/task-lists/{id}/tasks` 

- Tasks:
  - POST `/api/v1/task-lists/{id}/tasks`
  - PUT `/api/v1/tasks/{id}`
  - DELETE `/api/v1/tasks/{id}` 