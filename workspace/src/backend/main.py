from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import goals, logs, search, scan, analytics, weight, recipes

# Initialize database & migrations
init_db()

app = FastAPI(
    title="AI Calorie Tracker API",
    description="Online Mobile-First Calorie & Macro Tracking Backend with AI Meal Scanning, Weight Tracker, Recipes & Open Food Facts / FatSecret API",
    version="1.2.0"
)

# CORS Middleware setup for mobile/web apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(goals.router)
app.include_router(logs.router)
app.include_router(search.router)
app.include_router(scan.router)
app.include_router(analytics.router)
app.include_router(weight.router)
app.include_router(recipes.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "AI Calorie Tracker API",
        "version": "1.2.0",
        "docs": "/docs"
    }
