from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    name: str
    role: str
    firebase_uid: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    user_id: int
    created_at: datetime

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
