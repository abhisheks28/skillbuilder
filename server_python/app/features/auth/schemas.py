from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

class UserRegisterRequest(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    password: str
    role: str = "student"
    grade: Optional[str] = None
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    subject: Optional[str] = None
    children: Optional[List[Dict[str, Any]]] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class GoogleLoginRequest(BaseModel):
    uid: str
    email: EmailStr
    name: str
    photoURL: Optional[str] = None
