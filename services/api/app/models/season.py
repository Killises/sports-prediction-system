
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


class Season(Base):
    __tablename__ = "seasons"

    __table_args__ = (
        UniqueConstraint(
            "competition_id",
            "slug",
            name="uq_season_competition_slug",
        ),
    )

    id = Column(Integer, primary_key=True)

    competition_id = Column(
        Integer,
        ForeignKey("competitions.id", ondelete="RESTRICT"),
        nullable=False,
    )

    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False)

    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    is_current = Column(
        Boolean,
        nullable=False,
        default=False,
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

    competition = relationship(
        "Competition",
        back_populates="seasons",
    )
    matches = relationship(
        "Match",
        back_populates="season",
    )

    def __repr__(self):
        return (
            f"<Season(id={self.id}, name='{self.name}')>"
        )
