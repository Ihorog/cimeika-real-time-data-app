from datetime import datetime
from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

from backend.utils.orchestrator import Task, TaskOrchestrator

router = APIRouter()
orchestrator = TaskOrchestrator()


class Event(BaseModel):
    id: str
    title: str
    start: datetime
    context: str


@router.get("/events", response_model=List[Event])
def list_events():
    return [
        Event(id="ev-001", title="Ранкова медитація", start=datetime.utcnow(), context="Настрій"),
        Event(id="ev-002", title="Розробка Маля", start=datetime.utcnow(), context="Маля"),
    ]


@router.post("/events/dispatch")
def dispatch_event(event: Event):
    task = Task(id=event.id, module="podia", payload=event.model_dump(), priority=2)
    result = orchestrator.dispatch(task)
    return {"task": result, "pending": orchestrator.scheduler.snapshot()}
