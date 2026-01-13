import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import db

def run_async(coro):
    return asyncio.run(coro)

def test_generate_assessment_mcq():
    async def _test():
        # Reset DB pool to ensure fresh connection for this loop
        db.pool = None
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                payload = {
                    "subject": "Biology",
                    "topics": ["Ecology"],
                    "total_questions": 5,
                    "distribution": [
                        {"type": "MCQ", "count": 2}
                    ]
                }
                print(f"\nSending Payload: {payload}")
                response = await ac.post("/api/neet/assessment/generate", json=payload)
                
                print(f"Response Status: {response.status_code}")
                data = response.json()
                print(f"Response Data Length: {len(data)}")
                
                assert response.status_code == 200
                assert len(data) > 0
                assert data[0]["questionType"] == "MCQ"
        except Exception as e:
            with open("test_error.log", "w") as f:
                import traceback
                f.write(traceback.format_exc())
            raise e
    
    run_async(_test())

def test_generate_assessment_statement():
    async def _test():
        # Reset DB pool
        db.pool = None
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                payload = {
                    "subject": "Biology",
                    "topics": ["Ecology"],
                    "total_questions": 5,
                    "distribution": [
                        {"type": "Statement", "count": 2}
                    ]
                }
                response = await ac.post("/api/neet/assessment/generate", json=payload)
                
                assert response.status_code == 200
                data = response.json()
                assert len(data) > 0
                assert data[0]["questionType"] == "STATEMENT_BASED"
        except Exception as e:
            with open("test_error_stmt.log", "w") as f:
                import traceback
                f.write(traceback.format_exc())
            raise e

    run_async(_test())
