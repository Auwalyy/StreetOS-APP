from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    openai_api_key: str
    mongodb_uri: str
    redis_url: str = "redis://localhost:6379"
    whisper_model: str = "medium"
    environment: str = "development"
    port: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
