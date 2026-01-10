from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Day Progress Models ---

class DayProgressCreate(BaseModel):
    """Model for marking a day's assessment as completed"""
    report_id: int
    day_number: int
    category: str
    questions_attempted: int
    correct_answers: int
    time_taken_seconds: int


class DayProgressResponse(BaseModel):
    """Response model for day progress status"""
    id: int
    user_id: int
    report_id: int
    day_number: int
    category: str
    assessment_completed: bool
    practice_count: int
    total_practice_questions: int
    total_practice_correct: int
    total_practice_time_seconds: int
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DayUnlockStatus(BaseModel):
    """Model for checking if a day is unlocked"""
    day_number: int
    category: str
    is_unlocked: bool
    assessment_completed: bool
    practice_count: int


class AllDaysProgressResponse(BaseModel):
    """Response with all days' unlock status for a report"""
    report_id: int
    days: List[DayUnlockStatus]


# --- Practice Session Models ---

class PracticeSessionCreate(BaseModel):
    """Model for logging a practice session"""
    report_id: int
    day_number: int
    category: str
    questions_attempted: int
    correct_answers: int
    time_taken_seconds: int


class PracticeSessionResponse(BaseModel):
    """Response model for practice session"""
    id: int
    user_id: int
    report_id: int
    day_number: int
    category: str
    questions_attempted: int
    correct_answers: int
    time_taken_seconds: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Analytics Models ---

class DayAnalytics(BaseModel):
    """Analytics for a specific day"""
    day_number: int
    category: str
    total_practice_sessions: int
    total_practice_questions: int
    total_practice_correct: int
    practice_accuracy_percent: float
    assessment_completed: bool
    assessment_questions: int
    assessment_correct: int
    assessment_accuracy_percent: float
    total_time_spent_seconds: int


class UserSkillAnalytics(BaseModel):
    """Overall skill practice analytics for a user"""
    user_id: int
    report_id: int
    total_days: int
    days_completed: int
    overall_practice_sessions: int
    overall_practice_accuracy: float
    overall_assessment_accuracy: float
    total_time_spent_seconds: int
    days_analytics: List[DayAnalytics]
