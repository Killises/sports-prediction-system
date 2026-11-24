from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class SeasonCreate(BaseModel):
    competition_id: int = Field(..., ge=1)
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date is not None
            and self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "La fecha de finalización no puede ser anterior a la fecha de inicio."
            )
        return self


class SeasonUpdate(BaseModel):
    competition_id: Optional[int] = Field(default=None, ge=1)
    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    slug: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date is not None
            and self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "La fecha de finalización no puede ser anterior a la fecha de inicio."
            )
        return self


class SeasonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    competition_id: int
    name: str
    slug: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool