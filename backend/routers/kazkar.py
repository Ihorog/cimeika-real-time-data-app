from typing import Dict
from fastapi import APIRouter
from pydantic import BaseModel

from backend.utils.connectors import request_story

router = APIRouter()


class StoryRequest(BaseModel):
    title: str
    seed: str | None = None


@router.post("/story", response_model=Dict[str, str])
def craft_story(request: StoryRequest):
    story_response = request_story(request.model_dump())
    if story_response.get("status") == "ok" and isinstance(story_response.get("data"), dict):
        data = story_response["data"]
        return {
            "title": data.get("title", request.title),
            "created_at": data.get("created_at", ""),
            "snippet": data.get("snippet", ""),
        }

    return {
        "title": request.title,
        "created_at": "",
        "snippet": story_response.get("message", "Казкар зараз офлайн"),
    }


@router.get("/history", response_model=Dict[str, str])
def list_history():
    history_response = request_story({"title": "history"})
    if history_response.get("status") == "ok" and isinstance(history_response.get("data"), dict):
        return history_response["data"]

    return {"recent": "Ци пам'ятає останню історію для дитячого сну"}
