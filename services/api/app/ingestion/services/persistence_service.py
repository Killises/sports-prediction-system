
from sqlalchemy.orm import Session

from app.models.sports import Sport
from app.models.data_source import DataSource
from app.models.external_id import ExternalID
from app.models.competition import Competition
from app.models.season import Season
from app.models.participant import Participant
from app.models.match import Match, MatchParticipant
from app.models.match_statistic import StatisticType
from app.models.match_statistic import MatchStatistic, StatisticType
from app.models.match_period import MatchPeriod


class PersistenceService:

    def get_or_create_data_source(self, db: Session, provider):
        source_slug = provider.name.lower().replace(" ", "-")

        source = db.query(DataSource).filter(
            DataSource.slug == source_slug
        ).first()

        if source is None:
            source = DataSource(
                name=provider.name,
                slug=source_slug,
                base_url=provider.base_url,
                is_active=True,
            )
            db.add(source)
            db.flush()

        return source

    def persist_sports(self, db: Session, provider, sports):
        source = self.get_or_create_data_source(db, provider)

        saved_sports = []

        try:
            for sport_data in sports:
                external_record = db.query(ExternalID).filter(
                    ExternalID.data_source_id == source.id,
                    ExternalID.entity_type == "sport",
                    ExternalID.external_id == sport_data.external_id,
                ).first()

                if external_record:
                    sport = db.query(Sport).filter(
                        Sport.id == external_record.entity_id
                    ).first()
                else:
                    sport = db.query(Sport).filter(
                        Sport.slug == sport_data.slug
                    ).first()

                if sport is None:
                    sport = Sport(
                        name=sport_data.name,
                        slug=sport_data.slug,
                        description=sport_data.description,
                        is_active=True,
                    )
                    db.add(sport)
                    db.flush()
                else:
                    sport.name = sport_data.name
                    sport.description = sport_data.description

                if external_record is None:
                    external_record = ExternalID(
                        data_source_id=source.id,
                        entity_type="sport",
                        entity_id=sport.id,
                        external_id=sport_data.external_id,
                    )
                    db.add(external_record)
                else:
                    external_record.entity_id = sport.id

                saved_sports.append(sport)

            db.commit()
            return saved_sports



        except Exception:
            db.rollback()
            raise


    def persist_competitions(self, db: Session, provider, competitions, sport_slug):
        source = self.get_or_create_data_source(db, provider)

        saved_competitions = []

        try:
            sport = db.query(Sport).filter(
                Sport.slug == sport_slug
            ).first()

            if sport is None:
                raise ValueError(
                    f"Sport '{sport_slug}' does not exist"
                )

            for competition_data in competitions:
                external_record = db.query(ExternalID).filter(
                    ExternalID.data_source_id == source.id,
                    ExternalID.entity_type == "competition",
                    ExternalID.external_id == competition_data.external_id,
                ).first()

                if external_record:
                    competition = db.query(Competition).filter(
                        Competition.id == external_record.entity_id
                    ).first()
                else:
                    competition = db.query(Competition).filter(
                        Competition.sport_id == sport.id,
                        Competition.slug == competition_data.slug,
                    ).first()

                if competition is None:
                    competition = Competition(
                        sport_id=sport.id,
                        name=competition_data.name,
                        slug=competition_data.slug,
                        country_code=competition_data.country_code,
                        is_active=True,
                    )
                    db.add(competition)
                    db.flush()
                else:
                    competition.name = competition_data.name
                    competition.country_code = competition_data.country_code

                if external_record is None:
                    external_record = ExternalID(
                        data_source_id=source.id,
                        entity_type="competition",
                        entity_id=competition.id,
                        external_id=competition_data.external_id,
                    )
                    db.add(external_record)
                else:
                    external_record.entity_id = competition.id

                saved_competitions.append(competition)

            db.commit()
            return saved_competitions

        except Exception:
            db.rollback()
            raise


    def persist_seasons(self, db: Session, provider, seasons, competition_id):
        source = self.get_or_create_data_source(db, provider)

        saved_seasons = []

        try:
            competition = db.query(Competition).filter(
                Competition.id == competition_id
            ).first()

            if competition is None:
                raise ValueError(
                    f"Competition with ID '{competition_id}' does not exist"
                )

            for season_data in seasons:
                external_record = db.query(ExternalID).filter(
                    ExternalID.data_source_id == source.id,
                    ExternalID.entity_type == "season",
                    ExternalID.external_id == season_data.external_id,
                ).first()

                if external_record:
                    season = db.query(Season).filter(
                        Season.id == external_record.entity_id
                    ).first()
                else:
                    season = db.query(Season).filter(
                        Season.competition_id == competition.id,
                        Season.slug == season_data.slug,
                    ).first()

                if season is None:
                    season = Season(
                        competition_id=competition.id,
                        name=season_data.name,
                        slug=season_data.slug,
                        start_date=season_data.start_date,
                        end_date=season_data.end_date,
                        is_current=season_data.is_current,
                    )
                    db.add(season)
                    db.flush()
                else:
                    season.name = season_data.name
                    season.start_date = season_data.start_date
                    season.end_date = season_data.end_date
                    season.is_current = season_data.is_current

                if external_record is None:
                    external_record = ExternalID(
                        data_source_id=source.id,
                        entity_type="season",
                        entity_id=season.id,
                        external_id=season_data.external_id,
                    )
                    db.add(external_record)
                else:
                    external_record.entity_id = season.id

                saved_seasons.append(season)

            db.commit()
            return saved_seasons

        except Exception:
            db.rollback()
            raise


    def persist_participants(self, db: Session, provider, participants, sport_slug):
        source = self.get_or_create_data_source(db, provider)

        saved_participants = []

        try:
            sport = db.query(Sport).filter(
                Sport.slug == sport_slug
            ).first()

            if sport is None:
                raise ValueError(
                    f"Sport '{sport_slug}' does not exist"
                )

            for participant_data in participants:
                external_record = db.query(ExternalID).filter(
                    ExternalID.data_source_id == source.id,
                    ExternalID.entity_type == "participant",
                    ExternalID.external_id == participant_data.external_id,
                ).first()

                if external_record:
                    participant = db.query(Participant).filter(
                        Participant.id == external_record.entity_id
                    ).first()
                else:
                    participant = db.query(Participant).filter(
                        Participant.sport_id == sport.id,
                        Participant.slug == participant_data.slug,
                    ).first()

                if participant is None:
                    participant = Participant(
                        sport_id=sport.id,
                        name=participant_data.name,
                        slug=participant_data.slug,
                        participant_type=participant_data.participant_type,
                        country_code=participant_data.country_code,
                        short_name=participant_data.short_name,
                        is_active=True,
                    )
                    db.add(participant)
                    db.flush()
                else:
                    participant.name = participant_data.name
                    participant.participant_type = participant_data.participant_type
                    participant.country_code = participant_data.country_code
                    participant.short_name = participant_data.short_name

                if external_record is None:
                    external_record = ExternalID(
                        data_source_id=source.id,
                        entity_type="participant",
                        entity_id=participant.id,
                        external_id=participant_data.external_id,
                    )
                    db.add(external_record)
                else:
                    external_record.entity_id = participant.id

                saved_participants.append(participant)

            db.commit()
            return saved_participants

        except Exception:
            db.rollback()
            raise



    def persist_matches(self, db: Session, provider, matches, season_id):
        source = self.get_or_create_data_source(db, provider)

        saved_matches = []

        try:
            season = db.query(Season).filter(
                Season.id == season_id
            ).first()

            if season is None:
                raise ValueError(
                    f"Season with ID '{season_id}' does not exist"
                )

            for match_data in matches:
                external_record = db.query(ExternalID).filter(
                    ExternalID.data_source_id == source.id,
                    ExternalID.entity_type == "match",
                    ExternalID.external_id == match_data.external_id,
                ).first()

                if external_record:
                    match = db.query(Match).filter(
                        Match.id == external_record.entity_id
                    ).first()
                else:
                    match = None

                if match is None:
                    match = Match(
                        season_id=season.id,
                        scheduled_at=match_data.scheduled_at,
                        status=match_data.status,
                        stage=match_data.stage,
                        round=match_data.round,
                        venue=match_data.venue,
                    )
                    db.add(match)
                    db.flush()
                else:
                    match.scheduled_at = match_data.scheduled_at
                    match.status = match_data.status
                    match.stage = match_data.stage
                    match.round = match_data.round
                    match.venue = match_data.venue

                if external_record is None:
                    external_record = ExternalID(
                        data_source_id=source.id,
                        entity_type="match",
                        entity_id=match.id,
                        external_id=match_data.external_id,
                    )
                    db.add(external_record)
                else:
                    external_record.entity_id = match.id

                participants = [
                    (match_data.home_participant_external_id, 1, "home"),
                    (match_data.away_participant_external_id, 2, "away"),
                ]

                for participant_external_id, position, role in participants:
                    participant_record = db.query(ExternalID).filter(
                        ExternalID.data_source_id == source.id,
                        ExternalID.entity_type == "participant",
                        ExternalID.external_id == participant_external_id,
                    ).first()

                    if participant_record is None:
                        raise ValueError(
                            f"Participant '{participant_external_id}' not found"
                        )

                    match_participant = db.query(MatchParticipant).filter(
                        MatchParticipant.match_id == match.id,
                        MatchParticipant.participant_id == participant_record.entity_id,
                    ).first()

                    if match_participant is None:
                        match_participant = MatchParticipant(
                            match_id=match.id,
                            participant_id=participant_record.entity_id,
                            position=position,
                            role=role,
                        )
                        db.add(match_participant)
                    else:
                        match_participant.position = position
                        match_participant.role = role

                saved_matches.append(match)

            db.commit()
            return saved_matches

        except Exception:
            db.rollback()
            raise


    def persist_statistic_types(self, db: Session, statistic_types, sport_slug):
        saved_types = []

        try:
            sport = db.query(Sport).filter(
                Sport.slug == sport_slug
            ).first()

            if sport is None:
                raise ValueError(
                    f"Sport '{sport_slug}' does not exist"
                )

            for statistic_data in statistic_types:
                statistic_type = db.query(StatisticType).filter(
                    StatisticType.sport_id == sport.id,
                    StatisticType.code == statistic_data.code,
                ).first()

                if statistic_type is None:
                    statistic_type = StatisticType(
                        sport_id=sport.id,
                        code=statistic_data.code,
                        name=statistic_data.name,
                        description=statistic_data.description,
                        unit=statistic_data.unit,
                    )
                    db.add(statistic_type)
                else:
                    statistic_type.name = statistic_data.name
                    statistic_type.description = statistic_data.description
                    statistic_type.unit = statistic_data.unit

                saved_types.append(statistic_type)

            db.commit()
            return saved_types

        except Exception:
            db.rollback()
            raise


    def persist_match_statistics(self, db, provider, statistics, match_id):
        saved_statistics = []

        try:
            match = db.query(Match).filter(
                Match.id == match_id
            ).first()

            if match is None:
                raise ValueError(
                    f"Match with ID '{match_id}' does not exist"
                )

            source = self.get_or_create_data_source(db, provider)

            for statistic_data in statistics:
                statistic_type = db.query(StatisticType).filter(
                    StatisticType.sport_id == match.season.competition.sport_id,
                    StatisticType.code == statistic_data.statistic_code,
                ).first()

                if statistic_type is None:
                    raise ValueError(
                        f"Statistic type '{statistic_data.statistic_code}' not found"
                    )

                match_participant_id = None

                if statistic_data.participant_external_id:
                    participant_record = db.query(ExternalID).filter(
                      ExternalID.data_source_id == source.id,
                      ExternalID.entity_type == "participant",
                      ExternalID.external_id == statistic_data.participant_external_id,
                    ).first()

                    if participant_record is None:
                        raise ValueError(
                            f"Participant '{statistic_data.participant_external_id}' not found"
                        )

                    match_participant = db.query(MatchParticipant).filter(
                        MatchParticipant.match_id == match.id,
                        MatchParticipant.participant_id == participant_record.entity_id,
                    ).first()

                    if match_participant is None:
                        raise ValueError(
                            "Participant is not associated with this match"
                        )

                    match_participant_id = match_participant.id

                match_period_id = None

                if statistic_data.period_number is not None:
                    match_period = db.query(MatchPeriod).filter(
                        MatchPeriod.match_id == match.id,
                        MatchPeriod.period_number == statistic_data.period_number,
                    ).first()

                    if match_period is None:
                        raise ValueError(
                            f"Period {statistic_data.period_number} not found"
                        )

                    match_period_id = match_period.id

                statistic = db.query(MatchStatistic).filter(
                    MatchStatistic.match_id == match.id,
                    MatchStatistic.statistic_type_id == statistic_type.id,
                    MatchStatistic.match_participant_id == match_participant_id,
                    MatchStatistic.match_period_id == match_period_id,
                ).first()

                if statistic is None:
                    statistic = MatchStatistic(
                        match_id=match.id,
                        statistic_type_id=statistic_type.id,
                        match_participant_id=match_participant_id,
                        match_period_id=match_period_id,
                    )
                    db.add(statistic)

                statistic.value_numeric = statistic_data.value_numeric
                statistic.value_text = statistic_data.value_text

                saved_statistics.append(statistic)

            db.commit()
            return saved_statistics

        except Exception:
            db.rollback()
            raise
