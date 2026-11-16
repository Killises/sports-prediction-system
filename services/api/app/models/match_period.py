
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


class MatchPeriod(Base):
    __tablename__ = "match_periods"

    __table_args__ = (
        UniqueConstraint(
            "match_id",
            "period_number",
            name="uq_match_period_number",
        ),
    )

    id = Column(Integer, primary_key=True)

    match_id = Column(
        Integer,
        ForeignKey("matches.id", ondelete="CASCADE"),
        nullable=False,
    )

    period_number = Column(Integer, nullable=False)
    period_type = Column(String(30), nullable=False)
    status = Column(String(20), nullable=False, default="scheduled")

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

    match = relationship("Match", back_populates="periods")

    scores = relationship(
        "MatchPeriodScore",
        back_populates="period",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return (
            f"<MatchPeriod(id={self.id}, "
            f"type='{self.period_type}', "
            f"number={self.period_number})>"
        )


class MatchPeriodScore(Base):
    __tablename__ = "match_period_scores"

    __table_args__ = (
        UniqueConstraint(
            "period_id",
            "match_participant_id",
            name="uq_period_participant_score",
        ),
    )

    id = Column(Integer, primary_key=True)

    period_id = Column(
        Integer,
        ForeignKey("match_periods.id", ondelete="CASCADE"),
        nullable=False,
    )

    match_participant_id = Column(
        Integer,
        ForeignKey("match_participants.id", ondelete="CASCADE"),
        nullable=False,
    )

    score = Column(Integer, nullable=True)
    tie_break_score = Column(Integer, nullable=True)

    period = relationship("MatchPeriod", back_populates="scores")

    match_participant = relationship(
        "MatchParticipant",
        back_populates="period_scores",
    )

    def __repr__(self):
        return f"<MatchPeriodScore(id={self.id}, score={self.score})>"
