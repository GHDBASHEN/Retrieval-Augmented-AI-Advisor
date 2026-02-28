from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List

from database import get_db
from models import Conversation, Bot, User
from dependencies import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])

class ConversationQuery(BaseModel):
    user_query: str

class ConversationResponse(BaseModel):
    id: int
    bot_id: int
    user_query: str
    bot_response: str
    
    class Config:
        from_attributes = True

from services.rag import process_rag_query

@router.post("/{bot_id}", response_model=ConversationResponse)
async def chat_with_bot(bot_id: int, query: ConversationQuery, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify bot exists and user owns it
    result = await db.execute(select(Bot).where(Bot.id == bot_id, Bot.owner_id == current_user.id))
    bot = result.scalars().first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found or you don't have permission")
        
    # Call RAG pipeline (Layer 4)
    bot_response = await process_rag_query(query.user_query, bot_id)
    
    # Save conversation
    new_conv = Conversation(
        bot_id=bot_id,
        user_query=query.user_query,
        bot_response=bot_response
    )
    db.add(new_conv)
    await db.commit()
    await db.refresh(new_conv)
    
    return new_conv

@router.get("/{bot_id}/history", response_model=List[ConversationResponse])
async def get_bot_history(bot_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify bot exists and user owns it
    result = await db.execute(select(Bot).where(Bot.id == bot_id, Bot.owner_id == current_user.id))
    bot = result.scalars().first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found or you don't have permission")

    result = await db.execute(select(Conversation).where(Conversation.bot_id == bot_id).order_by(Conversation.created_at.desc()))
    return result.scalars().all()
