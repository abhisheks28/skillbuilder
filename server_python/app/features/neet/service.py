
import pandas as pd
import json
import io
from typing import List, Dict, Any, Union
from fastapi import UploadFile, HTTPException

class NeetService:
    @staticmethod
    async def parse_upload_file(file: UploadFile, file_type: str = None) -> List[Dict[str, Any]]:
        """
        Parses an uploaded file (JSON or Excel) and returns a list of question objects.
        Expected Excel validation:
        - Columns: ["question", "option_a", "option_b", "option_c", "option_d", "correct_answer", "explanation"]
        """
        
        contents = await file.read()
        filename = file.filename.lower()

        if filename.endswith('.json') or file_type == 'json':
            try:
                data = json.loads(contents.decode('utf-8'))
                if not isinstance(data, list):
                    raise ValueError("JSON must be a list of objects")
                return data
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON file")

        elif filename.endswith('.xlsx') or filename.endswith('.xls') or file_type == 'excel':
            try:
                df = pd.read_excel(io.BytesIO(contents))
                
                # Normalize headers
                df.columns = [c.lower().replace(' ', '_') for c in df.columns]
                
                required_cols = {'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'}
                if not required_cols.issubset(set(df.columns)):
                    missing = required_cols - set(df.columns)
                    raise HTTPException(status_code=400, detail=f"Missing columns in Excel: {', '.join(missing)}")
                
                questions = []
                for _, row in df.iterrows():
                    # Skip empty rows
                    if pd.isna(row['question']):
                        continue
                        
                    q_obj = {
                        "question": str(row['question']),
                        "options": [
                            str(row['option_a']),
                            str(row['option_b']),
                            str(row['option_c']),
                            str(row['option_d'])
                        ],
                        # Ensure correct answer is just the letter A/B/C/D if possible, or the full text? 
                        # Usually logic expects index or letter. Let's assume letter input in excel.
                        "correctAnswer": str(row['correct_answer']).strip().upper()[0] if str(row['correct_answer']) else "A",
                        "explanation": str(row['explanation']) if 'explanation' in df.columns and not pd.isna(row['explanation']) else "",
                        "question_type": str(row['question_type']).strip() if 'question_type' in df.columns and not pd.isna(row['question_type']) else None
                    }
                    questions.append(q_obj)
                
                return questions
                
            except Exception as e:
                # Catch verify errors or pandas errors
                if isinstance(e, HTTPException):
                    raise e
                raise HTTPException(status_code=400, detail=f"Error processing Excel: {str(e)}")
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use .json or .xlsx")
