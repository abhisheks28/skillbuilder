from fastapi import APIRouter, HTTPException, Body, Depends
from app.core.database import get_db_pool
from typing import Optional, List
from .schemas import (
    DayProgressCreate, 
    DayProgressResponse, 
    DayUnlockStatus,
    AllDaysProgressResponse,
    PracticeSessionCreate,
    PracticeSessionResponse,
    DayAnalytics,
    UserSkillAnalytics
)
import json
from datetime import datetime

router = APIRouter()


# ============== HELPER FUNCTIONS ==============

async def get_user_id_from_uid(conn, uid: str) -> Optional[int]:
    """Get user_id from firebase_uid"""
    user_id = await conn.fetchval(
        "SELECT user_id FROM users WHERE firebase_uid = $1", uid
    )
    return user_id


async def ensure_tables_exist(conn):
    """Create tables if they don't exist"""
    # Day progress table - tracks assessment completion and aggregated practice stats
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS skill_practice_progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(user_id),
            report_id INTEGER NOT NULL,
            day_number INTEGER NOT NULL,
            category VARCHAR(255) NOT NULL,
            assessment_completed BOOLEAN DEFAULT FALSE,
            assessment_questions INTEGER DEFAULT 0,
            assessment_correct INTEGER DEFAULT 0,
            assessment_time_seconds INTEGER DEFAULT 0,
            practice_count INTEGER DEFAULT 0,
            total_practice_questions INTEGER DEFAULT 0,
            total_practice_correct INTEGER DEFAULT 0,
            total_practice_time_seconds INTEGER DEFAULT 0,
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, report_id, day_number)
        )
    """)
    
    # Practice sessions table - individual practice session logs for analytics
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS skill_practice_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(user_id),
            report_id INTEGER NOT NULL,
            day_number INTEGER NOT NULL,
            category VARCHAR(255) NOT NULL,
            session_type VARCHAR(20) NOT NULL DEFAULT 'practice',
            questions_attempted INTEGER NOT NULL,
            correct_answers INTEGER NOT NULL,
            time_taken_seconds INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create indices for performance
    await conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_skill_progress_user 
        ON skill_practice_progress(user_id)
    """)
    await conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_skill_progress_report 
        ON skill_practice_progress(report_id)
    """)
    await conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_skill_sessions_user 
        ON skill_practice_sessions(user_id)
    """)
    await conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_skill_sessions_report 
        ON skill_practice_sessions(report_id)
    """)


# ============== DAY PROGRESS ENDPOINTS ==============

@router.get("/progress/{report_id}")
async def get_all_days_progress(
    report_id: int,
    uid: str
) -> AllDaysProgressResponse:
    """Get unlock status for all days in a report"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await ensure_tables_exist(conn)
        
        user_id = await get_user_id_from_uid(conn, uid)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all progress records for this report
        rows = await conn.fetch("""
            SELECT day_number, category, assessment_completed, practice_count
            FROM skill_practice_progress
            WHERE user_id = $1 AND report_id = $2
            ORDER BY day_number
        """, user_id, report_id)
        
        # Build response with unlock logic
        progress_map = {row['day_number']: dict(row) for row in rows}
        days = []
        
        # Get total days from report (learning plan)
        report_row = await conn.fetchrow(
            "SELECT report_json FROM reports WHERE report_id = $1", report_id
        )
        
        total_days = 6  # Default
        if report_row and report_row['report_json']:
            report_data = report_row['report_json'] if isinstance(report_row['report_json'], dict) else json.loads(report_row['report_json'])
            learning_plan = report_data.get('learningPlan', [])
            total_days = len(learning_plan) if learning_plan else 6
        
        for day_num in range(1, total_days + 1):
            progress = progress_map.get(day_num, {})
            
            # Day unlock logic: Day 1 always unlocked, others need previous day's assessment completed
            is_unlocked = True
            if day_num > 1:
                prev_progress = progress_map.get(day_num - 1, {})
                is_unlocked = prev_progress.get('assessment_completed', False)
            
            days.append(DayUnlockStatus(
                day_number=day_num,
                category=progress.get('category', ''),
                is_unlocked=is_unlocked,
                assessment_completed=progress.get('assessment_completed', False),
                practice_count=progress.get('practice_count', 0)
            ))
        
        return AllDaysProgressResponse(report_id=report_id, days=days)


@router.post("/complete-assessment")
async def complete_assessment(
    uid: str = Body(...),
    data: DayProgressCreate = Body(...)
):
    """Mark a day's assessment as completed"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await ensure_tables_exist(conn)
        
        user_id = await get_user_id_from_uid(conn, uid)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if day is unlocked (Day 1 always unlocked, others need previous complete)
        if data.day_number > 1:
            prev_completed = await conn.fetchval("""
                SELECT assessment_completed FROM skill_practice_progress
                WHERE user_id = $1 AND report_id = $2 AND day_number = $3
            """, user_id, data.report_id, data.day_number - 1)
            
            if not prev_completed:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Day {data.day_number - 1} assessment must be completed first"
                )
        
        # Upsert progress record
        await conn.execute("""
            INSERT INTO skill_practice_progress 
            (user_id, report_id, day_number, category, assessment_completed, 
             assessment_questions, assessment_correct, assessment_time_seconds, completed_at)
            VALUES ($1, $2, $3, $4, TRUE, $5, $6, $7, $8)
            ON CONFLICT (user_id, report_id, day_number)
            DO UPDATE SET 
                assessment_completed = TRUE,
                assessment_questions = $5,
                assessment_correct = $6,
                assessment_time_seconds = $7,
                completed_at = $8
        """, user_id, data.report_id, data.day_number, data.category,
            data.questions_attempted, data.correct_answers, 
            data.time_taken_seconds, datetime.utcnow())
        
        # Log this as a session too
        await conn.execute("""
            INSERT INTO skill_practice_sessions
            (user_id, report_id, day_number, category, session_type,
             questions_attempted, correct_answers, time_taken_seconds)
            VALUES ($1, $2, $3, $4, 'assessment', $5, $6, $7)
        """, user_id, data.report_id, data.day_number, data.category,
            data.questions_attempted, data.correct_answers, data.time_taken_seconds)
        
        return {"success": True, "message": f"Day {data.day_number} assessment completed"}


@router.post("/log-practice")
async def log_practice_session(
    uid: str = Body(...),
    data: PracticeSessionCreate = Body(...)
):
    """Log a practice session for analytics"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await ensure_tables_exist(conn)
        
        user_id = await get_user_id_from_uid(conn, uid)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log the practice session
        session_id = await conn.fetchval("""
            INSERT INTO skill_practice_sessions
            (user_id, report_id, day_number, category, session_type,
             questions_attempted, correct_answers, time_taken_seconds)
            VALUES ($1, $2, $3, $4, 'practice', $5, $6, $7)
            RETURNING id
        """, user_id, data.report_id, data.day_number, data.category,
            data.questions_attempted, data.correct_answers, data.time_taken_seconds)
        
        # Update aggregated stats in progress table
        await conn.execute("""
            INSERT INTO skill_practice_progress 
            (user_id, report_id, day_number, category, practice_count,
             total_practice_questions, total_practice_correct, total_practice_time_seconds)
            VALUES ($1, $2, $3, $4, 1, $5, $6, $7)
            ON CONFLICT (user_id, report_id, day_number)
            DO UPDATE SET 
                practice_count = skill_practice_progress.practice_count + 1,
                total_practice_questions = skill_practice_progress.total_practice_questions + $5,
                total_practice_correct = skill_practice_progress.total_practice_correct + $6,
                total_practice_time_seconds = skill_practice_progress.total_practice_time_seconds + $7
        """, user_id, data.report_id, data.day_number, data.category,
            data.questions_attempted, data.correct_answers, data.time_taken_seconds)
        
        return {"success": True, "session_id": session_id}


# ============== ANALYTICS ENDPOINTS ==============

@router.get("/analytics/{report_id}")
async def get_skill_analytics(
    report_id: int,
    uid: str
) -> UserSkillAnalytics:
    """Get comprehensive analytics for skill practice"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await ensure_tables_exist(conn)
        
        user_id = await get_user_id_from_uid(conn, uid)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all progress records
        progress_rows = await conn.fetch("""
            SELECT * FROM skill_practice_progress
            WHERE user_id = $1 AND report_id = $2
            ORDER BY day_number
        """, user_id, report_id)
        
        # Get session counts
        session_counts = await conn.fetch("""
            SELECT day_number, session_type, 
                   COUNT(*) as count,
                   SUM(questions_attempted) as total_questions,
                   SUM(correct_answers) as total_correct,
                   SUM(time_taken_seconds) as total_time
            FROM skill_practice_sessions
            WHERE user_id = $1 AND report_id = $2
            GROUP BY day_number, session_type
        """, user_id, report_id)
        
        # Build session lookup
        session_lookup = {}
        for row in session_counts:
            key = (row['day_number'], row['session_type'])
            session_lookup[key] = dict(row)
        
        # Build day analytics
        days_analytics = []
        total_practice_sessions = 0
        total_practice_correct = 0
        total_practice_questions = 0
        total_assessment_correct = 0
        total_assessment_questions = 0
        total_time = 0
        days_completed = 0
        
        for row in progress_rows:
            practice_data = session_lookup.get((row['day_number'], 'practice'), {})
            
            practice_questions = row['total_practice_questions'] or 0
            practice_correct = row['total_practice_correct'] or 0
            practice_accuracy = (practice_correct / practice_questions * 100) if practice_questions > 0 else 0
            
            assessment_questions = row['assessment_questions'] or 0
            assessment_correct = row['assessment_correct'] or 0
            assessment_accuracy = (assessment_correct / assessment_questions * 100) if assessment_questions > 0 else 0
            
            day_time = (row['total_practice_time_seconds'] or 0) + (row['assessment_time_seconds'] or 0)
            
            days_analytics.append(DayAnalytics(
                day_number=row['day_number'],
                category=row['category'],
                total_practice_sessions=row['practice_count'] or 0,
                total_practice_questions=practice_questions,
                total_practice_correct=practice_correct,
                practice_accuracy_percent=round(practice_accuracy, 1),
                assessment_completed=row['assessment_completed'],
                assessment_questions=assessment_questions,
                assessment_correct=assessment_correct,
                assessment_accuracy_percent=round(assessment_accuracy, 1),
                total_time_spent_seconds=day_time
            ))
            
            total_practice_sessions += row['practice_count'] or 0
            total_practice_questions += practice_questions
            total_practice_correct += practice_correct
            total_assessment_questions += assessment_questions
            total_assessment_correct += assessment_correct
            total_time += day_time
            
            if row['assessment_completed']:
                days_completed += 1
        
        overall_practice_accuracy = (
            (total_practice_correct / total_practice_questions * 100) 
            if total_practice_questions > 0 else 0
        )
        overall_assessment_accuracy = (
            (total_assessment_correct / total_assessment_questions * 100)
            if total_assessment_questions > 0 else 0
        )
        
        return UserSkillAnalytics(
            user_id=user_id,
            report_id=report_id,
            total_days=len(days_analytics) or 6,
            days_completed=days_completed,
            overall_practice_sessions=total_practice_sessions,
            overall_practice_accuracy=round(overall_practice_accuracy, 1),
            overall_assessment_accuracy=round(overall_assessment_accuracy, 1),
            total_time_spent_seconds=total_time,
            days_analytics=days_analytics
        )


@router.get("/sessions/{report_id}")
async def get_practice_sessions(
    report_id: int,
    uid: str,
    day_number: Optional[int] = None,
    session_type: Optional[str] = None,
    limit: int = 50
) -> List[PracticeSessionResponse]:
    """Get practice session history for charts/graphs"""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await ensure_tables_exist(conn)
        
        user_id = await get_user_id_from_uid(conn, uid)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")
        
        query = """
            SELECT * FROM skill_practice_sessions
            WHERE user_id = $1 AND report_id = $2
        """
        params = [user_id, report_id]
        
        if day_number:
            query += f" AND day_number = ${len(params) + 1}"
            params.append(day_number)
        
        if session_type:
            query += f" AND session_type = ${len(params) + 1}"
            params.append(session_type)
        
        query += f" ORDER BY created_at DESC LIMIT ${len(params) + 1}"
        params.append(limit)
        
        rows = await conn.fetch(query, *params)
        
        return [
            PracticeSessionResponse(
                id=row['id'],
                user_id=row['user_id'],
                report_id=row['report_id'],
                day_number=row['day_number'],
                category=row['category'],
                questions_attempted=row['questions_attempted'],
                correct_answers=row['correct_answers'],
                time_taken_seconds=row['time_taken_seconds'],
                created_at=row['created_at']
            )
            for row in rows
        ]
