import graphene
from django.db.models import Sum
from graphene_django import DjangoObjectType

from apps.teams.models import SportPlacePoints, Team

from .models import MatchResult


class MatchResultType(DjangoObjectType):
    points = graphene.Int()
    team_name = graphene.String()
    sport_name = graphene.String()

    class Meta:
        model = MatchResult
        fields = ("id", "sport", "team", "place", "created_at")

    def resolve_points(self, info):
        pp = SportPlacePoints.objects.filter(
            sport=self.sport, place=self.place
        ).first()
        return pp.points if pp else 0

    def resolve_team_name(self, info):
        return self.team.name

    def resolve_sport_name(self, info):
        return self.sport.name


class SportPointsType(graphene.ObjectType):
    sport_id = graphene.ID()
    sport_name = graphene.String()
    place = graphene.Int()
    points = graphene.Int()


class LeaderboardEntryType(graphene.ObjectType):
    team_id = graphene.ID()
    team_name = graphene.String()
    captain_name = graphene.String()
    logo = graphene.String()
    total_points = graphene.Int()
    sport_points = graphene.List(SportPointsType)


class Query(graphene.ObjectType):
    match_results = graphene.List(
        graphene.NonNull(MatchResultType),
        season_id=graphene.ID(required=True),
        sport_id=graphene.ID(),
    )
    leaderboard = graphene.List(
        graphene.NonNull(LeaderboardEntryType),
        season_id=graphene.ID(required=True),
    )

    def resolve_match_results(self, info, season_id, sport_id=None):
        qs = MatchResult.objects.filter(season_id=season_id).select_related(
            "sport", "team"
        )
        if sport_id:
            qs = qs.filter(sport_id=sport_id)
        return qs

    def resolve_leaderboard(self, info, season_id):
        teams = Team.objects.filter(season_id=season_id)
        results = MatchResult.objects.filter(season_id=season_id).select_related(
            "sport", "team"
        )

        points_map = {}
        for pp in SportPlacePoints.objects.filter(
            sport__season_id=season_id
        ).select_related("sport"):
            points_map[(pp.sport_id, pp.place)] = pp.points

        team_data = {}
        for team in teams:
            team_data[team.id] = {
                "team_id": team.id,
                "team_name": team.name,
                "captain_name": team.captain_name,
                "logo": team.logo.url if team.logo else None,
                "total_points": 0,
                "sport_points": [],
            }

        for result in results:
            pts = points_map.get((result.sport_id, result.place), 0)
            entry = team_data.get(result.team_id)
            if entry:
                entry["total_points"] += pts
                entry["sport_points"].append(
                    SportPointsType(
                        sport_id=result.sport_id,
                        sport_name=result.sport.name,
                        place=result.place,
                        points=pts,
                    )
                )

        entries = sorted(
            team_data.values(), key=lambda e: e["total_points"], reverse=True
        )
        return [LeaderboardEntryType(**e) for e in entries]
