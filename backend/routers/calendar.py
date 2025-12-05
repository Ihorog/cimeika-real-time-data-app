from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/calendar")


class TimeNode(BaseModel):
    id: str
    title: str
    start: datetime
    end: datetime
    sentiment: str


@router.get("/time", response_model=List[TimeNode])
def time_map():
    now = datetime.utcnow()
    return [
        TimeNode(id="tn-001", title="Ci Sync", start=now, end=now + timedelta(hours=1), sentiment="focus"),
        TimeNode(
            id="tn-002",
            title="Галерея апдейт",
            start=now + timedelta(hours=2),
            end=now + timedelta(hours=3),
            sentiment="creative",
        ),
    ]
