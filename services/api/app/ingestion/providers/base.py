
from abc import ABC, abstractmethod
from typing import Any, Dict, List


class BaseProvider(ABC):
    """
    Interface base for all external sports data providers.
    """

    def __init__(self, name: str, base_url: str):
        self.name = name
        self.base_url = base_url

    @abstractmethod
    def get_sports(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_competitions(self, sport: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_participants(self, sport: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_matches(self, competition_id: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_seasons(self, competition_id: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_statistic_types(self, sport: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_match_statistics(self, match_id: str) -> List[Dict[str, Any]]:
        pass
