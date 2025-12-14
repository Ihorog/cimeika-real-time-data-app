from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from backend.utils.orchestrator import Task, TaskOrchestrator

router = APIRouter(prefix="/calendar")
orchestrator = TaskOrchestrator()


class TimeNode(BaseModel):
    id: str
    title: str
    start: datetime
    end: datetime
    sentiment: str


def handle_calendar_task(task: Task):
    node = TimeNode(**task.payload)
    return {
        "module": task.module,
        "slot": node.id,
        "sentiment": node.sentiment,
        "window": f"{node.start.isoformat()}Z-{node.end.isoformat()}Z",
    }


orchestrator.register_handler("calendar", handle_calendar_task)


@router.get("/time", response_model=List[TimeNode])
def time_map():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "message": "Синхронізація календаря ще не підключена", 
            "source": "scheduler",
        },
    )
