from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List

from app.api import api_messages, deps
from app.core.security.password import get_password_hash
from app.models import User, UserRole
from app.schemas.requests import UserUpdatePasswordRequest, AdminUserCreateRequest
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


# Admin-only endpoints
@router.get(
    "/",
    response_model=List[UserResponse],
    description="List all users (Admin only)",
)
def list_users(
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.require_admin),
) -> List[User]:
    users = session.scalars(select(User)).all()
    return users


@router.post(
    "/",
    response_model=UserResponse,
    description="Create new user (Admin only)",
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    new_user: AdminUserCreateRequest,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.require_admin),
) -> User:
    user = session.scalar(select(User).where(User.email == new_user.email))
    if user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_messages.EMAIL_ADDRESS_ALREADY_USED,
        )

    # Set admin flag if role is ADMIN
    is_admin = new_user.role == UserRole.ADMIN

    user = User(
        email=new_user.email,
        hashed_password=get_password_hash(new_user.password),
        role=new_user.role,
        is_admin=is_admin,
    )
    session.add(user)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_messages.EMAIL_ADDRESS_ALREADY_USED,
        )

    return user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Delete user (Admin only)",
)
def delete_user(
    user_id: str,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.require_admin),
) -> None:
    # Prevent admin from deleting themselves
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    
    result = session.execute(delete(User).where(User.user_id == user_id))
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    session.commit()
