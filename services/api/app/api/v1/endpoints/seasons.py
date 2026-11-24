from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.season import Season
from app.models.competition import Competition
from app.schemas.season import (
    SeasonCreate,
    SeasonUpdate,
    SeasonResponse,
)

router = APIRouter(
    prefix="/seasons",
    tags=["Seasons"],
)


@router.get("/", response_model=list[SeasonResponse])
def get_seasons(
    competition_id: int = Query(default=None, ge=1),
    current_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    query = db.query(Season)

    if competition_id is not None:
        query = query.filter(
            Season.competition_id == competition_id
        )

    if current_only:
        query = query.filter(
            Season.is_current.is_(True)
        )

    return query.order_by(Season.id).all()


@router.post(
    "/",
    response_model=SeasonResponse,
    status_code=201,
)
def create_season(
    season_data: SeasonCreate,
    db: Session = Depends(get_db),
):
    competition = db.query(Competition).filter(
        Competition.id == season_data.competition_id
    ).first()

    if competition is None:
        raise HTTPException(
            status_code=404,
            detail="Competition not found",
        )

    existing_season = db.query(Season).filter(
        Season.competition_id == season_data.competition_id,
        Season.slug == season_data.slug,
    ).first()

    if existing_season:
        raise HTTPException(
            status_code=409,
            detail="A season with this slug already exists in this competition",
        )

    season = Season(**season_data.model_dump())

    db.add(season)
    db.commit()
    db.refresh(season)

    return season


@router.patch(
    "/{season_id}",
    response_model=SeasonResponse,
)
def update_season(
    season_id: int,
    season_data: SeasonUpdate,
    db: Session = Depends(get_db),
):
    season = db.query(Season).filter(
        Season.id == season_id
    ).first()

    if season is None:
        raise HTTPException(
            status_code=404,
            detail="Season not found",
        )

    update_data = season_data.model_dump(exclude_unset=True)

    new_competition_id = update_data.get(
        "competition_id",
        season.competition_id,
    )

    competition = db.query(Competition).filter(
        Competition.id == new_competition_id
    ).first()

    if competition is None:
        raise HTTPException(
            status_code=404,
            detail="Competition not found",
        )

    new_slug = update_data.get("slug", season.slug)

    existing_season = db.query(Season).filter(
        Season.competition_id == new_competition_id,
        Season.slug == new_slug,
        Season.id != season_id,
    ).first()

    if existing_season:
        raise HTTPException(
            status_code=409,
            detail="A season with this slug already exists in this competition",
        )

    new_start_date = update_data.get(
        "start_date",
        season.start_date,
    )

    new_end_date = update_data.get(
        "end_date",
        season.end_date,
    )

    if (
        new_start_date is not None
        and new_end_date is not None
        and new_end_date < new_start_date
    ):
        raise HTTPException(
            status_code=422,
            detail="End date cannot be earlier than start date",
        )

    for field, value in update_data.items():
        setattr(season, field, value)

    db.commit()
    db.refresh(season)

    return season