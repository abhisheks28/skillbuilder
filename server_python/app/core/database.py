from app.core.config import settings
import asyncpg
from typing import Optional

class Database:
    pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        if not self.pool:
            try:
                print("Connecting to PostgreSQL...")
                self.pool = await asyncpg.create_pool(
                    user=settings.DB_USER,
                    password=settings.DB_PASSWORD,
                    host=settings.DB_HOST,
                    port=settings.DB_PORT,
                    database=settings.DB_NAME,
                )
                print("Connected to PostgreSQL.")
            except Exception as e:
                print(f"Failed to connect to PostgreSQL: {e}")
                # We might want to raise here or handle gracefully depending on requirement
                # raising for now as DB is core to new schema
                raise e

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            print("Disconnected from PostgreSQL.")

db = Database()

async def get_db_pool() -> asyncpg.Pool:
    if not db.pool:
        await db.connect()
    return db.pool
