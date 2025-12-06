from typing import Dict
from fastapi import APIRouter, HTTPException, status
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

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail={
            "message": creative_response.get("message", "Сервіс творчості недоступний"),
            "source": creative_response.get("error", "connector"),
        },
    )


@router.get("/creative", response_model=Dict[str, str])
def creative_status():
    status_response = request_creative({"idea": "ping", "style": "status"})
    if status_response.get("status") == "ok" and isinstance(status_response.get("data"), dict):
        return {"status": status_response["data"].get("status", "ready")}

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail={
            "message": status_response.get("message", "Недоступний стан сервісу творчості"),
            "source": status_response.get("error", "connector"),
        },
    )
