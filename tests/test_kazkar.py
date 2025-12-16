from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.routers import kazkar


def create_app():
    app = FastAPI()
    app.include_router(kazkar.router)
    return app


def test_craft_story_success(monkeypatch):
    def fake_request_story(payload):
        return {
            "status": "ok",
            "data": {
                "title": "My Story",
                "created_at": "2025-12-08T00:00:00Z",
                "snippet": "Once upon...",
            },
        }

    monkeypatch.setattr("backend.routers.kazkar.request_story", fake_request_story)
    client = TestClient(create_app())

    resp = client.post("/story", json={"title": "ignored", "seed": "s"})
    assert resp.status_code == 200
    assert resp.json() == {
        "title": "My Story",
        "created_at": "2025-12-08T00:00:00Z",
        "snippet": "Once upon...",
    }


def test_craft_story_error(monkeypatch):
    monkeypatch.setattr(
        "backend.routers.kazkar.request_story", lambda payload: {"status": "error", "message": "fail", "error": "down"}
    )
    client = TestClient(create_app())

    resp = client.post("/story", json={"title": "T"})
    assert resp.status_code == 502
    data = resp.json()
    assert data["detail"]["message"] == "fail"


def test_list_history_success(monkeypatch):
    monkeypatch.setattr(
        "backend.routers.kazkar.request_story", lambda payload: {"status": "ok", "data": {"s1": "snippet1", "s2": "snippet2"}}
    )
    client = TestClient(create_app())

    resp = client.get("/history")
    assert resp.status_code == 200
    assert resp.json() == {"s1": "snippet1", "s2": "snippet2"}


def test_list_history_error(monkeypatch):
    monkeypatch.setattr(
        "backend.routers.kazkar.request_story", lambda payload: {"status": "error", "message": "nope", "error": "down"}
    )
    client = TestClient(create_app())

    resp = client.get("/history")
    assert resp.status_code == 502
    assert resp.json()["detail"]["message"] == "nope"