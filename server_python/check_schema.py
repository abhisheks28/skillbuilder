import asyncio
import asyncpg
from app.core.config import settings

async def check_schema():
    print(f"Connecting to database {settings.DB_NAME}...")
    try:
        conn = await asyncpg.connect(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME
        )
        
        print("\n--- Reports Table Columns ---")
        columns = await conn.fetch("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'reports'
        """)
        for c in columns:
            print(f"{c['column_name']} ({c['data_type']})")

        print("\n--- First Report Row ---")
        row = await conn.fetchrow("SELECT * FROM reports LIMIT 1")
        if row:
            print(dict(row))
        else:
            print("No reports found.")

        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_schema())
