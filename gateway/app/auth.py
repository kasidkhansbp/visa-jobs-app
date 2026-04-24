from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Cookie, HTTPException, status
from jose import JWTError, jwt

from .config import GatewayConfig

config = GatewayConfig()  # type: ignore[call-arg]

ALGORITHM = "HS256"
COOKIE_NAME = "access_token"


def create_access_token(user_id: str, email: str, name: str, picture: Optional[str]) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=config.jwt_expiry_minutes)
    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "exp": expire,
    }
    return jwt.encode(payload, config.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, config.jwt_secret, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_current_user(access_token: Optional[str] = Cookie(default=None)) -> dict:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return decode_access_token(access_token)


def get_optional_user(access_token: Optional[str] = Cookie(default=None)) -> Optional[dict]:
    if not access_token:
        return None
    try:
        return decode_access_token(access_token)
    except HTTPException:
        return None
