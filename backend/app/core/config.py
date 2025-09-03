# File with environment variables and general configuration logic.
# Env variables are combined in nested groups like "Security", "Database" etc.
# So environment variable (case-insensitive) for jwt_secret_key will be "security__jwt_secret_key"
#
# Pydantic priority ordering:
#
# 1. (Most important, will overwrite everything) - environment variables
# 2. `.env` file in root folder of project
# 3. Default values
#
# "sqlalchemy_database_uri" is computed field that will create valid database URL
#
# See https://pydantic-docs.helpmanual.io/usage/settings/
# Note, complex types like lists are read as json-encoded strings.

import logging.config
from functools import lru_cache
from pathlib import Path
from typing import List, Union

from pydantic import AnyHttpUrl, BaseModel, Field, SecretStr, computed_field, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_DIR = Path(__file__).parent.parent.parent


class Security(BaseModel):
    jwt_issuer: str = "my-app"
    jwt_secret_key: SecretStr = SecretStr("sk-change-me")
    jwt_access_token_expire_secs: int = 24 * 3600  # 1d
    refresh_token_expire_secs: int = 28 * 24 * 3600  # 28d
    password_bcrypt_rounds: int = 12
    allowed_hosts: list[str] = ["localhost", "127.0.0.1"]
    # Default CORS origins for development. In production, these can be overridden
    # via environment variables following the nested delimiter pattern:
    # SECURITY__BACKEND_CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
    backend_cors_origins: list[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @validator("backend_cors_origins", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        elif isinstance(v, str) and v.startswith("["):
            # Handle JSON array string
            import json
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return []


class Database(BaseModel):
    hostname: str = "localhost"
    username: str = "postgres"
    password: SecretStr = SecretStr("postgres123")
    port: int = 5432
    db: str = "fastapi_nextjs"


class Admin(BaseModel):
    email: str = "admin@example.com"
    password: str = "admin123"


class Settings(BaseSettings):
    security: Security = Field(default_factory=Security)
    database: Database = Field(default_factory=Database)
    admin: Admin = Field(default_factory=Admin)
    create_default_admin: bool = False
    log_level: str = "INFO"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def sqlalchemy_database_uri(self) -> str:
        return f"postgresql://{self.database.username}:{self.database.password.get_secret_value()}@{self.database.hostname}:{self.database.port}/{self.database.db}"

    model_config = SettingsConfigDict(
        env_file=f"{PROJECT_DIR}/.env",
        case_sensitive=False,
        env_nested_delimiter="__",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


def logging_config(log_level: str) -> None:
    conf = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "verbose": {
                "format": "{asctime} [{levelname}] {name}: {message}",
                "style": "{",
            },
        },
        "handlers": {
            "stream": {
                "class": "logging.StreamHandler",
                "formatter": "verbose",
                "level": "DEBUG",
            },
        },
        "loggers": {
            "": {
                "level": log_level,
                "handlers": ["stream"],
                "propagate": True,
            },
        },
    }
    logging.config.dictConfig(conf)


logging_config(log_level=get_settings().log_level)
