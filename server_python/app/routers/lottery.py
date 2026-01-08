from fastapi import APIRouter, HTTPException, Body
from app.core.database import get_db_pool
from typing import Dict, Any
import json

router = APIRouter()

@router.post("/register")
async def register_lottery(payload: Dict[str, Any] = Body(...)):
    """
    Registers a user for the lottery.
    Payload expected to match the Firebase payload structure for compatibility:
    {
        "uid": "PG_UID", (or we look up by some other ID)
        "ticketCode": "...",
        "userType": "...",
        ... other fields stored in 'data'
    }
    """
    uid = payload.get("uid")
    ticket_code = payload.get("ticketCode")
    user_type = payload.get("userType")
    
    if not uid or not ticket_code:
        raise HTTPException(status_code=400, detail="Missing required fields")

    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Get User ID from Firebase UID (which we link to PG)
        # Note: The frontend sends 'uid' which might be the Firebase UID or the new PG-based ID depending on what registerAuth returns.
        # In the new system, `registerAuth` returns `user.uid` which is the `firebase_uid` column in users table.
        
        user_id = await conn.fetchval("SELECT user_id FROM users WHERE firebase_uid = $1", uid)
        
        if not user_id:
             # Fallback: If for some reason the user isn't found (maybe async delay?), we might error.
             # Or arguably, for Lottery which might be open to public guests, do we enforce 'users' table FK?
             # Yes, 'registerAuth' was called first.
             raise HTTPException(status_code=404, detail="User not found for lottery registration")
             
        # Insert into lottery_registrations - serialize payload to JSON string for 'data' column
        data_json = json.dumps(payload)
        await conn.execute("""
            INSERT INTO lottery_registrations (user_id, ticket_code, user_type, data)
            VALUES ($1, $2, $3, $4)
        """, user_id, ticket_code, user_type, data_json)
        
    return {"success": True, "message": "Lottery registration saved"}
