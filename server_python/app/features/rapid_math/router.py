from fastapi import APIRouter
import random
import time
from .schemas import QuestionResponse, ScoreSubmission, LeaderboardEntry
from typing import List, Optional
from fastapi import HTTPException, Query
from app.core.database import get_db_pool

router = APIRouter()

@router.get("/question", response_model=List[QuestionResponse])
async def get_rapid_math_question(difficulty: str = "medium", count: int = 1):
    questions = []
    
    for _ in range(count):
        ops = ["+", "-", "*", "/"]
        operation = random.choice(ops)
        
        num1 = 0
        num2 = 0
        correct_answer = 0
        
        # Difficulty ranges
        if difficulty == "easy":
            min_val, max_val = 1, 9
        elif difficulty == "hard":
            min_val, max_val = 10, 999
        else: # medium/default
            min_val, max_val = 10, 99
        
        if operation == "+":
            num1 = random.randint(min_val, max_val)
            num2 = random.randint(min_val, max_val)
            correct_answer = num1 + num2
        elif operation == "-":
            num1 = random.randint(min_val, max_val)
            num2 = random.randint(min_val, max_val)
            if num1 < num2:
                num1, num2 = num2, num1
            correct_answer = num1 - num2
        elif operation == "*":
            # For multiplication, we might want slightly different rules per difficulty
            # reusing range for now but maybe restricting hard to smaller range or sticking to existing logic
            if difficulty == "easy":
                choices = list(range(1, 10))
            elif difficulty == "hard":
                 choices = list(range(2, 30))
            else: # medium (existing logic approx)
                choices = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
            
            num1 = random.choice(choices)
            num2 = random.choice(choices)
            correct_answer = num1 * num2
        elif operation == "/":
            while True:
                # Adjust divisor range based on difficulty
                if difficulty == "easy":
                    d_min, d_max = 2, 9
                elif difficulty == "hard":
                    d_min, d_max = 2, 50
                else:
                    d_min, d_max = 2, 20
                
                d = random.randint(d_min, d_max)
                
                # Quotient range
                max_q = (max_val * 10) // d # Allow slightly larger dividend
                if max_q < 1: max_q = 1
                q = random.randint(1, max_q)
                
                if d != q:
                    break
            
            num2 = d
            num1 = q * d
            correct_answer = q
    
        questions.append(QuestionResponse(
            id=int(time.time() * 1000) + random.randint(0, 1000), # Add random to avoid duplicate IDs in batch
            question=f"{num1} {operation} {num2}",
            correctAnswer=correct_answer,
            operation=operation,
            num1=num1,
            num2=num2
        ))

    return questions

@router.post("/score")
async def submit_score(submission: ScoreSubmission, uid: str):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Get User ID
        user_id = await conn.fetchval("SELECT user_id FROM users WHERE firebase_uid = $1", uid)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")
        
        await conn.execute("""
            INSERT INTO rapid_math_scores (user_id, measure_value, metric_type, difficulty, name)
            VALUES ($1, $2, $3, $4, $5)
        """, user_id, submission.measure_value, submission.metric_type, submission.difficulty, submission.name)
        
    return {"status": "success"}

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(metric_type: str = "avg_time", limit: int = 10):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Sort direction depends on metric
        # avg_time: ASC (lower is better)
        # questions_solved: DESC (higher is better)
        
        sort_dir = "ASC" if metric_type == "avg_time" else "DESC"
        
        # We need best score per user.
        # Postgres DISTINCT ON (user_id) ORDER BY user_id, measure_value ASC/DESC
        # We prioritize the name captured with the score (s.name) over the user account name (u.name) 
        # to correctly represent child profiles.
        
        query = f"""
            SELECT DISTINCT ON (s.user_id)
                s.id,
                COALESCE(s.name, u.name) as user_name,
                s.measure_value,
                s.metric_type
            FROM rapid_math_scores s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.metric_type = $1
            ORDER BY s.user_id, s.measure_value {sort_dir}
        """
        
        rows = await conn.fetch(query, metric_type)
        
        # Now sort the unique user results to get global rank
        # We can't do global sort directly with DISTINCT ON in one simple clause easily without subquery
        # Subquery approach:
        
        query_global = f"""
            WITH ranked_scores AS (
                SELECT DISTINCT ON (s.user_id)
                    s.id,
                    COALESCE(s.name, u.name) as user_name,
                    s.measure_value,
                    s.metric_type
                FROM rapid_math_scores s
                JOIN users u ON s.user_id = u.user_id
                WHERE s.metric_type = $1
                ORDER BY s.user_id, s.measure_value {sort_dir}
            )
            SELECT * FROM ranked_scores
            ORDER BY measure_value {sort_dir}
            LIMIT $2
        """
        
        rows = await conn.fetch(query_global, metric_type, limit)
        
        leaderboard = []
        for idx, row in enumerate(rows):
            leaderboard.append(LeaderboardEntry(
                id=row['id'],
                rank=idx + 1,
                user_name=row['user_name'] or "Unknown",
                measure_value=float(row['measure_value']),
                metric_type=row['metric_type']
            ))
            
        return leaderboard
