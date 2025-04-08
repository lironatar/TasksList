# TasksList Application Setup Guide

This guide will help you set up and run the TasksList application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 14+ and npm**: [Download Node.js](https://nodejs.org/en/download/)
- **Git**: [Download Git](https://git-scm.com/downloads)

## Automatic Setup

We provide setup scripts to automate the installation process for both Windows and Unix-based systems (Linux/macOS).

### Windows Setup

1. After downloading or cloning the repository, navigate to the project root directory.
2. Double-click on `setup.bat` or run it from Command Prompt:
   ```
   setup.bat
   ```
3. The script will:
   - Check that you have the required prerequisites installed
   - Set up a Python virtual environment for the backend
   - Install all backend dependencies
   - Install all frontend dependencies
   - Provide instructions for starting the application

### Linux/macOS Setup

1. After downloading or cloning the repository, navigate to the project root directory.
2. Make the setup script executable:
   ```bash
   chmod +x setup.sh
   ```
3. Run the setup script:
   ```bash
   ./setup.sh
   ```
4. The script will:
   - Check that you have the required prerequisites installed
   - Set up a Python virtual environment for the backend
   - Install all backend dependencies
   - Install all frontend dependencies
   - Provide instructions for starting the application

## Manual Setup

If you prefer to set up the application manually, follow these steps:

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   
   # macOS/Linux
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Using the Start Script (Recommended)

We provide convenient start scripts that will launch both the backend and frontend servers simultaneously.

#### Windows

1. After completing the setup, simply run:
   ```
   start_app.bat
   ```
   
2. This will open two separate command windows - one for the backend and one for the frontend.
   
3. The frontend should automatically open in your default browser. If not, visit http://localhost:3000.

#### Linux/macOS

1. After completing the setup, make the start script executable:
   ```bash
   chmod +x start_app.sh
   ```
   
2. Run the start script:
   ```bash
   ./start_app.sh
   ```
   
3. This will start both the backend and frontend servers in the background.
   
4. Press Ctrl+C when you want to stop both servers.

### Manual Startup

If you prefer to start the servers manually, follow these steps:

### Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment (if not already activated):
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. Start the backend server:
   ```bash
   python -m uvicorn main:app --reload
   ```
   
   The backend will be available at http://localhost:8000

### Start the Frontend

1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the frontend development server:
   ```bash
   npm start
   ```
   
   The application will be available at http://localhost:3000

## Troubleshooting

If you encounter any issues during setup:

1. **Python or Node.js not found**: Ensure they are properly installed and added to your system PATH.

2. **Permission issues on Linux/macOS**: You might need to use `sudo` for some commands.

3. **Virtual environment issues**: Try removing the `venv` directory and creating it again.

4. **Database issues**: Ensure your database settings in `.env` are correct.

For additional help, please open an issue on the GitHub repository. 