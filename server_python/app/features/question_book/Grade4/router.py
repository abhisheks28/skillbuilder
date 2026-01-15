from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from .generators import (
    GRADE4_GENERATORS,
    generate_place_value_5digit,
    generate_place_value_5digit_visual,
    generate_expanded_form,
    generate_addition_4digit,
    generate_addition_4digit_application,
    generate_subtraction_4digit,
    generate_subtraction_4digit_application,
    generate_multiplication,
    generate_multiplication_application,
    generate_division,
    generate_division_application,
    generate_estimation,
    generate_lcm,
    generate_proper_improper_fractions,
    generate_mixed_unit_fractions,
    generate_fraction_operations,
    generate_angles,
    generate_triangles,
    generate_area_shape,
    generate_perimeter_shape,
    generate_measurement_conversion,
    generate_measurement_conversion_application,
    generate_time_conversion_5to10,
    generate_bar_graph,
    generate_pattern,
    generate_simple_grade4_pattern,
    generate_3d_shape_identification,
    generate_fve_table
)

router = APIRouter()

@router.get("/all")
async def get_all_grade4_questions(count: int = Query(10, ge=1, le=50)):
    """
    Generate a full set of Grade 4 questions, indexed by q1..q28 for the frontend.
    """
    result = {}
    
    mapping = {
        "q1": generate_place_value_5digit,
        "q2": generate_place_value_5digit_visual,
        "q3": generate_expanded_form,
        "q4": generate_addition_4digit,
        "q5": generate_addition_4digit_application,
        "q6": generate_subtraction_4digit,
        "q7": generate_subtraction_4digit_application,
        "q8": generate_multiplication,
        "q9": generate_multiplication_application,
        "q10": generate_division,
        "q11": generate_division_application,
        "q12": generate_estimation,
        "q13": generate_lcm,
        "q14": generate_proper_improper_fractions,
        "q15": generate_mixed_unit_fractions,
        "q16": generate_fraction_operations,
        "q17": generate_angles,
        "q18": generate_triangles,
        "q19": generate_area_shape,
        "q20": generate_perimeter_shape,
        "q21": generate_measurement_conversion,
        "q22": generate_measurement_conversion_application,
        "q23": generate_time_conversion_5to10,
        "q24": generate_bar_graph,
        "q25": generate_pattern,
        "q26": generate_simple_grade4_pattern,
        "q27": generate_3d_shape_identification,
        "q28": generate_fve_table
    }
    
    for key, generator_func in mapping.items():
        result[key] = [generator_func() for _ in range(count)]
        
    return result

@router.get("/topic")
async def get_grade4_questions_by_topic(
    topic: str, 
    count: int = Query(10, ge=1, le=50)
):
    """
    Generate questions for a specific Grade 4 topic.
    """
    if topic not in GRADE4_GENERATORS:
        raise HTTPException(status_code=404, detail=f"Topic '{topic}' not found for Grade 4")
    
    generator_func = GRADE4_GENERATORS[topic]
    questions = [generator_func() for _ in range(count)]
    
    return questions
