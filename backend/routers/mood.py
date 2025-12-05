from typing import Dict
from fastapi import APIRouter
from pydantic import BaseModel

from backend.utils.connectors import summarize_with_openai

router = APIRouter(prefix="/nastiy")


class MoodSnapshot(BaseModel):
    mood: str
    intensity: int
    note: str | None = None


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
