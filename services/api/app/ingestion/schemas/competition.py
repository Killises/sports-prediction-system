
from typing import Optional
from pydantic import BaseModel, Field


class CompetitionSchema(BaseModel):
    external_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    country_code: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=2
    )
