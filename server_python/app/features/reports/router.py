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
        
        if not user_id:
            # Check if uid is numeric and treat as user_id directly
            # Only if length is small enough to be an ID, preventing confusion with phone numbers and DB Integer overflows
            if uid and uid.isdigit() and len(uid) < 10:
                 user_id = await conn.fetchval("SELECT user_id FROM users WHERE user_id = $1", int(uid))

            phone_to_search = phone or uid
            if not user_id and phone_to_search:
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
        # Logic update: If childId is provided, current user_id might be the child's ID (if they have one).
        # But reports might be stored under Parent's ID.
        # So we need to:
        # 1. Fetch Parent ID for this student (using childId/student_id).
        # 2. Search in reports where:
        #    (user_id = student_user_id) OR
        #    (user_id = parent_user_id AND report_json->>'childId' = childId)
        
        target_user_ids = [user_id]
        parent_user_id = None
        
        if childId:
            try:
                # childId passed from frontend is the student_id string
                sid = int(childId)
                # Find parent's user_id
                parent_info = await conn.fetchrow("""
                    SELECT p.user_id 
                    FROM students s
                    JOIN parents p ON s.parent_id = p.parent_id
                    WHERE s.student_id = $1
                """, sid)
                
                if parent_info and parent_info['user_id']:
                    parent_user_id = parent_info['user_id']
                    target_user_ids.append(parent_user_id)
            except ValueError:
                pass # childId not an int?

        if childId:
            # We want reports for this child specifically.
            # Either direct on their ID, or on parent's ID tagged with their childId.
            # Also need to handle string/int types for JSON matching if needed, but usually string in JSON.
            # Enforce filtering by childId in the JSON for both potential owners
            query = """
                SELECT * FROM reports 
                WHERE (user_id = $1 OR user_id = $2)
                AND report_json->>'childId' = $3
            """
            # Validating if $2 (parent_user_id) is None is handled by Postgres (false) or Python logic
            # usage of OR with None is safe in SQL: (col = NULL) is null (falsy)
            rows = await conn.fetch(query, user_id, parent_user_id, childId)
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
