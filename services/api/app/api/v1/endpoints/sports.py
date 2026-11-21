from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.sports import Sport
from app.schemas.sport import SportCreate, SportUpdate, SportResponse


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
    
@router.post(
    "/",
    response_model=SportResponse,
    status_code=status.HTTP_201_CREATED,
)
    
def create_sport(
    sport_data: SportCreate,
    db: Session = Depends(get_db),
):
    existing_sport = db.query(Sport).filter(
        (Sport.name == sport_data.name) |
        (Sport.slug == sport_data.slug)
    ).first()

    if existing_sport:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A sport with this name or slug already exists",
        )

    new_sport = Sport(
        name=sport_data.name,
        slug=sport_data.slug,
        description=sport_data.description,
        is_active=sport_data.is_active,
    )

    db.add(new_sport)
    db.commit()
    db.refresh(new_sport)

    return new_sport

@router.patch(
    "/{sport_id}",
    response_model=SportResponse,
)
def update_sport(
    sport_id: int,
    sport_data: SportUpdate,
    db: Session = Depends(get_db),
):
    sport = db.query(Sport).filter(
        Sport.id == sport_id
    ).first()

    if not sport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sport not found",
        )

    update_data = sport_data.model_dump(exclude_unset=True)

    if "name" in update_data or "slug" in update_data:
        new_name = update_data.get("name", sport.name)
        new_slug = update_data.get("slug", sport.slug)

        existing_sport = db.query(Sport).filter(
            Sport.id != sport_id,
            (Sport.name == new_name) |
            (Sport.slug == new_slug)
        ).first()

        if existing_sport:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A sport with this name or slug already exists",
            )

    for field, value in update_data.items():
        setattr(sport, field, value)

    db.commit()
    db.refresh(sport)

    return sport