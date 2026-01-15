from fastapi import APIRouter, Query
from .generators import GRADE5_GENERATORS

router = APIRouter()

@router.get("/all")
async def get_all_grade5_questions(count: int = 1):
    """
    Returns a full set of Grade 5 questions.
    Default: 1 question per topic type (q1..q25).
    """
    result = {}
    
    # Iterate over all defined keys q1, q2, ... q25
    for key, generator in GRADE5_GENERATORS.items():
        # Generate 'count' questions for each key
        result[key] = [generator() for _ in range(count)]
                
    return result

@router.get("/topic")
async def get_grade5_questions_by_topic(
    topic: str = Query(..., description="The key of the topic (e.g., q1, q2)"),
    count: int = Query(10, description="Number of questions to generate")
):
    """
    Returns questions for a specific Grade 5 topic key (e.g., q1).
    """
    if topic not in GRADE5_GENERATORS:
        return {"error": f"Topic '{topic}' not found for Grade 5"}
    
    generator = GRADE5_GENERATORS[topic]
    questions = [generator() for _ in range(count)]
    return questions
