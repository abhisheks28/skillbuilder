import asyncio
import json
from app.core.database import get_db_pool

async def main():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT question_content FROM neet_questions WHERE question_type = 'STATEMENT_BASED' LIMIT 1")
        if row:
            with open("statement_dump.txt", "w", encoding="utf-8") as f:
                f.write(row['question_content'])
            print("Dumped statement_dump.txt")
        else:
            print("No STATEMENT_BASED found")

    await pool.close()

if __name__ == "__main__":
    asyncio.run(main())
