from django.contrib import admin

from .models import Player, PlayerSportRating, Sport, SportPlacePoints, Team


class SportPlacePointsInline(admin.TabularInline):
    model = SportPlacePoints
    extra = 1


@admin.register(Sport)
class SportAdmin(admin.ModelAdmin):
    list_display = ("name", "season", "display_order")
    list_filter = ("season",)
    inlines = [SportPlacePointsInline]


class PlayerInline(admin.TabularInline):
    model = Player
    fields = ("name", "company_email", "is_sold", "sold_price")
    readonly_fields = ("name", "company_email")
    extra = 0
    show_change_link = True


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "captain_name", "season")
    list_filter = ("season",)
    search_fields = ("name", "captain_name")
    inlines = [PlayerInline]


class PlayerSportRatingInline(admin.TabularInline):
    model = PlayerSportRating
    extra = 0


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ("name", "company_email", "season", "team", "is_sold", "sold_price")
    list_filter = ("season", "is_sold", "team")
    search_fields = ("name", "company_email")
    list_editable = ("team", "is_sold", "sold_price")
    inlines = [PlayerSportRatingInline]
