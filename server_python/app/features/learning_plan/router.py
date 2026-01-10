from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db_pool
import datetime

router = APIRouter()

class ProgressItem(BaseModel):
    child_id: str
    day_number: int
    category: str
    status: str
    score: Optional[int] = None

class ProgressUpdate(BaseModel):
    uid: str
    child_id: str
    day_number: int
    category: str
    score: int
    status: str # 'completed', 'unlocked'

@router.get("/progress/{child_id}")
async def get_progress(child_id: str, uid: str):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT day_number, category, status, assessment_score FROM learning_plan_progress WHERE child_id = $1 AND user_id = $2",
            child_id, uid
        )
        return {
            "success": True, 
            "data": [
                {
                    "day_number": r["day_number"], 
                    "category": r["category"], 
                    "status": r["status"],
                    "score": r["assessment_score"]
                } 
                for r in rows
            ]
        }

@router.post("/complete")
async def update_progress(update: ProgressUpdate):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Check if already exists
        row = await conn.fetchrow(
            "SELECT id FROM learning_plan_progress WHERE child_id = $1 AND user_id = $2 AND day_number = $3 AND category = $4",
            update.child_id, update.uid, update.day_number, update.category
        )
        
        if row:
            # Update existing
            await conn.execute(
                """
                UPDATE learning_plan_progress 
                SET status = $1, assessment_score = $2, updated_at = NOW() 
                WHERE id = $3
                """,
                update.status, update.score, row['id']
            )
        else:
            # Insert new
            await conn.execute(
                """
                INSERT INTO learning_plan_progress (user_id, child_id, day_number, category, status, assessment_score, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                """,
                update.uid, update.child_id, update.day_number, update.category, update.status, update.score
            )
            
    return {"success": True}
