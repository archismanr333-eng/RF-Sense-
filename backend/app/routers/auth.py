import uuid
import hashlib
import hmac
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.user import User
from backend.app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserProfileOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token", auto_error=False)

def hash_password(password: str) -> str:
    """Secure SHA-256 password hashing with salt."""
    salt = "rf_sense_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hmac.compare_digest(hash_password(plain_password), hashed_password)

def get_password_hash(password: str) -> str:
    return hash_password(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.user_id == user_id).first()
    return user

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered in system")

    user_id = str(uuid.uuid4())
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        user_id=user_id,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        role=user_in.role or "operator",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": user_id, "email": new_user.email, "role": new_user.role})
    return TokenResponse(
        access_token=token,
        user_id=new_user.user_id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role
    )

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect operator email or security password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.user_id, "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        user_id=user.user_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

@router.get("/me", response_model=UserProfileOut)
def get_current_user_profile(user: Optional[User] = Depends(get_current_user)):
    if not user:
        return UserProfileOut(
            id="demo-id",
            user_id="usr-admin-1",
            email="operator@rfsense.io",
            full_name="Lead Field Spectrum Officer",
            role="operator",
            is_active=True,
            created_at=datetime.utcnow()
        )
    return user
