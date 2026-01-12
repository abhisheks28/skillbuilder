
import asyncio
import os
import sys

# Add parent dir to path to allow importing app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import db

async def create_table():
    print("Connecting to DB...")
    await db.connect()
    
    query = """
    CREATE TABLE IF NOT EXISTS neet_tests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(50) NOT NULL,
        questions JSONB NOT NULL,
        password VARCHAR(50),
        duration INTEGER NOT NULL,
        total_marks INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(user_id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    print("Creating neet_tests table...")
    async with db.pool.acquire() as conn:
        await conn.execute(query)
    print("Table created successfully!")
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(create_table())
