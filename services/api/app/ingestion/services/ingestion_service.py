from app.ingestion.services.validator import (
    validate_sports,
    validate_competitions,
    validate_seasons,
    validate_participants,
    validate_matches,
    validate_statistic_types,
    validate_match_statistics,
)


class IngestionService:
    def __init__(self, provider):
        self.provider = provider

    def ingest_sports(self):
        raw_sports = self.provider.get_sports()
        return validate_sports(raw_sports)

    def ingest_competitions(self, sport_slug):
        raw_competitions = self.provider.get_competitions(
            sport_slug
        )
        return validate_competitions(raw_competitions)

    def ingest_seasons(self, competition_id):
        raw_seasons = self.provider.get_seasons(
            competition_id
        )
        return validate_seasons(raw_seasons)

    def ingest_participants(self, sport_slug):
        raw_participants = self.provider.get_participants(
            sport_slug
        )
        return validate_participants(raw_participants)

    def ingest_matches(self, competition_id):
        raw_matches = self.provider.get_matches(
            competition_id
        )
        return validate_matches(raw_matches)

    def ingest_statistic_types(self, sport_slug):
        return validate_statistic_types(
            self.provider.get_statistic_types(sport_slug)
        )

    def ingest_match_statistics(self, match_external_id):
        return validate_match_statistics(
            self.provider.get_match_statistics(match_external_id)
        )

    def sync_statistic_types(self, db, persistence_service, sport_slug):
        statistic_types = self.ingest_statistic_types(sport_slug)

        return persistence_service.persist_statistic_types(
            db,
            statistic_types,
            sport_slug,
        )

    def sync_match_statistics(
        self,
        db,
        persistence_service,
        match_external_id,
        match_id,
    ):
        statistics = self.ingest_match_statistics(match_external_id)

        return persistence_service.persist_match_statistics(
          db,
          self.provider,
          statistics,
          match_id,
      )
