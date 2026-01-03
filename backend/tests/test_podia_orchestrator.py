import datetime

from fastapi.testclient import TestClient

from backend.main import app
from backend.utils.orchestrator import Task, TaskOrchestrator


def test_dispatch_event_uses_podia_handler():
    client = TestClient(app)
    payload = {
        "id": "ev-123",
        "title": "Integration demo",
        "start": datetime.datetime(2024, 5, 4, 12, 0, 0).isoformat(),
        "context": "Ci",
    }

    response = client.post("/podia/events/dispatch", json=payload)

    assert response.status_code == 200
    body = response.json()
    task_result = body["task"]

    assert task_result["status"] == "complete"
    assert task_result["module"] == "podia"
    assert task_result["event"]["title"] == payload["title"]
    assert "message" in task_result
    assert body["pending"] == []


def test_dispatch_without_handler_marks_skipped():
    orchestrator = TaskOrchestrator()
    task = Task(id="no-handler", module="unknown", payload={})

    result = orchestrator.dispatch(task)

    assert result["status"] == "skipped"
    assert result["message"] == "No handler"
