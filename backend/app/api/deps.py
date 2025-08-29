from typing import Annotated, Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api import api_messages
from app.core.database_session import get_session
from app.core.security.jwt import verify_jwt_token
from app.models import User

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
