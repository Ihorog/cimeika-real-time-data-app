from typing import Dict, List
from fastapi import APIRouter, HTTPException, UploadFile, status
from pydantic import BaseModel

router = APIRouter(prefix="/gallery")


class GalleryItem(BaseModel):
    id: str
    title: str
    url: str
    mood: str


@router.get("/images", response_model=List[GalleryItem])
def list_images():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "message": "Галерея ще не підключена до сховища",
            "source": "gallery",
        },
    )


@router.post("/upload", response_model=Dict[str, str])
def upload_image(file: UploadFile):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "message": "Завантаження файлів ще не налаштовано",
            "source": "gallery",
        },
    )
