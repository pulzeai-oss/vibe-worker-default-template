from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models import UserRole


class BaseRequest(BaseModel):
    # may define additional fields or config shared across requests
    pass


class RefreshTokenRequest(BaseRequest):
    refresh_token: str


class UserUpdatePasswordRequest(BaseRequest):
    password: str


class UserCreateRequest(BaseRequest):
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.VIEWER


class AdminUserCreateRequest(BaseRequest):
    email: EmailStr
    password: str
    role: UserRole = UserRole.VIEWER
