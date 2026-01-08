from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database (Optional - Unused in current migration)
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = "localhost"
    DB_PORT: Optional[int] = 5432
    DB_NAME: Optional[str] = None

    # Firebase
    FIREBASE_DATABASE_URL: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None # Path
    FIREBASE_SERVICE_ACCOUNT_PATH: Optional[str] = None
    FIREBASE_SERVICE_ACCOUNT_JSON: Optional[str] = None

    # Admin
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    
    # Security
    SECRET_KEY: str = "dev_secret_key_change_this_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200 # 30 days

    class Config:
        env_file = ".env"
        extra = "ignore" # Ignore extra env vars

settings = Settings()
