# TaskList - משימות

A task management application with RTL support, designed for Hebrew speakers.

## Features

- Multiple task lists management
- Task priority and status tracking
- Progress visualization
- User authentication
- Email verification
- Responsive RTL design
- Real-time task updates
- Confetti animation for completed tasks

## Setup

### Prerequisites

- Node.js (v14 or later)
- Python (v3.8 or later)
- npm or yarn
- PostgreSQL database (or Supabase account)

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   
   # On Windows
   .\venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with your database credentials:
   ```
   DATABASE_URL=your_database_connection_string
   SECRET_KEY=your_secret_key
   ```

5. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

### Running Full Application

For convenience, you can run both frontend and backend using the dev script:

```
cd frontend
npm run dev
```

## Frontend Dependencies

- React
- React Router
- Supabase Client
- Framer Motion (animations)
- React Confetti
- Tailwind CSS

## Backend Dependencies

- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- Python-jose (JWT)
- Passlib
- Email-validator

## Deployment

Instructions for deploying to production will be added soon.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 