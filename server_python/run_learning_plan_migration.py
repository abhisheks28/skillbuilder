import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()
from app.core.config import settings

async def run_migration():
    print("Running Learning Plan Migration...")
    
    try:
        conn = await asyncpg.connect(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
        )
        
        # Read schema file
        # Using relative path assuming script is run from server_python root
        schema_path = os.path.join(os.path.dirname(__file__), "scripts", "init_learning_plan.sql")
        
        print(f"Reading SQL from: {schema_path}")
        with open(schema_path, "r") as f:
            sql = f.read()

        print("Executing SQL...")
        await conn.execute(sql)
        print("Migration executed successfully.")
        
        await conn.close()
    except Exception as e:
        print(f"Error running migration: {e}")

if __name__ == "__main__":
    asyncio.run(run_migration())
