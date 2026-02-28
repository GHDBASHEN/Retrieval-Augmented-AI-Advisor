from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models import Bot, User

router = APIRouter(prefix="/bots", tags=["Bots"])

class BotCreate(BaseModel):
    name: str
    description: Optional[str] = None
    owner_id: int

class BotResponse(BotCreate):
    id: int

    class Config:
        from_attributes = True

@router.post("/", response_model=BotResponse)
async def create_bot(bot: BotCreate, db: AsyncSession = Depends(get_db)):
    new_bot = Bot(**bot.model_dump())
    db.add(new_bot)
    await db.commit()
    await db.refresh(new_bot)
    return new_bot

@router.get("/", response_model=List[BotResponse])
async def list_bots(owner_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Bot).where(Bot.owner_id == owner_id))
    return result.scalars().all()

from services.ingestion import process_file_or_url
from services.vector_store import add_chunks_to_vector_db

class IngestUrlRequest(BaseModel):
    url: str

@router.post("/{bot_id}/ingest-url")
async def ingest_url(bot_id: int, request: IngestUrlRequest, db: AsyncSession = Depends(get_db)):
    # Very simple ingestion flow
    try:
        chunks = process_file_or_url(source=request.url, source_type="url", bot_id=bot_id)
        await add_chunks_to_vector_db(chunks)
        return {"status": "success", "message": f"Ingested URL into {len(chunks)} chunks"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
