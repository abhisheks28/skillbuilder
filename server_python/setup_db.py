import asyncio
import asyncpg
import os
from app.core.config import settings

async def setup_database():
    print(f"Connecting to database {settings.DB_NAME} at {settings.DB_HOST}...")
    
    try:
        # Connect to the database
        conn = await asyncpg.connect(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME
        )
        print("Connected successfully.")

        # Read SQL files
        base_dir = os.path.dirname(os.path.abspath(__file__))
        schema_path = os.path.join(base_dir, "app", "db", "schema.sql")
        missing_tables_path = os.path.join(base_dir, "app", "db", "missing_tables.sql")

        with open(schema_path, "r") as f:
            schema_sql = f.read()
        
        with open(missing_tables_path, "r") as f:
            missing_tables_sql = f.read()

        # Execute Schema
        print("Applying base schema...")
        await conn.execute(schema_sql)
        print("Base schema applied.")

        # Execute Missing Tables
        print("Applying missing tables...")
        await conn.execute(missing_tables_sql)
        print("Missing tables applied.")

        await conn.close()
        print("Database setup complete.")

    except Exception as e:
        print(f"Error setting up database: {e}")

if __name__ == "__main__":
    asyncio.run(setup_database())
