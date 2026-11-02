from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Healthcare App"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = False

    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_DB: str = "healthcare_admin"
    MYSQL_USER: str = "healthcare_user"
    MYSQL_PASSWORD: str

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+aiomysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        )

    @property
    def SETUP_DATABASE_URL(self) -> str:
        """URL without a specific database — used to CREATE databases."""
        return (
            f"mysql+aiomysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/"
        )

    GEMINI_API_KEY: str = ""
    AI_MODEL: str = "gemini-2.0-flash"
    AI_MAX_TOKENS: int = 1024

    CORS_ORIGINS: str = "*"

    @property
    def cors_origins_list(self) -> list[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",")]
        return origins

    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"
    ALLOWED_MIME_TYPES: str = "application/pdf,image/jpeg,image/png"

    @property
    def allowed_mime_types_set(self) -> set[str]:
        return {m.strip() for m in self.ALLOWED_MIME_TYPES.split(",")}

    RATE_LIMIT_PER_MINUTE: int = 60


settings = Settings()
