from fastapi import APIRouter, Depends, status
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.api import deps
from app.core.security.password import get_password_hash
from app.models import User
from app.schemas.requests import UserUpdatePasswordRequest
from app.schemas.responses import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse, description="Get current user")
def read_current_user(
    current_user: User = Depends(deps.get_current_user),
) -> User:
    return current_user


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Delete current user",
)
def delete_current_user(
    current_user: User = Depends(deps.get_current_user),
    session: Session = Depends(deps.get_session),
) -> None:
    session.execute(delete(User).where(User.user_id == current_user.user_id))
    session.commit()


@router.post(
    "/reset-password",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Update current user password",
)
def reset_current_user_password(
    user_update_password: UserUpdatePasswordRequest,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_user),
) -> None:
    current_user.hashed_password = get_password_hash(user_update_password.password)
    session.add(current_user)
    session.commit()
