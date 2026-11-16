
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    func,
)

from sqlalchemy.orm import relationship
from app.db.session import Base


class Sport(Base):
    __tablename__ = "sports"

    id = Column(Integer, primary_key=True)

    name = Column(
        String(100),
        nullable=False,
        unique=True,
    )

    slug = Column(
        String(100),
        nullable=False,
        unique=True,
    )

    description = Column(
        String(500),
        nullable=True,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    competitions = relationship(
        "Competition",
        back_populates="sport",
        passive_deletes=True,
    )

    participants = relationship(
        "Participant",
        back_populates="sport",
        passive_deletes=True,
    )
    statistic_types = relationship(
        "StatisticType",
        back_populates="sport",
        passive_deletes=True,
    )

    def __repr__(self):
        return f"<Sport(id={self.id}, name='{self.name}')>"
