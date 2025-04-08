#!/bin/bash

# ANSI color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting TasksList Application ===${NC}"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3 and try again.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Check if the virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo -e "${RED}Virtual environment not found. Please run setup.sh first.${NC}"
    exit 1
fi

# Function to cleanup background processes when script is terminated
cleanup() {
    echo -e "\n${YELLOW}Stopping all servers...${NC}"
    if [ ! -z "$backend_pid" ]; then
        kill $backend_pid 2>/dev/null
    fi
    if [ ! -z "$frontend_pid" ]; then
        kill $frontend_pid 2>/dev/null
    fi
    exit 0
}

# Set up trap for cleanup when script receives termination signal
trap cleanup SIGINT SIGTERM

# Start the backend
echo -e "${YELLOW}Starting backend server...${NC}"
(cd backend && source venv/bin/activate && python -m uvicorn main:app --reload) &
backend_pid=$!

# Wait a moment for the backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 5

# Start the frontend
echo -e "${YELLOW}Starting frontend server...${NC}"
(cd frontend && npm start) &
frontend_pid=$!

echo -e "\n${GREEN}Both servers are now running!${NC}"
echo -e "${BLUE}Backend API:${NC} http://localhost:8000"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "\n${YELLOW}Press Ctrl+C to stop both servers.${NC}"

# Wait for both processes
wait 