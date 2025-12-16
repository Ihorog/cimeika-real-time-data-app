from typing import Dict
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from backend.utils.connectors import fetch_hf_dataset
from backend.utils.orchestrator import Task, TaskOrchestrator

router = APIRouter(prefix="/mala")
orchestrator = TaskOrchestrator()


class CreativePrompt(BaseModel):
    idea: str
    style: str = "sketch"


def handle_malya_task(task: Task):
    prompt = CreativePrompt(**task.payload)
    dataset_status = fetch_hf_dataset("ci_power")
    return {
        "module": task.module,
        "idea": prompt.idea,
        "style": prompt.style,
        "hf_dataset": dataset_status.get("status", "unknown"),
    }


orchestrator.register_handler("mala", handle_malya_task)


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
