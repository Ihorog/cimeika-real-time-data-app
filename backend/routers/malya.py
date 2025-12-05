from typing import Dict
from fastapi import APIRouter
from pydantic import BaseModel

from backend.utils.connectors import request_creative

router = APIRouter(prefix="/mala")


class CreativePrompt(BaseModel):
    idea: str
    style: str = "sketch"


@router.post("/creative", response_model=Dict[str, str])
def generate_art(prompt: CreativePrompt):
    creative_response = request_creative(prompt.model_dump())
    if creative_response.get("status") == "ok" and isinstance(creative_response.get("data"), dict):
        data = creative_response["data"]
        return {
            "idea": data.get("idea", prompt.idea),
            "style": data.get("style", prompt.style),
            "hf_dataset": data.get("hf_dataset", "ok"),
        }

    return {
        "idea": prompt.idea,
        "style": prompt.style,
        "hf_dataset": creative_response.get("message", "unavailable"),
    }


@router.get("/creative", response_model=Dict[str, str])
def creative_status():
    status_response = request_creative({"idea": "ping", "style": "status"})
    if status_response.get("status") == "ok" and isinstance(status_response.get("data"), dict):
        return {"status": status_response["data"].get("status", "ready")}

    return {"status": "ready", "supported_styles": "sketch, watercolor, synthwave"}
