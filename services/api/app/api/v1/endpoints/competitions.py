
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.competition import Competition
from app.models.sports import Sport
from app.schemas.competition import (
    CompetitionCreate,
    CompetitionUpdate,
    CompetitionResponse,
)


router = APIRouter(
    prefix="/competitions",
    tags=["Competitions"],
)


@router.get("/")
def get_competitions(
    sport_id: int = Query(default=None, ge=1),
    active_only: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    query = db.query(Competition)

    if sport_id is not None:
        query = query.filter(Competition.sport_id == sport_id)

    if active_only:
        query = query.filter(Competition.is_active.is_(True))

    competitions = query.order_by(Competition.id).all()

    return [
        {
            "id": competition.id,
            "sport_id": competition.sport_id,
            "name": competition.name,
            "slug": competition.slug,
            "country_code": competition.country_code,
            "is_active": competition.is_active,
        }
        for competition in competitions
    ]


@router.post(
    "/",
    response_model=CompetitionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_competition(
    competition_data: CompetitionCreate,
    db: Session = Depends(get_db),
):
    sport = db.query(Sport).filter(
        Sport.id == competition_data.sport_id
    ).first()

    if not sport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sport not found",
        )

    existing_competition = db.query(Competition).filter(
        Competition.sport_id == competition_data.sport_id,
        Competition.slug == competition_data.slug,
    ).first()

    if existing_competition:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A competition with this slug already exists for this sport",
        )

    new_competition = Competition(
        sport_id=competition_data.sport_id,
        name=competition_data.name,
        slug=competition_data.slug,
        country_code=competition_data.country_code,
        is_active=competition_data.is_active,
    )

    db.add(new_competition)
    db.commit()
    db.refresh(new_competition)

    return new_competition


@router.patch(
    "/{competition_id}",
    response_model=CompetitionResponse,
)
def update_competition(
    competition_id: int,
    competition_data: CompetitionUpdate,
    db: Session = Depends(get_db),
):
    competition = db.query(Competition).filter(
        Competition.id == competition_id
    ).first()

    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competition not found",
        )

    update_data = competition_data.model_dump(exclude_unset=True)

    new_sport_id = update_data.get(
        "sport_id",
        competition.sport_id,
    )

    new_slug = update_data.get(
        "slug",
        competition.slug,
    )

    if "sport_id" in update_data:
        sport = db.query(Sport).filter(
            Sport.id == new_sport_id
        ).first()

        if not sport:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sport not found",
            )

    if "sport_id" in update_data or "slug" in update_data:
        existing_competition = db.query(Competition).filter(
            Competition.id != competition_id,
            Competition.sport_id == new_sport_id,
            Competition.slug == new_slug,
        ).first()

        if existing_competition:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A competition with this slug already exists for this sport",
            )

    for field, value in update_data.items():
        setattr(competition, field, value)

    db.commit()
    db.refresh(competition)

    return competition
