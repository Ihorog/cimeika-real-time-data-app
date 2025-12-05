from typing import Dict, List
from fastapi import APIRouter, UploadFile
from pydantic import BaseModel

router = APIRouter(prefix="/gallery")


class GalleryItem(BaseModel):
    id: str
    title: str
    url: str
    mood: str


@router.get("/images", response_model=List[GalleryItem])
def list_images():
    return [
        GalleryItem(id="g-001", title="Ci Glow", url="https://example.com/glow.jpg", mood="calm"),
        GalleryItem(id="g-002", title="Family memory", url="https://example.com/family.jpg", mood="warm"),
    ]


@router.post("/upload", response_model=Dict[str, str])
def upload_image(file: UploadFile):
    return {"filename": file.filename, "status": "stored", "destination": "ci_gallery"}
