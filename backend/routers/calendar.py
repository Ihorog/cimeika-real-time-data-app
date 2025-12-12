from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, HTTPException, status
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
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "message": "Синхронізація календаря ще не підключена", 
            "source": "scheduler",
        },
    )
