import graphene
from graphene_django import DjangoObjectType

from .models import AuctionConfig, Notice, Season


class SeasonType(DjangoObjectType):
    class Meta:
        model = Season
        fields = ("id", "year", "name", "is_current")


class NoticeType(DjangoObjectType):
    class Meta:
        model = Notice
        fields = ("id", "title", "content", "is_active", "created_at", "updated_at")


class AuctionConfigType(DjangoObjectType):
    class Meta:
        model = AuctionConfig
        fields = (
            "id",
            "registration_open",
            "auction_active",
            "min_bid_price",
            "initial_budget",
            "rules",
        )


class Query(graphene.ObjectType):
    current_season = graphene.Field(SeasonType)
    seasons = graphene.List(graphene.NonNull(SeasonType))
    notices = graphene.List(
        graphene.NonNull(NoticeType),
        season_id=graphene.ID(required=True),
    )
    auction_config = graphene.Field(
        AuctionConfigType,
        season_id=graphene.ID(required=True),
    )

    def resolve_current_season(self, info):
        return Season.objects.filter(is_current=True).first()

    def resolve_seasons(self, info):
        return Season.objects.all()

    def resolve_notices(self, info, season_id):
        return Notice.objects.filter(season_id=season_id, is_active=True)

    def resolve_auction_config(self, info, season_id):
        return AuctionConfig.objects.filter(season_id=season_id).first()
