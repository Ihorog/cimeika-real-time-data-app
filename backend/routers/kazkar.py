from datetime import datetime
from typing import Dict
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class StoryRequest(BaseModel):
    title: str
    seed: str | None = None


@router.post("/story", response_model=Dict[str, str])
def craft_story(request: StoryRequest):
    return {
        "title": request.title,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "snippet": f"Казкар починає історію про {request.title}",
    }


@router.get("/history", response_model=Dict[str, str])
def list_history():
    return {"recent": "Ци пам'ятає останню історію для дитячого сну"}
