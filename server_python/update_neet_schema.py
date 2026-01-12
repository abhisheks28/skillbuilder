
import asyncio
from app.core.database import get_db_pool

async def migrate():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        print("Adding topic column...")
        await conn.execute("ALTER TABLE neet_questions ADD COLUMN IF NOT EXISTS topic VARCHAR(255);")
        
        print("Adding question_type column...")
        await conn.execute("ALTER TABLE neet_questions ADD COLUMN IF NOT EXISTS question_type VARCHAR(50);")
        
        print("Migration complete.")

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(migrate())
