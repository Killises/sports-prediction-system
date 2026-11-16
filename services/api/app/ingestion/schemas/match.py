from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class MatchSchema(BaseModel):
    external_id: str = Field(..., min_length=1)
    home_participant_external_id: str = Field(..., min_length=1)
    away_participant_external_id: str = Field(..., min_length=1)
    scheduled_at: Optional[datetime] = None
    status: str = Field(default="scheduled", min_length=1, max_length=30)
    stage: Optional[str] = None
    round: Optional[str] = None
    venue: Optional[str] = None
