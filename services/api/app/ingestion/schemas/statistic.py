
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class StatisticTypeSchema(BaseModel):
    code: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    unit: Optional[str] = Field(default=None, max_length=30)


class MatchStatisticSchema(BaseModel):
    statistic_code: str = Field(..., min_length=1, max_length=100)
    value_numeric: Optional[float] = None
    value_text: Optional[str] = Field(default=None, max_length=255)
    participant_external_id: Optional[str] = None
    period_number: Optional[int] = Field(default=None, ge=1)

    @model_validator(mode="after")
    def validate_statistic_value(self):
        if self.value_numeric is None and self.value_text is None:
            raise ValueError(
                "A statistic must have a numeric or text value"
            )

        if self.value_numeric is not None and self.value_text is not None:
            raise ValueError(
                "A statistic cannot have both numeric and text values"
            )

        return self
