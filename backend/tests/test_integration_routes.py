import httpx
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.utils import connectors


@pytest.fixture(autouse=True)
def mock_cimeika_api(monkeypatch):
    responses = {
        ("POST", "/nastiy/mood"): {"summary": "Настрій прийнято API"},
        ("GET", "/nastiy/mood"): {"mood": "радісний", "intensity": 8, "note": "API"},
        ("POST", "/mala/creative"): {
            "idea": "зоряний сад",
            "style": "synthwave",
            "hf_dataset": "ok",
            "status": "ready",
        },
        ("POST", "/kazkar/story"): {
            "title": "API story",
            "snippet": "Казкар шепоче про зорі",
            "created_at": "2024-01-01T00:00:00Z",
        },
        ("GET", "/podia/events"): [
            {
                "id": "ev-010",
                "title": "API synced event",
                "start": "2024-01-01T00:00:00Z",
                "context": "Настрій",
            }
        ],
    }

    def handler(request: httpx.Request) -> httpx.Response:
        key = (request.method, request.url.path)
        if key in responses:
            payload = responses[key]
            return httpx.Response(200, json=payload)
        return httpx.Response(404, json={"error": "not found"})

    transport = httpx.MockTransport(handler)

    def build_client():
        return httpx.Client(
            base_url="http://cimeika.api",
            transport=transport,
            timeout=connectors.DEFAULT_TIMEOUT,
            headers={"User-Agent": "CimeikaBackend/0.1-test"},
        )

    monkeypatch.setattr(connectors, "_build_client", build_client)
    monkeypatch.setenv("CIMEIKA_API", "http://cimeika.api")
    yield


def test_capture_mood_uses_api_summary():
    client = TestClient(app)
    response = client.post(
        "/nastiy/mood", json={"mood": "спокій", "intensity": 6, "note": "вечір"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["summary"] == "Настрій прийнято API"


def test_generate_art_uses_remote_status():
    client = TestClient(app)
    response = client.post("/mala/creative", json={"idea": "сад", "style": "sketch"})

    assert response.status_code == 200
    body = response.json()
    assert body["idea"] == "зоряний сад"
    assert body["style"] == "synthwave"
    assert body["hf_dataset"] == "ok"


def test_kazkar_story_proxies_api():
    client = TestClient(app)
    response = client.post("/kazkar/story", json={"title": "Лисиця", "seed": "ніч"})

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "API story"
    assert "Казкар" in body["snippet"]


def test_podia_events_forwarded_from_api():
    client = TestClient(app)
    response = client.get("/podia/events")

    assert response.status_code == 200
    body = response.json()
    assert isinstance(body, list)
    assert body[0]["id"] == "ev-010"
    assert body[0]["context"] == "Настрій"


def test_connectors_timeout(monkeypatch):
    def handler(_request: httpx.Request):
        raise httpx.ReadTimeout("timeout")

    transport = httpx.MockTransport(handler)

    def build_client_timeout():
        return httpx.Client(base_url="http://cimeika.api", transport=transport, timeout=0.1)

    monkeypatch.setattr(connectors, "_build_client", build_client_timeout)

    response = connectors.fetch_mood()

    assert response["status"] == "error"
    assert response["error"] == "timeout"
