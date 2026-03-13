from django.db import models

from apps.core.models import Season
from apps.teams.models import Sport, Team


class MatchResult(models.Model):
    season = models.ForeignKey(
        Season, on_delete=models.CASCADE, related_name="match_results"
    )
    sport = models.ForeignKey(
        Sport, on_delete=models.CASCADE, related_name="match_results"
    )
    team = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name="match_results"
    )
    place = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sport", "place"]
        unique_together = ("sport", "team")

    def __str__(self):
        return f"{self.sport.name} — #{self.place} {self.team.name}"
