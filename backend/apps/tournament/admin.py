from django.contrib import admin

from .models import MatchResult


@admin.register(MatchResult)
class MatchResultAdmin(admin.ModelAdmin):
    list_display = ("sport", "team", "place", "season", "created_at")
    list_filter = ("season", "sport")
    search_fields = ("team__name",)
