
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
    func,
)

from app.db.session import Base


class ExternalID(Base):
    __tablename__ = "external_ids"

    __table_args__ = (
        UniqueConstraint(
            "data_source_id",
            "entity_type",
            "external_id",
            name="uq_external_id_source_entity_external",
        ),
        UniqueConstraint(
            "data_source_id",
            "entity_type",
            "entity_id",
            name="uq_external_id_source_entity_internal",
        ),
        CheckConstraint(
            "entity_type IN "
            "('sport', 'competition', 'season', 'participant', 'match')",
            name="ck_external_id_entity_type",
        ),
    )

    id = Column(Integer, primary_key=True)

    data_source_id = Column(
        Integer,
        ForeignKey("data_sources.id", ondelete="RESTRICT"),
        nullable=False,
    )

    entity_type = Column(String(30), nullable=False)
    entity_id = Column(Integer, nullable=False)
    external_id = Column(String(150), nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    def __repr__(self):
        return (
            f"<ExternalID(id={self.id}, "
            f"type='{self.entity_type}', "
            f"external_id='{self.external_id}')>"
        )
