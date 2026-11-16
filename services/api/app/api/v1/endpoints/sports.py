from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.sports import Sport


router = APIRouter(
    prefix="/sports",
    tags=["Sports"],
)


@router.get("/")
def get_sports(
    active_only: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    query = db.query(Sport)

    if active_only:
        query = query.filter(Sport.is_active.is_(True))

    sports = query.order_by(Sport.id).all()

    return [
        {
            "id": sport.id,
            "name": sport.name,
            "slug": sport.slug,
            "description": sport.description,
            "is_active": sport.is_active,
        }
        for sport in sports
    ]
