from datetime import UTC, datetime
from typing import Any, Dict, List
from fastapi import APIRouter
from pydantic import BaseModel

from backend.utils.connectors import fetch_events
from backend.utils.orchestrator import Task, TaskOrchestrator

router = APIRouter()
orchestrator = TaskOrchestrator()


def handle_podia_task(task: Task) -> Dict[str, Any]:
    payload: Dict[str, Any] = dict(task.payload)
    start_value = payload.get("start")
    if isinstance(start_value, datetime):
        payload["start"] = start_value.isoformat()

    return {
        "module": task.module,
        "event": payload,
        "message": f"Подія '{payload.get('title', payload.get('id', 'невідома подія'))}' опрацьована",
        "received_at": datetime.now(UTC).isoformat(),
    }


orchestrator.register_handler("podia", handle_podia_task)


class Event(BaseModel):
    id: str
    title: str
    start: datetime
    context: str


@router.get("/events", response_model=List[Event])
def list_events():
    events_response = fetch_events()
    if events_response.get("status") == "ok" and isinstance(events_response.get("data"), list):
        return [Event(**item) for item in events_response["data"]]

    return [
        Event(id="ev-001", title="Ранкова медитація", start=datetime.utcnow(), context="Настрій"),
        Event(id="ev-002", title="Розробка Маля", start=datetime.utcnow(), context="Маля"),
    ]


@router.post("/events/dispatch")
def dispatch_event(event: Event):
    task = Task(id=event.id, module="podia", payload=event.model_dump(), priority=2)
    result = orchestrator.dispatch(task)
    return {"task": result, "pending": orchestrator.scheduler.snapshot()}
