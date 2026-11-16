
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.match import Match
from app.models.match import Match, MatchParticipant


router = APIRouter(
    prefix="/matches",
    tags=["Matches"],
)


@router.get("/")
def get_matches(
    season_id: int = Query(default=None, ge=1),
    status: str = Query(default=None),
    participant_id: int = Query(default=None, ge=1),
    upcoming_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    query = db.query(Match)

    if season_id is not None:
        query = query.filter(
            Match.season_id == season_id
        )

    if status is not None:
        query = query.filter(
            Match.status == status
        )

    if participant_id is not None:
        query = query.join(
            Match.participants
        ).filter(
            MatchParticipant.participant_id == participant_id
        )

    if upcoming_only:
        now = datetime.now(timezone.utc)
        query = query.filter(
            Match.scheduled_at >= now,
            Match.status == "scheduled",
        )

    matches = query.order_by(Match.id).distinct().all()

    return [
        {
            "id": match.id,
            "season_id": match.season_id,
            "scheduled_at": match.scheduled_at,
            "status": match.status,
            "stage": match.stage,
            "round": match.round,
            "venue": match.venue,
            "participants": [
                {
                    "participant_id": link.participant.id,
                    "name": link.participant.name,
                    "position": link.position,
                    "role": link.role,
                }
                for link in match.participants
            ],
        }
        for match in matches
    ]
