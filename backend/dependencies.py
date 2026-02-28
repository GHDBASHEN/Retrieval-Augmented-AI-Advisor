from fastapi import Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from starlette.status import HTTP_403_FORBIDDEN

from database import get_db
from models import User

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_current_user(api_key_header: str = Security(api_key_header), db: AsyncSession = Depends(get_db)):
    if api_key_header is None:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, detail="Could not validate credentials - API Key missing"
        )
    
    result = await db.execute(select(User).where(User.api_key == api_key_header))
    user = result.scalars().first()
    
    if user is None:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, detail="Could not validate credentials - Invalid API Key"
        )
        
    return user
