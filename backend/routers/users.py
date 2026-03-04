from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
import secrets
import hashlib
import os

from database import get_db
from models import User

router = APIRouter(prefix="/users", tags=["Users"])

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    api_key: str

    class Config:
        from_attributes = True

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    salt = os.urandom(16)
    hashed_pwd_bytes = hashlib.pbkdf2_hmac('sha256', user.password.encode('utf-8'), salt, 100000)
    # Store salt and hash together as hex
    hashed_pwd = salt.hex() + ':' + hashed_pwd_bytes.hex()
    api_key = secrets.token_urlsafe(32)
    new_user = User(email=user.email, hashed_password=hashed_pwd, api_key=api_key)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/login", response_model=UserResponse)
async def login_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    try:
        stored_salt_hex, stored_hash_hex = existing_user.hashed_password.split(':')
        stored_salt = bytes.fromhex(stored_salt_hex)
        expected_hash = bytes.fromhex(stored_hash_hex)
        actual_hash = hashlib.pbkdf2_hmac('sha256', user.password.encode('utf-8'), stored_salt, 100000)
        
        if not secrets.compare_digest(actual_hash, expected_hash):
            raise ValueError("Password mismatch")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return existing_user
