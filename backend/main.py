from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import dashboard, water_usage, leaderboard, analytics, alerts, reports, meta

app = FastAPI(title="AquaSave Campus Water Intelligence API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "AquaSave Backend is running"}

app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(water_usage.router, prefix="/api", tags=["Water Usage"])
app.include_router(leaderboard.router, prefix="/api", tags=["Leaderboard"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(alerts.router, prefix="/api", tags=["Alerts"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(meta.router, prefix="/api", tags=["Meta"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
