
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
    func,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


class Competition(Base):
    __tablename__ = "competitions"

    __table_args__ = (
        UniqueConstraint(
            "sport_id",
            "slug",
            name="uq_competition_sport_slug",
        ),
    )

    id = Column(Integer, primary_key=True )

    sport_id = Column(
        Integer,
        ForeignKey("sports.id", ondelete="RESTRICT"),
        nullable=False,
    )

    name = Column(
        String(150),
        nullable=False,
    )

    slug = Column(
        String(150),
        nullable=False,
    )

    country_code = Column(
        String(2),
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

    sport = relationship(
        "Sport",
        back_populates="competitions",
    )

    seasons = relationship(
        "Season",
        back_populates="competition",
    )

    def __repr__(self):
        return (
            f"<Competition(id={self.id}, "
            f"name='{self.name}')>"
        )
