from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True)

    season_id = Column(
        Integer,
        ForeignKey("seasons.id", ondelete="RESTRICT"),
        nullable=False,
    )

    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(30), nullable=False, default="scheduled")
    stage = Column(String(100), nullable=True)
    round = Column(String(100), nullable=True)
    venue = Column(String(150), nullable=True)

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

    season = relationship("Season", back_populates="matches")

    participants = relationship(
        "MatchParticipant",
        back_populates="match",
        cascade="all, delete-orphan",
    )
    periods = relationship(
        "MatchPeriod",
        back_populates="match",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Match(id={self.id}, status='{self.status}')>"


class MatchParticipant(Base):
    __tablename__ = "match_participants"

    __table_args__ = (
        UniqueConstraint(
            "match_id",
            "participant_id",
            name="uq_match_participant",
        ),
        UniqueConstraint(
            "match_id",
            "position",
            name="uq_match_position",
        ),
    )

    id = Column(Integer, primary_key=True)

    match_id = Column(
        Integer,
        ForeignKey("matches.id", ondelete="CASCADE"),
        nullable=False,
    )

    participant_id = Column(
        Integer,
        ForeignKey("participants.id", ondelete="RESTRICT"),
        nullable=False,
    )



    position = Column(Integer, nullable=False)
    role = Column(String(20), nullable=True)

    match = relationship("Match", back_populates="participants")
    participant = relationship("Participant", back_populates="match_links")


    period_scores = relationship(
    "MatchPeriodScore",
    back_populates="match_participant",
    cascade="all, delete-orphan",
)
