from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.seed import seed_database
from backend.app.services.websocket_manager import ws_manager
from backend.app.routers import (
    auth_router,
    ingestion_router,
    measurements_router,
    surveys_router,
    devices_router,
    heatmap_router,
    analytics_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed Data on Startup
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Portable RF Environment Mapping and Activity Analysis System Backend",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST Routers under /api
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(ingestion_router, prefix=settings.API_PREFIX)
app.include_router(measurements_router, prefix=settings.API_PREFIX)
app.include_router(surveys_router, prefix=settings.API_PREFIX)
app.include_router(devices_router, prefix=settings.API_PREFIX)
app.include_router(heatmap_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "RF-Sense Tactical Backend",
        "version": settings.VERSION,
        "docs": "/docs",
        "band": "2.4 GHz ISM (2400-2483.5 MHz)"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "esp32_pipeline": "active",
        "ws_active_clients": len(ws_manager.active_connections)
    }

# Realtime WebSocket stream for Live RF telemetry
@app.websocket("/ws/rf-stream")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep-alive receive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
