from pydantic import BaseModel

class QuestionResponse(BaseModel):
    id: int
    question: str
    correctAnswer: int
    operation: str
    num1: int
    num2: int

class ScoreSubmission(BaseModel):
    measure_value: float
    metric_type: str = "avg_time" # or 'total_questions'
    difficulty: str = "medium"
    name: str # Added name field

class LeaderboardEntry(BaseModel):
    id: int
    rank: int
    user_name: str
    measure_value: float
    metric_type: str
