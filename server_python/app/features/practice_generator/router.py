from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
import importlib

router = APIRouter()

class QuestionOption(BaseModel):
    value: str
    label: str
    image: Optional[str] = None

class QuestionResponse(BaseModel):
    type: str
    question: str
    topic: str
    answer: str
    options: Optional[List[QuestionOption]] = None
    image: Optional[str] = None
    # Add other fields as necessary

@router.get("/generate", response_model=List[QuestionResponse])
async def generate_questions(
    grade: str = Query(..., description="Grade level (1-10 or SAT)"),
    category: str = Query(..., description="Topic category"),
    count: int = Query(10, description="Number of questions to generate")
):
    try:
        # Dynamic import of generator module
        # Format: app.features.practice_generator.generators.grade{grade}
        if grade.lower() == 'sat':
             module_name = "app.features.practice_generator.generators.grade_sat"
        else:
             module_name = f"app.features.practice_generator.generators.grade{grade}"
        
        try:
            module = importlib.import_module(module_name)
        except ImportError:
            raise HTTPException(status_code=404, detail=f"Generators for Grade {grade} not implemented yet.")
        
        generator_map = getattr(module, "GENERATOR_MAP", {})
        
        if category not in generator_map:
             # Try to find a partial match or fallback? 
             # For now exact match or specific mapping logic from JS
             # Check if we need to map JS names to Python functions
             raise HTTPException(status_code=404, detail=f"Category '{category}' not found for Grade {grade}")
        
        generator_func = generator_map[category]
        
        questions = []
        for _ in range(count):
            q = generator_func()
            # Ensure topic is set
            if not q.get('topic'):
                q['topic'] = category
            questions.append(q)
            
        return questions

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
