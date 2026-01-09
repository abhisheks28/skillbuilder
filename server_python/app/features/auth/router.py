from fastapi import APIRouter, HTTPException, Depends, Body, Response
from app.core.database import get_db_pool
from app.core.security import verify_password, get_password_hash, create_access_token
from typing import Dict, Any
import uuid

router = APIRouter()


from app.models.schemas import UserRegisterRequest, LoginRequest, AdminLoginRequest

@router.post("/register")
async def register(request: UserRegisterRequest):
    pool = await get_db_pool()
    
    # Basic data
    email = request.email
    password = request.password
    name = request.name
    role = request.role.lower()
    phone = request.phone
    
    if not password or not name:
         raise HTTPException(status_code=400, detail="Missing name or password")

    # Generate Custom User ID (The "Ticket")
    # Format: First letter of Role + 6 random digits (e.g., S102938)
    # Simple collision check could be added, but low prob for now.
    import random
    import string
    
    def generate_id(role_name):
        prefix = role_name[0].upper()
        digits = ''.join(random.choices(string.digits, k=6))
        return f"{prefix}{digits}"

    custom_id = generate_id(role)

    async with pool.acquire() as conn:
        async with conn.transaction():
            # Create User
            new_uid = str(uuid.uuid4())
            user_id = await conn.fetchval(
                "INSERT INTO users (name, role, firebase_uid) VALUES ($1, $2, $3) RETURNING user_id",
                name, role, new_uid
            )

            # Create Credentials with Custom ID as Username
            pwd_hash = get_password_hash(password)
            await conn.execute(
                "INSERT INTO credentials (user_id, username, password_hash, oauth_provider) VALUES ($1, $2, $3, 'custom')",
                user_id, custom_id, pwd_hash
            )

            # Role Specific Data
            if role == 'student':
                grade = request.grade
                await conn.execute(
                    "INSERT INTO students (user_id, grade, email_id, phone_number, parent_name) VALUES ($1, $2, $3, $4, $5)",
                    user_id, grade, email, phone, request.parent_name or name
                )
            elif role == 'teacher':
                await conn.execute(
                    "INSERT INTO teachers (user_id, email_id, phone_number, subject) VALUES ($1, $2, $3, $4)",
                    user_id, email, phone, request.subject
                )
            elif role == 'parent':
                parent_id = await conn.fetchval(
                    "INSERT INTO parents (user_id, email_id, phone_number) VALUES ($1, $2, $3) RETURNING parent_id",
                    user_id, email, phone
                )
                children = request.children or []
                if children:
                    for child in children:
                        child_name = child.get('name')
                        child_grade = child.get('grade')
                        if child_name and child_grade:
                             await conn.execute(
                                 "INSERT INTO students (parent_id, name, grade, parent_name) VALUES ($1, $2, $3, $4)",
                                 parent_id, child_name, child_grade, name
                             )
            elif role == 'guest':
                 await conn.execute(
                    "INSERT INTO guests (user_id, email_id, phone_number) VALUES ($1, $2, $3)",
                    user_id, email, phone
                )

            # Generate Token
            access_token = create_access_token(subject=new_uid)
            
            return {
                "success": True, 
                "token": access_token, 
                "user": {
                    "uid": new_uid,
                    "name": name,
                    "email": email,
                    "role": role,
                    "user_id": user_id,
                    "username": custom_id # Return the Ticket ID
                }
            }

@router.post("/login")
async def login(request: LoginRequest):
    pool = await get_db_pool()
    email = request.email
    password = request.password

    if not email or not password:
        raise HTTPException(status_code=400, detail="Missing email or password")

    async with pool.acquire() as conn:
        # Fetch Credential
        cred_row = await conn.fetchrow(
            """SELECT c.user_id, c.password_hash, u.firebase_uid, u.role, u.name 
               FROM credentials c 
               JOIN users u ON c.user_id = u.user_id 
               WHERE c.username = $1""", 
            email
        )
        
        if not cred_row:
             raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not verify_password(password, cred_row['password_hash']):
             raise HTTPException(status_code=401, detail="Invalid credentials")

        # Generate Token
        access_token = create_access_token(subject=cred_row['firebase_uid'])
        
        return {
            "success": True, 
            "token": access_token, 
            "user": {
                "uid": cred_row['firebase_uid'],
                "name": cred_row['name'],
                "email": email,
                "role": cred_row['role'],
                "user_id": cred_row['user_id']
            }
        }

from app.core.config import settings

@router.post("/admin-login")
async def admin_login(request: AdminLoginRequest, response: Response = None):
    # Use credentials from settings (defaults: admin/admin123)
    username = request.username
    password = request.password
    
    if username == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD: 
        if response:
             response.set_cookie(key="admin_session", value="true")
        return {"success": True, "message": "Logged in"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="admin_session")
    return {"success": True, "message": "Logged out"}
