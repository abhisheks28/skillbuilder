import asyncio
import json
from app.core.database import get_db_pool

async def main():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT DISTINCT question_type FROM neet_questions")
        types = [r['question_type'] for r in rows]
        
        for t in types:
            print(f"--- TYPE: {t} ---")
            row = await conn.fetchrow("SELECT question_content FROM neet_questions WHERE question_type = $1 LIMIT 1", t)
            if row:
                try:
                    data = json.loads(row['question_content'])
                    print("KEYS:", list(data.keys()))
                except Exception as e:
                    print("JSON Parse Error:", e)
            else:
                print("No samples found.")

    await pool.close()

if __name__ == "__main__":
    asyncio.run(main())
