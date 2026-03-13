from django.db import models

from apps.core.models import Season


class Sport(models.Model):
    season = models.ForeignKey(
        Season, on_delete=models.CASCADE, related_name="sports"
    )
    name = models.CharField(max_length=100)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]
        unique_together = ("season", "name")

    def __str__(self):
        return f"{self.name} ({self.season.year})"


class SportPlacePoints(models.Model):
    sport = models.ForeignKey(
        Sport, on_delete=models.CASCADE, related_name="place_points"
    )
    place = models.PositiveIntegerField()
    points = models.PositiveIntegerField()

    class Meta:
        ordering = ["place"]
        unique_together = ("sport", "place")
        verbose_name = "Place → Points"
        verbose_name_plural = "Place → Points"

    def __str__(self):
        return f"#{self.place} → {self.points} pts"


class Team(models.Model):
    season = models.ForeignKey(
        Season, on_delete=models.CASCADE, related_name="teams"
    )
    name = models.CharField(max_length=100)
    captain_name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="team_logos/", blank=True)

    class Meta:
        ordering = ["name"]
        unique_together = ("season", "name")

    def __str__(self):
        return f"{self.name} ({self.season.year})"


class Player(models.Model):
    season = models.ForeignKey(
        Season, on_delete=models.CASCADE, related_name="players"
    )
    name = models.CharField(max_length=100)
    company_email = models.EmailField()
    photo = models.ImageField(upload_to="player_photos/", blank=True)
    team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="players",
    )
    sold_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    is_sold = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PlayerSportRating(models.Model):
    player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="ratings"
    )
    sport = models.ForeignKey(
        Sport, on_delete=models.CASCADE, related_name="ratings"
    )
    rating = models.PositiveIntegerField()

    class Meta:
        unique_together = ("player", "sport")
        verbose_name = "Sport Rating"

    def __str__(self):
        return f"{self.player.name} — {self.sport.name}: {self.rating}"
