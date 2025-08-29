# SQLAlchemy engine and sessions tools
#
# https://docs.sqlalchemy.org/en/20/orm/session_basics.html
#
# for pool size configuration:
# https://docs.sqlalchemy.org/en/20/core/pooling.html#sqlalchemy.pool.Pool

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings


def new_engine(uri: str):
    return create_engine(
        uri,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30.0,
        pool_recycle=600,
    )


_ENGINE = new_engine(get_settings().sqlalchemy_database_uri)
_SESSIONMAKER = sessionmaker(autocommit=False, autoflush=False, bind=_ENGINE)


def get_session():
    """Dependency to get database session"""
    db = _SESSIONMAKER()
    try:
        yield db
    finally:
        db.close()
