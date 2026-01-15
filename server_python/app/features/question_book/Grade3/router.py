from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from .generators import (
    GRADE3_GENERATORS,
    generate_addition_2digit,
    generate_addition_3digit,
    generate_subtraction_2digit,
    generate_subtraction_3digit,
    generate_multiplication_tables_6to9,
    generate_multiplication_tables_12to19,
    generate_division_1stlevel,
    generate_division_2ndlevel,
    generate_missing_number_addition,
    generate_missing_number_subtraction,
    generate_addition_then_subtraction,
    generate_subtraction_then_addition,
    generate_fractions,
    generate_number_to_words,
    generate_words_to_number,
    generate_doubling_question,
    generate_halving_question,
    generate_symmetry,
    generate_shape_composition,
    generate_3d_shape_matching,
    generate_length_conversion,
    generate_weight_conversion,
    generate_capacity_conversion,
    generate_time_reading,
    generate_identify_money,
    generate_money_operations,
    generate_tally,
    generate_number_pattern
)

router = APIRouter()

@router.get("/all")
async def get_all_grade3_questions(count: int = Query(10, ge=1, le=50)):
    """
    Generate a full set of Grade 3 questions, indexed by q1..q28 for the frontend.
    """
    print(f"Generating Grade 3 questions for /all, count={count}")
    result = {}
    
    mapping = {
        "q1": generate_addition_2digit,
        "q2": generate_addition_3digit,
        "q3": generate_subtraction_2digit,
        "q4": generate_subtraction_3digit,
        "q5": generate_multiplication_tables_6to9,
        "q6": generate_multiplication_tables_12to19,
        "q7": generate_division_1stlevel,
        "q8": generate_division_2ndlevel,
        "q9": generate_missing_number_addition,
        "q10": generate_missing_number_subtraction,
        "q11": generate_addition_then_subtraction,
        "q12": generate_subtraction_then_addition,
        "q13": generate_fractions,
        "q14": generate_number_to_words,
        "q15": generate_words_to_number,
        "q16": generate_doubling_question,
        "q17": generate_halving_question,
        "q18": generate_symmetry,
        "q19": generate_shape_composition,
        "q20": generate_3d_shape_matching,
        "q21": generate_length_conversion,
        "q22": generate_weight_conversion,
        "q23": generate_capacity_conversion,
        "q24": generate_time_reading,
        "q25": generate_identify_money,
        "q26": generate_money_operations,
        "q27": generate_tally,
        "q28": generate_number_pattern
    }
    
    for key, generator_func in mapping.items():
        result[key] = [generator_func() for _ in range(count)]
        
    return result

@router.get("/topic")
async def get_grade3_questions_by_topic(
    topic: str, 
    count: int = Query(10, ge=1, le=50)
):
    """
    Generate questions for a specific Grade 3 topic.
    """
    if topic not in GRADE3_GENERATORS:
        raise HTTPException(status_code=404, detail=f"Topic '{topic}' not found for Grade 3")
    
    generator_func = GRADE3_GENERATORS[topic]
    questions = [generator_func() for _ in range(count)]
    
    return questions
