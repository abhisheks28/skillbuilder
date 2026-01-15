from fastapi import APIRouter, Query
from .generators import GRADE1_GENERATORS

router = APIRouter()

@router.get("/all")
async def get_all_grade1_questions(count: int = 10):
    """
    Returns a full set of Grade 1 questions across all topics.
    Default: 10 questions per topic.
    """
    result = {}
    topics_to_generate = [
        ("q1", "Number Sense / Counting Forwards"),
        ("q2", "Number Sense / Counting Backwards"),
        ("q3", "Number Sense / Before & After"),
        ("q4", "Number Sense / Between"),
        ("q5", "Number Sense / Counting Objects"),
        ("q6", lambda: GRADE1_GENERATORS["Number Sense / Skip Counting"]()),
        ("q7", lambda: GRADE1_GENERATORS["Number Sense / Skip Counting"]()),
        ("q8", lambda: GRADE1_GENERATORS["Number Sense / Skip Counting"]()),
        ("q9", "Number Sense / Place Value"),
        ("q10", lambda: GRADE1_GENERATORS["Number Sense / Comparison"]()),
        ("q11", lambda: GRADE1_GENERATORS["Number Sense / Comparison"]()),
        ("q12", "Number Sense / Even & Odd"),
        ("q13", "Addition / Basics"),
        ("q14", "Addition / Word Problems"),
        ("q15", "Subtraction / Basics"),
        ("q16", "Subtraction / Word Problems"),
        ("q17", "Geometry / Shapes"),
        ("q18", "Geometry / Spatial"),
        ("q19", "Measurement / Weight"),
        ("q20", "Measurement / Capacity"),
        ("q21", "Time / Basics"),
        ("q22", "Money / Basics"),
        ("q23", "Time / Days of Week"),
        ("q24", "Patterns / Basics"),
        ("q25", "Patterns / Sequences")
    ]
    
    for key, topic_or_func in topics_to_generate:
        if callable(topic_or_func):
            result[key] = [topic_or_func() for _ in range(count)]
        else:
            generator = GRADE1_GENERATORS.get(topic_or_func)
            if generator:
                result[key] = [generator() for _ in range(count)]
            else:
                result[key] = []
                
    return result

@router.get("/topic")
async def get_grade1_questions_by_topic(
    topic: str = Query(..., description="The name of the topic"),
    count: int = Query(10, description="Number of questions to generate")
):
    """
    Returns questions for a specific Grade 1 topic.
    """
    if topic not in GRADE1_GENERATORS:
        return {"error": f"Topic '{topic}' not found for Grade 1"}
    
    generator = GRADE1_GENERATORS[topic]
    questions = [generator() for _ in range(count)]
    return questions
