from pydantic import BaseModel

class QuestionResponse(BaseModel):
    id: int
    question: str
    correctAnswer: int
    operation: str
    num1: int
    num2: int
