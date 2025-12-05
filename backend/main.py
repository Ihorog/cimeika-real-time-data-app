from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import calendar, ci, gallery, kazkar, malya, mood, podia

app = FastAPI(title="Cimeika API", version="0.1.0", description="Ci orchestration layer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    return {
        "status": "ok",
        "modules": [
            "ci",
            "podia",
            "nastiy",
            "mala",
            "kazkar",
            "calendar",
            "gallery",
        ],
    }
