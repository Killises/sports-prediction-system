
from typing import Any, Dict, List

from app.ingestion.providers.base import BaseProvider


class MockProvider(BaseProvider):
    """
    Mock provider for testing the ingestion architecture.
    """

    def __init__(self):
        super().__init__(
            name="Mock Sports Provider",
            base_url="https://mock.example.com",
        )

    def get_sports(self) -> List[Dict[str, Any]]:
        return [
            {"external_id": "football", "name": "Football", "slug": "football"},
            {"external_id": "basketball", "name": "Basketball", "slug": "basketball"},
            {"external_id": "tennis", "name": "Tennis", "slug": "tennis"},
        ]

    def get_competitions(self, sport: str) -> List[Dict[str, Any]]:
        if sport == "football":
            return [
                {
                    "external_id": "premier-league",
                    "name": "Premier League",
                    "slug": "premier-league",
                    "country_code": "GB",
                }
            ]
        return []


    def get_seasons(self, competition_id: str) -> List[Dict[str, Any]]:
        if competition_id == "premier-league":
            return [
                {
                    "external_id": "premier-league-2026-2027",
                    "name": "Premier League 2026/27",
                    "slug": "2026-2027",
                    "start_date": "2026-08-01",
                    "end_date": "2027-05-31",
                    "is_current": True,
                }
            ]

        return []


    def get_participants(self, sport: str) -> List[Dict[str, Any]]:
        if sport == "football":
            return [
                {
                    "external_id": "arsenal",
                    "name": "Arsenal FC",
                    "slug": "arsenal-fc",
                    "participant_type": "team",
                    "country_code": "GB",
                    "short_name": "ARS",
                },
                {
                    "external_id": "liverpool",
                    "name": "Liverpool FC",
                    "slug": "liverpool-fc",
                    "participant_type": "team",
                    "country_code": "GB",
                    "short_name": "LIV",
                },
            ]
        return []

    def get_matches(self, competition_id: str) -> List[Dict[str, Any]]:
        if competition_id == "premier-league":
            return [
                {
                    "external_id": "match-001",
                    "home_participant_external_id": "arsenal",
                    "away_participant_external_id": "liverpool",
                    "status": "scheduled",
                }
            ]
        return []

    def get_statistic_types(self, sport):
        if sport == "football":
            return [
                {
                    "code": "goals",
                    "name": "Goals",
                    "description": "Total goals scored",
                    "unit": "goals",
                },
                {
                    "code": "possession",
                    "name": "Possession",
                    "description": "Percentage of ball possession",
                    "unit": "percentage",
                },
            ]
        return []

    def get_match_statistics(self, match_id):
        if match_id == "match-001":
            return [
                {
                    "statistic_code": "goals",
                    "value_numeric": 2,
                    "participant_external_id": "arsenal",
                },
                {
                    "statistic_code": "possession",
                    "value_numeric": 58.5,
                    "participant_external_id": "arsenal",
                },
            ]
        return []
