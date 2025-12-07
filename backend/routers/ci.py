from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from backend.utils.axis_loader import load_axis_manifest, score_axis_resonance
from backend.utils.sense_engine import SenseNode, map_resonance

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    resonance: Dict[str, float]


class AxisManifest(BaseModel):
    axes: Dict[str, Dict[str, Any]]
    balance_rule: str
    formula: str
    status: Optional[str] = None
    error: Optional[str] = None


class AxisResonanceRequest(BaseModel):
    focus: List[str]


class AxisResonanceScore(BaseModel):
    match_keywords: List[str]
    coverage: float
    color: Optional[str] = None
    symbol: Optional[str] = None


class AxisResonanceResponse(BaseModel):
    manifest: AxisManifest
    scores: Dict[str, AxisResonanceScore]
    resonance: Dict[str, float]


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    nodes = [
        SenseNode("podia", 0.9, 1, (0.6, 0.2, 0.3)),
        SenseNode("mood", 0.8, 1, (0.1, 0.9, 0.2)),
        SenseNode("gallery", 0.7, -1, (0.3, 0.4, 0.8)),
    ]
    resonance = map_resonance(nodes, (0.5, 0.5, 0.2))
    return ChatResponse(
        reply=f"Ci отримав: {payload.message}",
        resonance=resonance,
    )


@router.get("/data", response_model=Dict[str, List[str]])
def data_catalog() -> Dict[str, List[str]]:
    return {
        "streams": ["events", "mood", "creative", "history", "gallery"],
        "connectors": ["openai", "huggingface", "telegram", "google"],
    }


@router.get("/components", response_model=Dict[str, str])
def component_registry() -> Dict[str, str]:
    return {
        "dashboard": "Ci Console",
        "timeline": "PoДія Timeline",
        "waves": "Настрій Wave",
        "canvas": "Маля Canvas",
    }


@router.get("/axes", response_model=AxisManifest)
def axes_manifest() -> AxisManifest:
    manifest_data = load_axis_manifest()
    return AxisManifest(**manifest_data)


@router.post("/axes/resonance", response_model=AxisResonanceResponse)
def axes_resonance(payload: AxisResonanceRequest) -> AxisResonanceResponse:
    result = score_axis_resonance(payload.focus)
    manifest = AxisManifest(**result["manifest"])
    scores = {
        name: AxisResonanceScore(**score)
        for name, score in result["scores"].items()
    }
    return AxisResonanceResponse(
        manifest=manifest,
        scores=scores,
        resonance=result["resonance"],
    )
