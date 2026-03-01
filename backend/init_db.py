import asyncio
import time
from database import engine, Base
from models import User, Bot, Conversation
from sqlalchemy.exc import OperationalError

async def init_db():
    retries = 5
    while retries > 0:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("Database initialized successfully!")
            return
        except (OperationalError, ConnectionRefusedError) as e:
            retries -= 1
            print(f"Database not ready... manual retry in 5s ({retries} retries left)")
            await asyncio.sleep(5)
    
    raise Exception("Could not connect to the database after multiple retries.")

if __name__ == "__main__":
    asyncio.run(init_db())