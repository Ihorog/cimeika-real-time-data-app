import os
from typing import Any, Dict, Optional

import httpx

DEFAULT_TIMEOUT = float(os.getenv("CIMEIKA_HTTP_TIMEOUT", "5"))


class ConnectorConfig:
    @staticmethod
    def api_base() -> str:
        return os.getenv("CIMEIKA_API", "https://api.cimeika.com.ua").rstrip("/")

    @staticmethod
    def openai_key() -> str:
        return os.getenv("CI_OPENAI_KEY", "")

    @staticmethod
    def hf_token() -> str:
        return os.getenv("HF_TOKEN", "")

    @staticmethod
    def telegram_token() -> str:
        return os.getenv("TG_BOT_TOKEN", "")

    @staticmethod
    def calendar_key() -> str:
        return os.getenv("CALENDAR_SYNC_KEY", "")

    @staticmethod
    def github_pat() -> str:
        return os.getenv("GITHUB_PAT", "")


def _build_client() -> httpx.Client:
    return httpx.Client(
        base_url=ConnectorConfig.api_base(),
        timeout=DEFAULT_TIMEOUT,
        headers={"User-Agent": "CimeikaBackend/0.1"},
    )


def _request_json(method: str, path: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    try:
        with _build_client() as client:
            response = client.request(method, path, json=payload)
        response.raise_for_status()
        data = response.json()
        return {"status": "ok", "data": data}
    except httpx.TimeoutException:
        return {"status": "error", "error": "timeout", "message": "Request timed out"}
    except httpx.HTTPStatusError as exc:
        return {
            "status": "error",
            "error": "http_error",
            "status_code": exc.response.status_code,
            "message": exc.response.text,
        }
    except httpx.RequestError as exc:
        return {"status": "error", "error": "request_error", "message": str(exc)}
    except Exception as exc:  # pragma: no cover - safeguard for unexpected errors
        return {"status": "error", "error": "internal_error", "message": str(exc)}


def submit_mood(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    return _request_json("POST", "/nastiy/mood", snapshot)


def fetch_mood() -> Dict[str, Any]:
    return _request_json("GET", "/nastiy/mood")


def request_creative(prompt: Dict[str, Any]) -> Dict[str, Any]:
    return _request_json("POST", "/mala/creative", prompt)


def request_story(payload: Dict[str, Any]) -> Dict[str, Any]:
    return _request_json("POST", "/kazkar/story", payload)


def fetch_events() -> Dict[str, Any]:
    return _request_json("GET", "/podia/events")
