from typing import Dict, List
from fastapi import APIRouter
from pydantic import BaseModel

from backend.utils.sense_engine import SenseNode, map_resonance

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    resonance: Dict[str, float]


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    nodes = [
        SenseNode("podia", 0.9, 1, (0.6, 0.2, 0.3)),
        SenseNode("mood", 0.8, 1, (0.1, 0.9, 0.2)),
        SenseNode("gallery", 0.7, -1, (0.3, 0.4, 0.8)),
    ]
    resonance = map_resonance(nodes, (0.5, 0.5, 0.2))
    return ChatResponse(reply=f"Ci отримав: {payload.message}", resonance=resonance)


@router.get("/data", response_model=Dict[str, List[str]])
def data_catalog():
    return {
        "streams": ["events", "mood", "creative", "history", "gallery"],
        "connectors": ["openai", "huggingface", "telegram", "google"],
    }


@router.get("/components", response_model=Dict[str, str])
def component_registry():
    return {
        "dashboard": "Ci Console",
        "timeline": "PoДія Timeline",
        "waves": "Настрій Wave",
        "canvas": "Маля Canvas",
    }
