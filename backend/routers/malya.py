from typing import Dict
from fastapi import APIRouter
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
    dataset_status = fetch_hf_dataset("ci_power")
    return {
        "idea": prompt.idea,
        "style": prompt.style,
        "hf_dataset": dataset_status.get("status", "unknown"),
    }


@router.get("/creative", response_model=Dict[str, str])
def creative_status():
    return {"status": "ready", "supported_styles": "sketch, watercolor, synthwave"}
