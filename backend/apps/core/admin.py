from django.contrib import admin

from .models import AuctionConfig, Notice, Season


class AuctionConfigInline(admin.StackedInline):
    model = AuctionConfig
    can_delete = False
    extra = 0


@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ("year", "name", "is_current")
    list_editable = ("is_current",)
    inlines = [AuctionConfigInline]


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ("title", "season", "is_active", "created_at")
    list_filter = ("season", "is_active")
    search_fields = ("title", "content")
    list_editable = ("is_active",)


@admin.register(AuctionConfig)
class AuctionConfigAdmin(admin.ModelAdmin):
    list_display = (
        "season",
        "registration_open",
        "auction_active",
        "min_bid_price",
        "initial_budget",
    )
    list_filter = ("season",)
