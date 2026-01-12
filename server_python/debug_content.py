import asyncio
import json
from app.core.database import get_db_pool

async def main():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT question_content FROM neet_questions WHERE question_type = 'STATEMENT_BASED' LIMIT 1")
        if row:
            print("STATEMENT KEYS:", json.loads(row['question_content']).keys())
        else:
            print("No STATEMENT_BASED questions found.")

        # Check Assertion as well
        row = await conn.fetchrow("SELECT question_content FROM neet_questions WHERE question_type = 'ASSERTION_REASON' LIMIT 1")
        if row:
            print("ASSERTION KEYS:", json.loads(row['question_content']).keys())

    await pool.close()

if __name__ == "__main__":
    asyncio.run(main())
