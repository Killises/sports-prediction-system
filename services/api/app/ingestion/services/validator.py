
from app.ingestion.schemas.sport import SportSchema
from app.ingestion.schemas.competition import CompetitionSchema
from app.ingestion.schemas.participant import ParticipantSchema
from app.ingestion.schemas.match import MatchSchema
from app.ingestion.schemas.season import SeasonSchema
from app.ingestion.schemas.statistic import (
    StatisticTypeSchema,
    MatchStatisticSchema,
)


def validate_sports(data):
    return [SportSchema(**item) for item in data]


def validate_competitions(data):
    return [CompetitionSchema(**item) for item in data]


def validate_participants(data):
    return [ParticipantSchema(**item) for item in data]


def validate_matches(data):
    return [MatchSchema(**item) for item in data]


def validate_seasons(data):
    return [SeasonSchema(**item) for item in data]

def validate_statistic_types(data):
    return [
        StatisticTypeSchema(**item)
        for item in data
    ]


def validate_match_statistics(data):
    return [
        MatchStatisticSchema(**item)
        for item in data
    ]
