from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from backend.utils.connectors import summarize_with_openai
from backend.utils.orchestrator import Task, TaskOrchestrator

router = APIRouter(prefix="/nastiy")
orchestrator = TaskOrchestrator()


class MoodSnapshot(BaseModel):
    mood: str
    intensity: int
    note: Optional[str] = None


def handle_mood_task(task: Task):
    snapshot = MoodSnapshot(**task.payload)
    summary = summarize_with_openai(f"Mood: {snapshot.mood}, intensity: {snapshot.intensity}")
    return {
        "module": task.module,
        "status": summary.get("status", "processed"),
        "note": snapshot.note or "Mood captured",
    }


orchestrator.register_handler("mood", handle_mood_task)


@router.post("/mood", response_model=Dict[str, str])
def capture_mood(snapshot: MoodSnapshot):
    api_response = submit_mood(snapshot.model_dump())
    if api_response.get("status") == "ok":
        data = api_response.get("data", {})
        return MoodResponse(
            status="ok",
            summary=data.get("summary", snapshot.note or "Настрій зафіксовано"),
            source="api",
        )

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail={
            "message": api_response.get("message", "Не вдалося записати настрій"),
            "source": api_response.get("error", "connector"),
        },
    )


@router.get("/mood", response_model=MoodSnapshot)
def latest_mood():
    api_response = fetch_mood()
    if api_response.get("status") == "ok" and isinstance(api_response.get("data"), dict):
        return MoodSnapshot(**api_response["data"])

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail={
            "message": api_response.get("message", "Не вдалося отримати поточний настрій"),
            "source": api_response.get("error", "connector"),
        },
    )
