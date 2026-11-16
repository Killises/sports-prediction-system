from typing import Optional
from pydantic import BaseModel, Field


class ParticipantSchema(BaseModel):
    external_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1, max_length=150)
    slug: str = Field(..., min_length=1, max_length=150)
    participant_type: str = Field(..., min_length=1, max_length=20)
    country_code: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=2
    )
    short_name: Optional[str] = Field(
        default=None,
        max_length=50
    )
