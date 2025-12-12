from pydantic import BaseModel, RootModel
from typing import Optional, Dict


class StoryOut(BaseModel):
    title: str
    created_at: Optional[str] = ""
    snippet: Optional[str] = ""


class HistoryOut(RootModel[Dict[str, str]]):
    pass
