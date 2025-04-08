#!/bin/bash

# ANSI color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TasksList Application Setup ===${NC}"
echo -e "${YELLOW}This script will install all requirements for both backend and frontend.${NC}"
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

echo -e "${BLUE}Setting up backend...${NC}"

# Create and activate virtual environment
echo -e "${YELLOW}Creating Python virtual environment...${NC}"
cd backend || { echo -e "${RED}Backend directory not found${NC}"; exit 1; }

python3 -m venv venv
if [ ! -d "venv" ]; then
    echo -e "${RED}Failed to create virtual environment. Please check your Python installation.${NC}"
    exit 1
fi

# Activate the virtual environment
if [ -f "./venv/bin/activate" ]; then
    echo -e "${YELLOW}Activating virtual environment...${NC}"
    source ./venv/bin/activate
else
    echo -e "${RED}Virtual environment activation script not found.${NC}"
    exit 1
fi

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Set up database if needed (currently commented out)
# echo -e "${YELLOW}Setting up database...${NC}"
# python create_tables.py

# Deactivate virtual environment
deactivate

# Return to the root directory
cd ..

# Install frontend dependencies
echo -e "${BLUE}Setting up frontend...${NC}"
cd frontend || { echo -e "${RED}Frontend directory not found${NC}"; exit 1; }
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

# Return to the root directory
cd ..

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo -e "${YELLOW}Here's how to start the application:${NC}"
echo ""
echo -e "${BLUE}Start the backend:${NC}"
echo -e "cd backend"
echo -e "source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo -e "python -m uvicorn main:app --reload"
echo ""
echo -e "${BLUE}Start the frontend (in a new terminal window):${NC}"
echo -e "cd frontend"
echo -e "npm start"
echo ""
echo -e "${GREEN}Enjoy using TasksList!${NC}" 