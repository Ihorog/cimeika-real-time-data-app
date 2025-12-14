from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.utils.connectors import fetch_events
from backend.utils.orchestrator import Task, TaskOrchestrator

router = APIRouter()
orchestrator = TaskOrchestrator()


def handle_podia_task(task: Task):
    event = Event(**task.payload)
    timeline = list_events()
    return {
        "module": task.module,
        "scheduled": event.id,
        "title": event.title,
        "context": event.context,
        "existing_events": len(timeline),
    }


orchestrator.register_handler("podia", handle_podia_task)


class Event(BaseModel):
    id: str
    title: str
    # use default_factory so the default is evaluated at instantiation time
    start: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    context: str


@router.get("/events", response_model=List[Event])
def list_events():
    events_response = fetch_events()
    if events_response.get("status") == "ok" and isinstance(events_response.get("data"), list):
        return [Event(**item) for item in events_response["data"]]

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail={
            "message": events_response.get("message", "Не вдалося отримати події з ядра Cimeika"),
            "source": events_response.get("error", "connector"),
        },
    )


@router.post("/events/dispatch")
def dispatch_event(event: Event):
    task = Task(id=event.id, module="podia", payload=event.model_dump(), priority=2)
    result = orchestrator.dispatch(task)
    return {"task": result, "pending": orchestrator.scheduler.snapshot()}
