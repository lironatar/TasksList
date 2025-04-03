from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import verification
from config import BACKEND_CORS_ORIGINS

# Import routers
# Temporarily commented out for development
# from app.routers import auth

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# Temporarily commented out for development
# app.include_router(auth.router)

# Include verification routes
app.include_router(verification.router, prefix="/api/v1/verification", tags=["verification"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Task Management API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 