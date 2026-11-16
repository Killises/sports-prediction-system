
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


class Participant(Base):
    __tablename__ = "participants"

    __table_args__ = (
        UniqueConstraint(
            "sport_id",
            "slug",
            name="uq_participant_sport_slug",
        ),
    )

    id = Column(Integer, primary_key=True)

    sport_id = Column(
        Integer,
        ForeignKey("sports.id", ondelete="RESTRICT"),
        nullable=False,
    )

    name = Column(String(150), nullable=False)
    slug = Column(String(150), nullable=False)

    participant_type = Column(
        String(20),
        nullable=False,
    )

    country_code = Column(String(2), nullable=True)

    short_name = Column(String(50), nullable=True)

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
        back_populates="participants",
    )
    match_links = relationship(
        "MatchParticipant",
        back_populates="participant",
    )

    def __repr__(self):
        return (
            f"<Participant(id={self.id}, "
            f"name='{self.name}', "
            f"type='{self.participant_type}')>"
        )
