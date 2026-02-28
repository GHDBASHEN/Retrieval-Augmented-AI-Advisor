from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
import secrets

from database import get_db
from models import User

router = APIRouter(prefix="/users", tags=["Users"])

class UserCreate(BaseModel):
    email: str

class UserResponse(UserCreate):
    id: int
    api_key: str

    class Config:
        from_attributes = True

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    api_key = secrets.token_urlsafe(32)
    new_user = User(email=user.email, api_key=api_key)
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
