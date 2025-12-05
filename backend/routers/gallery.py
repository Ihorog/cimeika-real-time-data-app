from typing import Dict, List
from fastapi import APIRouter, UploadFile
from pydantic import BaseModel

from backend.utils.orchestrator import Task, TaskOrchestrator

router = APIRouter(prefix="/gallery")
orchestrator = TaskOrchestrator()


class GalleryItem(BaseModel):
    id: str
    title: str
    url: str
    mood: str


def handle_gallery_task(task: Task):
    item = GalleryItem(**task.payload)
    return {
        "module": task.module,
        "stored": item.id,
        "title": item.title,
        "mood": item.mood,
    }


orchestrator.register_handler("gallery", handle_gallery_task)


@router.get("/images", response_model=List[GalleryItem])
def list_images():
    return [
        GalleryItem(id="g-001", title="Ci Glow", url="https://example.com/glow.jpg", mood="calm"),
        GalleryItem(id="g-002", title="Family memory", url="https://example.com/family.jpg", mood="warm"),
    ]


@router.post("/upload", response_model=Dict[str, str])
def upload_image(file: UploadFile):
    return {"filename": file.filename, "status": "stored", "destination": "ci_gallery"}
