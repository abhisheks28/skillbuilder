
import asyncio
import asyncpg
from app.core.config import settings

async def test_query():
    print(f"Connecting to database {settings.DB_NAME}...")
    try:
        conn = await asyncpg.connect(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME
        )
        
        student_ids = [3]  # ID from debug output
        print(f"Testing with student_ids: {student_ids}")
        
        query = """
                SELECT DISTINCT ON (student_id, report_type) 
                    student_id, report_json, created_at, 
                    COALESCE(report_json->>'type', 'standard') as report_type
                FROM reports
                WHERE student_id = ANY($1::int[])
                ORDER BY student_id, report_type, created_at DESC
            """
        
        print("Executing Query...")
        reports = await conn.fetch(query, student_ids)
        print("Success!")
        for r in reports:
            print(dict(r))

        await conn.close()
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_query())
