from typing import Dict
from fastapi import APIRouter
from pydantic import BaseModel

from backend.utils.connectors import summarize_with_openai
from backend.utils.orchestrator import Task, TaskOrchestrator

router = APIRouter(prefix="/nastiy")
orchestrator = TaskOrchestrator()


class MoodSnapshot(BaseModel):
    mood: str
    intensity: int
    note: str | None = None


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
    summary = summarize_with_openai(f"Mood: {snapshot.mood}, intensity: {snapshot.intensity}")
    return {
        "status": summary.get("status", "ok"),
        "summary": snapshot.note or "Настрій зафіксовано",
    }


@router.get("/mood", response_model=MoodSnapshot)
def latest_mood():
    return MoodSnapshot(mood="врівноважений", intensity=7, note="Ранкова хвиля спокою")
