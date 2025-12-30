from typing import Any, Dict, Optional
from pydantic import BaseModel

class RecipeOut(BaseModel):
    id: int
    title: Optional[str] = None
    cuisine: Optional[str] = None
    rating: Optional[float] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    total_time: Optional[int] = None
    description: Optional[str] = None
    nutrients: Optional[Dict[str, Any]] = None
    serves: Optional[str] = None

    class Config:
        from_attributes = True
