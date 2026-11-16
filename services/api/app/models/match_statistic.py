
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Numeric,
    func,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


class StatisticType(Base):
    __tablename__ = "statistic_types"

    __table_args__ = (
        UniqueConstraint(
            "sport_id",
            "code",
            name="uq_statistic_type_sport_code",
        ),
    )

    id = Column(Integer, primary_key=True)

    sport_id = Column(
        Integer,
        ForeignKey("sports.id", ondelete="RESTRICT"),
        nullable=False,
    )

    code = Column(String(100), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    unit = Column(String(30), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    sport = relationship("Sport", back_populates="statistic_types")
    statistics = relationship(
        "MatchStatistic",
        back_populates="statistic_type",
    )

    def __repr__(self):
        return f"<StatisticType(id={self.id}, code='{self.code}')>"


class MatchStatistic(Base):
    __tablename__ = "match_statistics"

    id = Column(Integer, primary_key=True)

    match_id = Column(
        Integer,
        ForeignKey("matches.id", ondelete="CASCADE"),
        nullable=False,
    )

    statistic_type_id = Column(
        Integer,
        ForeignKey("statistic_types.id", ondelete="RESTRICT"),
        nullable=False,
    )

    match_participant_id = Column(
        Integer,
        ForeignKey("match_participants.id", ondelete="CASCADE"),
        nullable=True,
    )

    match_period_id = Column(
        Integer,
        ForeignKey("match_periods.id", ondelete="CASCADE"),
        nullable=True,
    )

    value_numeric = Column(Numeric(14, 4), nullable=True)
    value_text = Column(String(255), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    statistic_type = relationship(
        "StatisticType",
        back_populates="statistics",
    )

    match = relationship("Match")
    match_participant = relationship("MatchParticipant")
    match_period = relationship("MatchPeriod")

    def __repr__(self):
        return (
            f"<MatchStatistic(id={self.id}, "
            f"value={self.value_numeric})>"
        )
