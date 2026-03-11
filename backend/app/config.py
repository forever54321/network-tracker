from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://tracking:password@localhost:5432/tracking"
    DATABASE_URL_SYNC: str = "postgresql://tracking:password@localhost:5432/tracking"

    UNIFI_HOST: str = "192.168.1.1"
    UNIFI_USERNAME: str = "admin"
    UNIFI_PASSWORD: str = ""
    UNIFI_SITE: str = "default"
    UNIFI_VERIFY_SSL: bool = False

    JWT_SECRET: str = "change-me-to-a-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    POLL_INTERVAL_SECONDS: int = 30
    SYSLOG_PORT: int = 5514

    class Config:
        env_file = ".env"


settings = Settings()
