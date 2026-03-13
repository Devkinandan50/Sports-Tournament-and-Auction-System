import graphene
from django.db.models import F, OuterRef, Q, Subquery, Sum
from graphene_django import DjangoObjectType

from apps.core.models import AuctionConfig

from .models import Player, PlayerSportRating, Sport, SportPlacePoints, Team


# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------

class SportPlacePointsType(DjangoObjectType):
    class Meta:
        model = SportPlacePoints
        fields = ("id", "place", "points")


class SportType(DjangoObjectType):
    place_points = graphene.List(graphene.NonNull(SportPlacePointsType))

    class Meta:
        model = Sport
        fields = ("id", "name", "display_order")

    def resolve_place_points(self, info):
        return self.place_points.all()


class PlayerSportRatingType(DjangoObjectType):
    sport_name = graphene.String()

    class Meta:
        model = PlayerSportRating
        fields = ("id", "sport", "rating")

    def resolve_sport_name(self, info):
        return self.sport.name


class PlayerType(DjangoObjectType):
    ratings = graphene.List(graphene.NonNull(PlayerSportRatingType))

    class Meta:
        model = Player
        fields = (
            "id",
            "name",
            "company_email",
            "photo",
            "team",
            "sold_price",
            "is_sold",
        )

    def resolve_ratings(self, info):
        return self.ratings.select_related("sport").all()


class TeamType(DjangoObjectType):
    remaining_budget = graphene.Decimal()
    player_count = graphene.Int()
    players = graphene.List(graphene.NonNull(PlayerType))

    class Meta:
        model = Team
        fields = ("id", "name", "captain_name", "logo", "season")

    def resolve_remaining_budget(self, info):
        try:
            initial = self.season.auction_config.initial_budget
        except AuctionConfig.DoesNotExist:
            return None
        spent = (
            self.players.filter(is_sold=True).aggregate(total=Sum("sold_price"))[
                "total"
            ]
            or 0
        )
        return initial - spent

    def resolve_player_count(self, info):
        return self.players.filter(is_sold=True).count()

    def resolve_players(self, info):
        return self.players.all()


# ---------------------------------------------------------------------------
# Queries
# ---------------------------------------------------------------------------

class Query(graphene.ObjectType):
    sports = graphene.List(
        graphene.NonNull(SportType),
        season_id=graphene.ID(required=True),
    )
    teams = graphene.List(
        graphene.NonNull(TeamType),
        season_id=graphene.ID(required=True),
    )
    team = graphene.Field(TeamType, id=graphene.ID(required=True))
    players = graphene.List(
        graphene.NonNull(PlayerType),
        season_id=graphene.ID(required=True),
        sport_id=graphene.ID(),
        min_rating=graphene.Int(),
        unsold_only=graphene.Boolean(),
        search=graphene.String(),
        sort_by=graphene.String(),
    )

    def resolve_sports(self, info, season_id):
        return Sport.objects.filter(season_id=season_id)

    def resolve_teams(self, info, season_id):
        return Team.objects.filter(season_id=season_id).select_related(
            "season__auction_config"
        )

    def resolve_team(self, info, id):
        return Team.objects.select_related("season__auction_config").get(pk=id)

    def resolve_players(
        self,
        info,
        season_id,
        sport_id=None,
        min_rating=None,
        unsold_only=None,
        search=None,
        sort_by=None,
    ):
        qs = Player.objects.filter(season_id=season_id)

        if unsold_only:
            qs = qs.filter(is_sold=False)

        if search:
            qs = qs.filter(name__icontains=search)

        if sport_id:
            rating_filter = Q(ratings__sport_id=sport_id)
            if min_rating:
                rating_filter &= Q(ratings__rating__gte=min_rating)
            qs = qs.filter(rating_filter)

        if sort_by == "name":
            qs = qs.order_by("name")
        elif sort_by == "price":
            qs = qs.order_by(F("sold_price").desc(nulls_last=True))
        elif sort_by == "rating" and sport_id:
            qs = qs.annotate(
                _sport_rating=Subquery(
                    PlayerSportRating.objects.filter(
                        player=OuterRef("pk"), sport_id=sport_id
                    ).values("rating")[:1]
                )
            ).order_by(F("_sport_rating").desc(nulls_last=True))

        return qs.distinct()


# ---------------------------------------------------------------------------
# Mutation — player registration
# ---------------------------------------------------------------------------

class RatingInput(graphene.InputObjectType):
    sport_id = graphene.ID(required=True)
    rating = graphene.Int(required=True)


class RegisterPlayer(graphene.Mutation):
    class Arguments:
        season_id = graphene.ID(required=True)
        name = graphene.String(required=True)
        email = graphene.String(required=True)
        ratings = graphene.List(graphene.NonNull(RatingInput), required=True)

    ok = graphene.Boolean()
    player = graphene.Field(PlayerType)
    error = graphene.String()

    def mutate(self, info, season_id, name, email, ratings):
        config = AuctionConfig.objects.filter(season_id=season_id).first()
        if not config or not config.registration_open:
            return RegisterPlayer(ok=False, error="Registration is currently closed.")

        player = Player.objects.create(
            season_id=season_id,
            name=name,
            company_email=email,
        )

        for r in ratings:
            PlayerSportRating.objects.create(
                player=player,
                sport_id=r.sport_id,
                rating=r.rating,
            )

        return RegisterPlayer(ok=True, player=player)


class Mutation(graphene.ObjectType):
    register_player = RegisterPlayer.Field()
