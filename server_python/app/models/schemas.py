from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Base Models ---
class UserBase(BaseModel):
    name: str
    role: str
    firebase_uid: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    user_id: int
    created_at: datetime

# --- Role Specific Input Models ---

class StudentCreate(BaseModel):
    grade: str
    school: str
    parent_id: Optional[int] = None
    mentor_id: Optional[int] = None
    phone_number: Optional[str] = None
    email_id: Optional[EmailStr] = None

class TeacherCreate(BaseModel):
    school: str
    subject: str
    phone_number: Optional[str] = None
    email_id: Optional[EmailStr] = None

class ParentCreate(BaseModel):
    phone_number: Optional[str] = None
    email_id: Optional[EmailStr] = None
    profession: Optional[str] = None
    spouse_name: Optional[str] = None
    student_ids: Optional[List[int]] = []

class GuestCreate(BaseModel):
    phone_number: Optional[str] = None
    email_id: Optional[EmailStr] = None
    profession: Optional[str] = None

# --- Report Models ---
class ReportCreate(BaseModel):
    category: str
    report_json: Dict[str, Any]


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
