# TasksList Application

A full-stack web application for managing tasks and task lists. Built with FastAPI (Python) for the backend and React (TypeScript) for the frontend.

## Features

- User registration and authentication with email verification
- Create, read, update, and delete task lists
- Add, update, and delete tasks within task lists
- Task priority and status management
- Dashboard for viewing all task lists and task counts

## Technology Stack

### Backend
- FastAPI framework
- PostgreSQL database
- JWT authentication
- Password hashing with bcrypt (via passlib)
- Email verification

### Frontend
- React with TypeScript
- React Router for navigation
- Bootstrap for styling
- Axios for API communication

## Project Structure

```
TasksList/
├── backend/               # FastAPI backend
│   ├── routes/            # API endpoints
│   ├── main.py            # Application entry point
│   ├── auth_service.py    # Authentication service
│   ├── email_service.py   # Email service
│   └── db_config.py       # Database configuration
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   └── src/               # Source code
│       ├── components/    # React components
│       ├── pages/         # Page components
│       └── utils/         # Utility functions
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on `.env.template`
4. Run the application:
   ```
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm start
   ```

## API Documentation

Once the backend server is running, you can access the Swagger documentation at `/docs` endpoint.

## License

[MIT](LICENSE) 