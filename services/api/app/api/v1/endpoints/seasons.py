
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.season import Season


router = APIRouter(
    prefix="/seasons",
    tags=["Seasons"],
)


@router.get("/")
def get_seasons(
    competition_id: int = Query(default=None, ge=1),
    current_only: bool = Query(default=True),
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

    seasons = query.order_by(Season.id).all()

    return [
        {
            "id": season.id,
            "competition_id": season.competition_id,
            "name": season.name,
            "slug": season.slug,
            "start_date": season.start_date,
            "end_date": season.end_date,
            "is_current": season.is_current,
        }
        for season in seasons
    ]
