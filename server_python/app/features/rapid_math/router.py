from fastapi import APIRouter
import random
import time
from .schemas import QuestionResponse

router = APIRouter()

from typing import List, Optional

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
