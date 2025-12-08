from typing import Dict, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from backend.utils.connectors import request_story

router = APIRouter()


class StoryRequest(BaseModel):
    title: str
    seed: Optional[str] = None


@router.post("/story", response_model=Dict[str, str])
def craft_story(request: StoryRequest):
    """Create a story via the external connector and return selected fields.

    Expects request to contain at least a title; optional seed may be provided.
    """
    story_response = request_story(request.model_dump())
    if story_response.get("status") == "ok" and isinstance(story_response.get("data"), dict):
        data = story_response["data"]
        return {
            "title": data.get("title", request.title),
            "created_at": data.get("created_at", ""),
            "snippet": data.get("snippet", ""),
        }

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail={
            "message": story_response.get("message", "Казкар наразі недоступний"),
            "source": story_response.get("error", "connector"),
        },
    )


@router.get("/history", response_model=Dict[str, str])
def list_history():
    """Fetch story generation history from the external connector."""
    history_response = request_story({"title": "history"})
    if history_response.get("status") == "ok" and isinstance(history_response.get("data"), dict):
        return history_response["data"]

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail={
            "message": history_response.get("message", "Не вдалося отримати історії"),
            "source": history_response.get("error", "connector"),
        },
    )
