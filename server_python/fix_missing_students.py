import asyncio
import asyncpg
from app.core.config import settings

async def fix_missing_students():
    print(f"Connecting to database {settings.DB_NAME}...")
    try:
        conn = await asyncpg.connect(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME
        )
        
        # 1. Fetch all users with role 'student'
        students_users = await conn.fetch("SELECT user_id, name, email_id, firebase_uid, created_at FROM users WHERE role = 'student'")
        print(f"Found {len(students_users)} users with role 'student'.")

        fixed_count = 0
        
        for u in students_users:
            uid = u['user_id']
            # 2. Check if exists in students table
            exists = await conn.fetchval("SELECT 1 FROM students WHERE user_id = $1", uid)
            if not exists:
                print(f"Fixing missing student record for User ID {uid} ({u['name']})...")
                # Insert with minimal details
                # Note: 'parent_name' is required by some queries? schema says varchar, nullable?
                # schema.sql: parent_name VARCHAR(255)
                
                # Try to get email/phone from somewhere? u['email_id'] doesn't exist in users table query - wait I removed it from debug_db because it failed.
                # But typically 'student' role implies they registered as student.
                
                # I need to fetch extra info if available, or insert nulls.
                # schema: user_id, grade, school, parent_id, parent_name, phone_number, email_id, mentor_id
                
                # Fetch credentials for username as email?
                cred = await conn.fetchrow("SELECT username FROM credentials WHERE user_id = $1", uid)
                email = cred['username'] if cred else None
                
                await conn.execute("""
                    INSERT INTO students (user_id, parent_name, email_id, grade, school)
                    VALUES ($1, $2, $3, 'N/A', 'Unknown')
                """, uid, u['name'], email)
                
                fixed_count += 1
        
        print(f"Successfully fixed {fixed_count} student records.")
        
        # Also check for Teachers/Parents if needed, but priority is Students
        
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_missing_students())
