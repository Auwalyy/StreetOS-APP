from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    mongodb_uri: str
    redis_url: str = "redis://localhost:6379"
    whisper_model: str = "medium"
    gemini_model: str = "gemini-1.5-flash"
    gemini_pro_model: str = "gemini-1.5-pro"
    environment: str = "development"
    port: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
