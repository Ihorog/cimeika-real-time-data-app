from fastapi import APIRouter
from pydantic import BaseModel

from backend.utils.connectors import fetch_mood, submit_mood

router = APIRouter(prefix="/nastiy")


class MoodSnapshot(BaseModel):
    mood: str
    intensity: int
    note: str | None = None


class MoodResponse(BaseModel):
    status: str
    summary: str
    source: str | None = None


@router.post("/mood", response_model=MoodResponse)
def capture_mood(snapshot: MoodSnapshot):
    api_response = submit_mood(snapshot.model_dump())
    if api_response.get("status") == "ok":
        data = api_response.get("data", {})
        return MoodResponse(
            status="ok",
            summary=data.get("summary", snapshot.note or "Настрій зафіксовано"),
            source="api",
        )

    return MoodResponse(
        status="error",
        summary=api_response.get("message", "Не вдалося записати настрій"),
        source=api_response.get("error"),
    )


@router.get("/mood", response_model=MoodSnapshot)
def latest_mood():
    api_response = fetch_mood()
    if api_response.get("status") == "ok" and isinstance(api_response.get("data"), dict):
        return MoodSnapshot(**api_response["data"])

    return MoodSnapshot(mood="невідомо", intensity=0, note="offline")
