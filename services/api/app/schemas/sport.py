from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SportCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = True


class SportUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    slug: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: Optional[bool] = None


class SportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: Optional[str] = None
    is_active: bool
