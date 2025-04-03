#!/bin/bash

echo "TaskList Initialization Script"
echo "=========================="
echo

echo "Creating Git repository..."
git init

echo
echo "Setting up frontend..."
cd frontend
npm install
cd ..

echo
echo "Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo
echo "Creating .env files (you'll need to fill these with your credentials)..."
echo "REACT_APP_SUPABASE_URL=your_supabase_url" > frontend/.env
echo "REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key" >> frontend/.env

echo "DATABASE_URL=your_database_connection_string" > backend/.env
echo "SECRET_KEY=your_secret_key" >> backend/.env

echo
echo "Initial commit..."
git add .
git commit -m "Initial commit"

echo
echo "================================================="
echo "Setup complete! Please update the .env files with"
echo "your actual credentials before starting the app."
echo "================================================="
echo
echo "To start the application, run:"
echo "cd frontend"
echo "npm run dev"
echo 