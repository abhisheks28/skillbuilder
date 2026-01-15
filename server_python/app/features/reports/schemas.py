from pydantic import BaseModel
from typing import Dict, Any

class ReportCreate(BaseModel):
    category: str
    report_json: Dict[str, Any]
