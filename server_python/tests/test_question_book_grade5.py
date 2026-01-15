import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

def run_async(coro):
    import asyncio
    return asyncio.run(coro)

def test_get_all_grade5_questions():
    async def _test():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/question-book/grade5/all")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, dict)
            assert "q1" in data
            assert len(data["q1"]) == 1
            assert "q25" in data
            
    run_async(_test())

def test_get_grade5_questions_by_topic():
    async def _test():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/question-book/grade5/topic?topic=q1&count=5")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) == 5
            assert data[0]["topic"] == "Large Numbers / Place Value"

            # Test invalid topic
            response_err = await ac.get("/api/question-book/grade5/topic?topic=invalid&count=5")
            assert "error" in response_err.json()
            
    run_async(_test())
