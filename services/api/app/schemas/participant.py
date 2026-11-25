
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ParticipantCreate(BaseModel):
    sport_id: int = Field(..., ge=1)
    name: str = Field(..., min_length=1, max_length=150)
    slug: str = Field(..., min_length=1, max_length=150)
    participant_type: str = Field(..., min_length=1, max_length=20)
    country_code: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=2,
    )
    short_name: Optional[str] = Field(
        default=None,
        max_length=50,
    )
    is_active: bool = True


class ParticipantUpdate(BaseModel):
    sport_id: Optional[int] = Field(default=None, ge=1)
    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    slug: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    participant_type: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=20,
    )
    country_code: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=2,
    )
    short_name: Optional[str] = Field(
        default=None,
        max_length=50,
    )
    is_active: Optional[bool] = None


class ParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sport_id: int
    name: str
    slug: str
    participant_type: str
    country_code: Optional[str] = None
    short_name: Optional[str] = None
    is_active: bool
