from fastapi import APIRouter, HTTPException, Body, Depends
from app.core.database import get_db_pool
from typing import List, Dict, Any, Optional

router = APIRouter()

@router.get("/{subject}")
async def get_questions(subject: str):
    """
    Fetch all questions for a subject.
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, question_content, created_at, uploaded_by 
            FROM neet_questions 
            WHERE subject = $1 
            ORDER BY created_at DESC
        """, subject)
        
        results = []
        for r in rows:
            # Flatten structure to match frontend expectation if possible, or keep as is.
            # Frontend expects an array where each item has { id, ...properties }
            content = r['question_content']
            if isinstance(content, dict):
                results.append({
                    "id": str(r['id']),
                    **content,
                    "createdAt": r['created_at'].isoformat()
                })
        return results

@router.post("/{subject}")
async def save_questions(subject: str, questions: List[Dict[str, Any]] = Body(...), teacherUid: Optional[str] = Body(None, embed=True)):
    """
    Save list of questions.
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Resolve teacher ID
        user_id = None
        if teacherUid:
            user_id = await conn.fetchval("SELECT user_id FROM users WHERE firebase_uid = $1", teacherUid)

        # Batch insert
        # We process manually to store JSONB
        for q in questions:
            # Clean question object if needed, or store entire thing
            await conn.execute("""
                INSERT INTO neet_questions (subject, question_content, uploaded_by)
                VALUES ($1, $2, $3)
            """, subject, q, user_id)
            
    return {"success": True}

@router.delete("/{subject}/{question_id}")
async def delete_question(subject: str, question_id: int):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM neet_questions WHERE id = $1 AND subject = $2", question_id, subject)
    return {"success": True}

@router.delete("/{subject}")
async def clear_questions(subject: str):
    """
    Clear all questions for a subject.
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM neet_questions WHERE subject = $1", subject)
    return {"success": True}
