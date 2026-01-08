import asyncio
import asyncpg
from app.core.config import settings
import uuid

async def create_dummy_student():
    print(f"Connecting to database {settings.DB_NAME}...")
    try:
        conn = await asyncpg.connect(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME
        )
        
        # 1. Create User
        new_uid = str(uuid.uuid4())
        user_id = await conn.fetchval(
            "INSERT INTO users (name, role, firebase_uid) VALUES ($1, $2, $3) RETURNING user_id",
            "Test Student", "student", new_uid
        )
        print(f"Created User: {user_id}")
        
        # 2. Add to Students
        await conn.execute(
            "INSERT INTO students (user_id, grade, email_id, parent_name) VALUES ($1, $2, $3, $4)",
            user_id, "Grade 5", "test@student.com", "Test Student"
        )
        print("Created Student record.")
        
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_dummy_student())
