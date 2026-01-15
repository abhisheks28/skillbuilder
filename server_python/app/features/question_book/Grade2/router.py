from fastapi import APIRouter, Query
from .generators import GRADE2_GENERATORS

router = APIRouter()

@router.get("/all")
async def get_all_grade2_questions(count: int = 10):
    """
    Returns a full set of Grade 2 questions across all topics.
    """
    result = {}
    topics_to_generate = [
        ("q1", "Number Sense / Counting"),
        ("q2", "Number Sense / Place Value"),
        ("q3", "Number Sense / Value"),
        ("q4", "Number Sense / Expanded Form"),
        ("q5", "Number Sense / Ordering"),
        ("q6", "Number Sense / Number Names"),
        ("q7", lambda: GRADE2_GENERATORS["Number Sense / Skip Counting"](2)),
        ("q8", lambda: GRADE2_GENERATORS["Number Sense / Skip Counting"](5)),
        ("q9", lambda: GRADE2_GENERATORS["Number Sense / Skip Counting"](10)),
        ("q10", "Number Sense / Even & Odd"),
        ("q11", "Addition / Without Carry"),
        ("q12", "Addition / With Carry"),
        ("q13", "Addition / Word Problems"),
        ("q14", "Subtraction / Without Borrow"),
        ("q15", "Subtraction / With Borrow"),
        ("q16", "Subtraction / Word Problems"),
        ("q17", "Multiplication / Repeated Addition"),
        ("q18", "Multiplication / Tables"),
        ("q19", "Multiplication / Tables"),
        ("q20", "Money / Basics"),
        ("q21", "Money / Addition"),
        ("q22", "Money / Subtraction"),
        ("q23", "Measurement / Weight"),
        ("q24", "Measurement / Capacity"),
        ("q25", "Measurement / Time"),
        ("q26", "Geometry / Shapes"),
        ("q27", "Geometry / Patterns"),
        ("q28", "Data Handling / Tally"),
        ("q29", "Logical / Sequences"),
        ("q30", "Logical / Missing Numbers")
    ]
    
    for key, topic_or_func in topics_to_generate:
        if callable(topic_or_func):
            result[key] = [topic_or_func() for _ in range(count)]
        else:
            generator = GRADE2_GENERATORS.get(topic_or_func)
            if generator:
                result[key] = [generator() for _ in range(count)]
            else:
                result[key] = []
                
    return result

@router.get("/topic")
async def get_grade2_questions_by_topic(
    topic: str = Query(..., description="The name of the topic"),
    count: int = Query(10, description="Number of questions to generate")
):
    """
    Returns questions for a specific Grade 2 topic.
    """
    if topic not in GRADE2_GENERATORS:
        return {"error": f"Topic '{topic}' not found for Grade 2"}
    
    generator = GRADE2_GENERATORS[topic]
    questions = [generator() for _ in range(count)]
    return questions
