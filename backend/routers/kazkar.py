from datetime import datetime
from typing import Dict
from fastapi import APIRouter
from pydantic import BaseModel

from backend.utils.orchestrator import Task, TaskOrchestrator

router = APIRouter()
orchestrator = TaskOrchestrator()


class StoryRequest(BaseModel):
    title: str
    seed: str | None = None


def handle_kazkar_task(task: Task):
    request = StoryRequest(**task.payload)
    return {
        "module": task.module,
        "title": request.title,
        "seeded": bool(request.seed),
        "status": "story_queued",
    }


orchestrator.register_handler("kazkar", handle_kazkar_task)


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
