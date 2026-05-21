from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    VOYAGE_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]
    ENVIRONMENT: str = "development"
    NEON_DATABASE_URL: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
