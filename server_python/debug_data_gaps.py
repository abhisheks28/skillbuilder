
import asyncio
import asyncpg
from app.core.config import settings
import json

async def debug_gaps():
    print(f"Connecting to database {settings.DB_NAME}...")
    try:
        conn = await asyncpg.connect(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME
        )
        
        # 1. Check Table Columns
        print("\n--- Student Table Columns ---")
        cols = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'students'")
        print([c['column_name'] for c in cols])
        
        print("\n--- Users Table Columns ---")
        cols = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
        print([c['column_name'] for c in cols])
        
        print("\n--- Target User Data ---")
        # Get user_id for 30aa911a...
        user = await conn.fetchrow("SELECT user_id, name, firebase_uid FROM users WHERE firebase_uid LIKE '30aa911a%'")
        if user:
            print(f"User: {dict(user)}")
            user_id = user['user_id']
            
            # Get Student Data
            student = await conn.fetchrow("SELECT * FROM students WHERE user_id = $1", user_id)
            print(f"Student Row: {dict(student) if student else 'None'}")
            
            # Get Reports
            print(f"\n--- Reports for User {user_id} ---")
            reports = await conn.fetch("SELECT report_json, created_at FROM reports WHERE user_id = $1", user_id)
            print(f"Found {len(reports)} reports.")
            for r in reports:
                data = json.loads(r['report_json'])
                summary = data.get('summary', {})
                print(f"Type: {data.get('type')}")
                print(f"Summary: {summary}")
        else:
            print("User with UID 30aa911a... not found.")

        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_gaps())
