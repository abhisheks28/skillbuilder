from fastapi import APIRouter, HTTPException, Query, Body
from app.core.database import get_db_pool
from typing import Optional, Dict, Any
import json
from datetime import datetime

router = APIRouter()

@router.get("/daily")
async def get_daily_puzzle(uid: str, grade: Optional[int] = None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Get User ID
        user_row = await conn.fetchrow("SELECT user_id, role FROM users WHERE firebase_uid = $1", uid)
        if not user_row:
             # Basic create if guest/unknown
             user_id = await conn.fetchval(
                "INSERT INTO users (name, role, firebase_uid) VALUES ($1, $2, $3) RETURNING user_id",
                "Unknown", "guest", uid
             )
        else:
            user_id = user_row['user_id']
            
        # Check if already completed today
        today = datetime.now().strftime('%Y-%m-%d')
        completed = await conn.fetchrow("""
            SELECT * FROM puzzle_completions 
            WHERE user_id = $1 AND DATE(completed_at) = CURRENT_DATE
        """, user_id)
        
        if completed:
             return {"completed": True, "puzzle": None, "message": "Come back tomorrow!"}
             
        # Fetch available puzzle
        # Logic: Random puzzle for grade NOT in completions
        if not grade: grade = 5 # Default
        
        # Simple random fetch
        # Note: In production, exclude completed IDs.
        # "SELECT * FROM puzzles WHERE grade = $1 AND puzzle_id NOT IN (SELECT puzzle_id FROM puzzle_completions WHERE user_id = $1) ORDER BY RANDOM() LIMIT 1"
        
        puzzle = await conn.fetchrow("""
            SELECT * FROM puzzles 
            WHERE grade = $1 
            AND puzzle_id NOT IN (SELECT puzzle_id FROM puzzle_completions WHERE user_id = $2)
            ORDER BY random() 
            LIMIT 1
        """, grade, user_id)
        
        if not puzzle:
             # Try grabbing ANY puzzle if grade specific not found?
             # Or return null
             return {"completed": False, "puzzle": None, "message": "No puzzles available for this grade."}
             
        # Parse content if string
        content = puzzle['content']
        if isinstance(content, str):
            content = json.loads(content)
            
        return {
            "completed": False, 
            "puzzle": {
                "id": puzzle['puzzle_id'],
                "grade": puzzle['grade'],
                **content
            }
        }

@router.post("/complete")
async def complete_puzzle(uid: str = Body(...), puzzleId: int = Body(...), correct: bool = Body(True)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        user_id = await conn.fetchval("SELECT user_id FROM users WHERE firebase_uid = $1", uid)
        if not user_id:
             raise HTTPException(status_code=404, detail="User not found")
             
        await conn.execute("""
            INSERT INTO puzzle_completions (user_id, puzzle_id, is_correct, completed_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        """, user_id, puzzleId, correct)
        
    return {"success": True}

@router.post("/seed")
async def seed_puzzles():
    # Helper to add dummy puzzles
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM puzzles")
        if count == 0:
            dummies = [
                (5, json.dumps({"question": "What is 5 + 7?", "options": ["10", "11", "12", "13"], "answer": "12"})),
                (5, json.dumps({"question": "What is 10 x 10?", "options": ["100", "1000", "10", "20"], "answer": "100"})),
                (6, json.dumps({"question": "Solve for x: 2x = 10", "options": ["2", "5", "8", "10"], "answer": "5"}))
            ]
            await conn.executemany("INSERT INTO puzzles (grade, content) VALUES ($1, $2)", dummies)
            return {"message": "Seeded 3 puzzles"}
    return {"message": "Already seeded"}
