from typing import Annotated, Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api import api_messages
from app.core.database_session import get_session
from app.core.security.jwt import verify_jwt_token
from app.models import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/access-token")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Session = Depends(get_session),
) -> User:
    token_payload = verify_jwt_token(token)

    user = session.scalar(select(User).where(User.user_id == token_payload.sub))

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=api_messages.JWT_ERROR_USER_REMOVED,
        )
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin privileges"""
    if not current_user.is_admin and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


def require_editor_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require editor or admin privileges"""
    if current_user.role not in [UserRole.EDITOR, UserRole.ADMIN] and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Editor or Admin privileges required"
        )
    return current_user
