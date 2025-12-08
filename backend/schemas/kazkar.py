from pydantic import BaseModel
from typing import Optional, Dict


class StoryOut(BaseModel):
    title: str
    created_at: Optional[str] = ""
    snippet: Optional[str] = ""


class HistoryOut(BaseModel):
    __root__: Dict[str, str]
