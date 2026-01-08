import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()
from app.core.config import settings

async def init_db():
    print("Initializing Database...")
    print(f"Connecting to {settings.DB_NAME} at {settings.DB_HOST} as {settings.DB_USER}")
    
    try:
        conn = await asyncpg.connect(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
        )
        
        # Read schema file
        schema_path = os.path.join(os.path.dirname(__file__), "app", "db", "schema.sql")
        # Adjust path if running from root
        if not os.path.exists(schema_path):
             schema_path = os.path.join(os.path.dirname(__file__), "..", "app", "db", "schema.sql")

        print(f"Reading schema from: {schema_path}")
        with open(schema_path, "r") as f:
            schema_sql = f.read()

        print("Executing schema...")
        await conn.execute(schema_sql)
        print("Schema executed successfully.")
        
        await conn.close()
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    asyncio.run(init_db())
