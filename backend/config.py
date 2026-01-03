import os
from typing import List


def _split_csv(value: str) -> List[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    def __init__(self) -> None:
        self.api_title = os.getenv("API_TITLE", "Cimeika API")
        self.api_base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", os.getenv("CI_OPENAI_KEY", ""))
        self.hf_api_key = os.getenv("HF_API_KEY", os.getenv("HF_TOKEN", ""))
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        allowed_origins = os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,https://cimeika-real-time-data-app.vercel.app",
        )
        self.allowed_origins = _split_csv(allowed_origins)
        self.allowed_headers = ["Content-Type", "Authorization"]
        self.allowed_methods = ["GET", "POST", "OPTIONS"]


settings = Settings()
