
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.match_statistic import MatchStatistic
from app.models.match import MatchParticipant


router = APIRouter(
    prefix="/match-statistics",
    tags=["Match Statistics"],
)


@router.get("/")
def get_match_statistics(
    match_id: int = Query(default=None, ge=1),
    participant_id: int = Query(default=None, ge=1),
    statistic_code: str = Query(default=None),
    period_id: int = Query(default=None, ge=1),
    db: Session = Depends(get_db),
):
    query = db.query(MatchStatistic)

    if match_id is not None:
        query = query.filter(
            MatchStatistic.match_id == match_id
        )

    if participant_id is not None:
        query = query.join(
            MatchParticipant,
            MatchStatistic.match_participant_id == MatchParticipant.id,
        ).filter(
            MatchParticipant.participant_id == participant_id
        )

    if statistic_code is not None:
        query = query.join(
            MatchStatistic.statistic_type
        ).filter(
            MatchStatistic.statistic_type.has(code=statistic_code)
        )

    if period_id is not None:
        query = query.filter(
            MatchStatistic.match_period_id == period_id
        )

    statistics = query.order_by(MatchStatistic.id).all()

    return [
        {
            "id": statistic.id,
            "match_id": statistic.match_id,
            "statistic_type_id": statistic.statistic_type_id,
            "statistic_code": statistic.statistic_type.code,
            "statistic_name": statistic.statistic_type.name,
            "participant_id": (
                statistic.match_participant.participant_id
                if statistic.match_participant
                else None
            ),
            "period_id": statistic.match_period_id,
            "value_numeric": (
                float(statistic.value_numeric)
                if statistic.value_numeric is not None
                else None
            ),
            "value_text": statistic.value_text,
        }
        for statistic in statistics
    ]
