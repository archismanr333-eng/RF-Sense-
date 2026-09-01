from backend.app.routers.auth import router as auth_router
from backend.app.routers.ingestion import router as ingestion_router
from backend.app.routers.measurements import router as measurements_router
from backend.app.routers.surveys import router as surveys_router
from backend.app.routers.devices import router as devices_router
from backend.app.routers.heatmap import router as heatmap_router
from backend.app.routers.analytics import router as analytics_router

__all__ = [
    "auth_router",
    "ingestion_router",
    "measurements_router",
    "surveys_router",
    "devices_router",
    "heatmap_router",
    "analytics_router",
]
