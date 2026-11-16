from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.competition import Competition


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
