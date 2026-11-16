
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.participant import Participant


router = APIRouter(
    prefix="/participants",
    tags=["Participants"],
)


@router.get("/")
def get_participants(
    sport_id: int = Query(default=None, ge=1),
    participant_type: str = Query(default=None),
    active_only: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    query = db.query(Participant)

    if sport_id is not None:
        query = query.filter(
            Participant.sport_id == sport_id
        )

    if participant_type is not None:
        query = query.filter(
            Participant.participant_type == participant_type
        )

    if active_only:
        query = query.filter(
            Participant.is_active.is_(True)
        )

    participants = query.order_by(Participant.id).all()

    return [
        {
            "id": participant.id,
            "sport_id": participant.sport_id,
            "name": participant.name,
            "slug": participant.slug,
            "participant_type": participant.participant_type,
            "country_code": participant.country_code,
            "short_name": participant.short_name,
            "is_active": participant.is_active,
        }
        for participant in participants
    ]
