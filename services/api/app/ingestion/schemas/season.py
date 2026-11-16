
from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class SeasonSchema(BaseModel):
    external_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
