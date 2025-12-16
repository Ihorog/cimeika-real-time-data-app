import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.routers import calendar, ci, gallery, kazkar, malya, mood, podia


def configure_logging() -> None:
    """Configure application logging once at startup."""
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )


configure_logging()

app = FastAPI(
    title=settings.api_title,
    version="0.1.0",
    description="Ci orchestration layer",
)

# CORS configuration keeps existing routes functional while constraining origins.
# Origins can be overridden via the ALLOWED_ORIGINS env variable.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=settings.allowed_methods,
    allow_headers=settings.allowed_headers,
)

app.include_router(ci.router, prefix="/ci", tags=["ci"])
app.include_router(podia.router, prefix="/podia", tags=["podia"])
app.include_router(mood.router, tags=["mood"])
app.include_router(malya.router, tags=["malya"])
app.include_router(kazkar.router, prefix="/kazkar", tags=["kazkar"])
app.include_router(calendar.router, tags=["calendar"])
app.include_router(gallery.router, tags=["gallery"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "cimeika-api", "base_url": settings.api_base_url}
