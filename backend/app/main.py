
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db.session import engine

# Import API routers
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.organizations import router as organizations_router
from app.api.v1.endpoints.projects import router as projects_router
from app.api.v1.endpoints.tasks import router as tasks_router


# Initialize FastAPI application
app = FastAPI(
    title="WorkSphere API",
    description="WorkSphere project management platform",
    version="1.0.0"
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register authentication routes
app.include_router(
    auth_router,
    prefix="/api/v1"
)

# Register organization routes
app.include_router(
    organizations_router,
    prefix="/api/v1"
)

# Register project routes
app.include_router(
    projects_router,
    prefix="/api/v1"
)

# Register task routes
app.include_router(
    tasks_router,
    prefix="/api/v1"
)


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to WorkSphere API",
        "status": "running"
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# Development-only database connectivity test
@app.get("/db-check")
def check_database():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "status": "connected",
        "database": "MySQL"
    }
