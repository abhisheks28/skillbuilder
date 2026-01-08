from fastapi import APIRouter, HTTPException, Query, Body
from app.core.database import get_db_pool
from typing import Optional, Dict, Any
import json

router = APIRouter()

@router.get("/")
async def get_reports(uid: Optional[str] = None, childId: Optional[str] = None, phone: Optional[str] = None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        if not uid and not phone:
             # Logic for Admin view (all reports)
             rows = await conn.fetch("SELECT * FROM reports")
             return {"success": True, "data": [dict(row) for row in rows]}
        
        user_id = None
        
        # Try lookup by firebase_uid first
        if uid:
            user_id = await conn.fetchval("SELECT user_id FROM users WHERE firebase_uid = $1", uid)
        
        # If no user found and phone provided (or uid looks like a phone number), try phone lookup
        if not user_id:
            phone_to_search = phone or uid
            if phone_to_search:
                # Normalize phone - keep last 10 digits
                normalized_phone = ''.join(filter(str.isdigit, phone_to_search))[-10:]
                # Search in students table for phone_number
                user_id = await conn.fetchval(
                    """SELECT s.user_id FROM students s 
                       WHERE s.phone_number LIKE $1 OR s.phone_number LIKE $2""",
                    f"%{normalized_phone}", f"%{normalized_phone}%"
                )
                # Also try parents table
                if not user_id:
                    user_id = await conn.fetchval(
                        """SELECT p.user_id FROM parents p 
                           WHERE p.phone_number LIKE $1 OR p.phone_number LIKE $2""",
                        f"%{normalized_phone}", f"%{normalized_phone}%"
                    )
        
        if not user_id:
             return {"success": True, "data": []}

        # Filter by User and optionally childId in JSON
        if childId:
            query = "SELECT * FROM reports WHERE user_id = $1 AND report_json->>'childId' = $2"
            rows = await conn.fetch(query, user_id, childId)
        else:
            query = "SELECT * FROM reports WHERE user_id = $1"
            rows = await conn.fetch(query, user_id)
            
        return {"success": True, "data": [dict(row) for row in rows]}

@router.get("/{report_id}")
async def get_report_by_id(report_id: int):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM reports WHERE report_id = $1", report_id)
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"success": True, "data": dict(row)}

@router.post("/")
async def save_report(
    uid: str = Body(...), 
    reportData: Dict[str, Any] = Body(...),
    childId: Optional[str] = Body(None),
    category: Optional[str] = Body("General") 
):
    if not uid or not reportData:
        raise HTTPException(status_code=400, detail="Missing required fields")
        
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Get User ID
        user_id = await conn.fetchval("SELECT user_id FROM users WHERE firebase_uid = $1", uid)
        
        # If user doesn't exist (maybe first time saving report?), create user?
        # Or fail? Logic in Node implies simple push.
        # Let's create if missing for robustness, similar to Auth.
        if not user_id:
             # Basic create
             user_id = await conn.fetchval(
                "INSERT INTO users (name, role, firebase_uid) VALUES ($1, $2, $3) RETURNING user_id",
                "Unknown", "student", uid
             )
        
        # Add childId to reportData if not present, to ensure queryability
        if childId:
            reportData['childId'] = childId
            
        # Insert Report
        report_json_str = json.dumps(reportData)
        report_id = await conn.fetchval(
            "INSERT INTO reports (user_id, category, report_json) VALUES ($1, $2, $3) RETURNING report_id",
            user_id, category, report_json_str
        )
        
        return {"success": True, "reportId": report_id}
