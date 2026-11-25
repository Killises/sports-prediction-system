
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.participant import Participant
from app.models.sports import Sport
from app.schemas.participant import (
    ParticipantCreate,
    ParticipantUpdate,
    ParticipantResponse,
)

router = APIRouter(
    prefix="/participants",
    tags=["Participants"],
)


@router.get("/", response_model=list[ParticipantResponse])
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

    return query.order_by(Participant.id).all()


@router.post(
    "/",
    response_model=ParticipantResponse,
    status_code=201,
)
def create_participant(
    participant_data: ParticipantCreate,
    db: Session = Depends(get_db),
):
    sport = db.query(Sport).filter(
        Sport.id == participant_data.sport_id
    ).first()

    if sport is None:
        raise HTTPException(
            status_code=404,
            detail="Sport not found",
        )

    existing_participant = db.query(Participant).filter(
        Participant.sport_id == participant_data.sport_id,
        Participant.slug == participant_data.slug,
    ).first()

    if existing_participant:
        raise HTTPException(
            status_code=409,
            detail="A participant with this slug already exists in this sport",
        )

    participant = Participant(
        **participant_data.model_dump()
    )

    db.add(participant)
    db.commit()
    db.refresh(participant)

    return participant


@router.patch(
    "/{participant_id}",
    response_model=ParticipantResponse,
)
def update_participant(
    participant_id: int,
    participant_data: ParticipantUpdate,
    db: Session = Depends(get_db),
):
    participant = db.query(Participant).filter(
        Participant.id == participant_id
    ).first()

    if participant is None:
        raise HTTPException(
            status_code=404,
            detail="Participant not found",
        )

    update_data = participant_data.model_dump(
        exclude_unset=True
    )

    required_fields = {
        "sport_id",
        "name",
        "slug",
        "participant_type",
        "is_active",
    }

    for field in required_fields:
        if field in update_data and update_data[field] is None:
            raise HTTPException(
                status_code=422,
                detail=f"{field} cannot be null",
            )

    new_sport_id = update_data.get(
        "sport_id",
        participant.sport_id,
    )

    sport = db.query(Sport).filter(
        Sport.id == new_sport_id
    ).first()

    if sport is None:
        raise HTTPException(
            status_code=404,
            detail="Sport not found",
        )

    new_slug = update_data.get(
        "slug",
        participant.slug,
    )

    existing_participant = db.query(Participant).filter(
        Participant.sport_id == new_sport_id,
        Participant.slug == new_slug,
        Participant.id != participant_id,
    ).first()

    if existing_participant:
        raise HTTPException(
            status_code=409,
            detail="A participant with this slug already exists in this sport",
        )

    for field, value in update_data.items():
        setattr(participant, field, value)

    db.commit()
    db.refresh(participant)

    return participant
