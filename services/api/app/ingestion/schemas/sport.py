
from typing import Optional
from pydantic import BaseModel, Field


class SportSchema(BaseModel):
    external_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
