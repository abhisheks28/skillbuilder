import asyncio
from app.core.database import get_db_pool

async def main():
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch('SELECT DISTINCT question_type FROM neet_questions')
            print("Distinct Question Types:", [r['question_type'] for r in rows])
            
            # Also check counts for each type
            rows_counts = await conn.fetch('SELECT question_type, COUNT(*) as c FROM neet_questions GROUP BY question_type')
            print("Counts per Type:", [(r['question_type'], r['c']) for r in rows_counts])
            
        await pool.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
