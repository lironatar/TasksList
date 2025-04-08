import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from routes import verification
import importlib.util
import subprocess

# Load routes
from routes.auth import router as auth_router
from routes.task_lists import router as task_lists_router
from routes.users import router as users_router
from routes.admin import router as admin_router
# Import other routes...

# Load environment variables
load_dotenv('backend/.env')

# Create FastAPI app
app = FastAPI(title="TasksLists API", version="1.0.0")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(task_lists_router)
app.include_router(users_router)
app.include_router(admin_router)
# Include other routers...

# Mount static files
# Ensure directories exist
os.makedirs("public/profile-icons", exist_ok=True)
os.makedirs("public/profile-images", exist_ok=True)

# Mount static directories with correct paths
app.mount("/api/v1/profile-icons", StaticFiles(directory="public/profile-icons"), name="profile-icons")
app.mount("/api/v1/profile-images", StaticFiles(directory="public/profile-images"), name="profile-images")

# Include verification routes
app.include_router(verification.router, prefix="/api/v1/verification", tags=["verification"])

# Run database migrations
def run_migrations():
    try:
        # Run our table creation script
        print("Running database migrations...")
        from create_tables import create_tables
        create_tables()
    except Exception as e:
        print(f"Error running migrations: {e}")

# Run migrations when the app starts
@app.on_event("startup")
async def startup_event():
    run_migrations()

# Error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to TasksLists API", "status": "online"}

# Health check endpoint
@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable or use default
    port = int(os.getenv("PORT", "8000"))
    
    # Start the server
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=port, 
        reload=True
    ) 