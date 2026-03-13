from django.db import models


class Season(models.Model):
    year = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=100)
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ["-year"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.is_current:
            Season.objects.filter(is_current=True).exclude(pk=self.pk).update(
                is_current=False
            )
        super().save(*args, **kwargs)


class Notice(models.Model):
    season = models.ForeignKey(
        Season, on_delete=models.CASCADE, related_name="notices"
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class AuctionConfig(models.Model):
    season = models.OneToOneField(
        Season, on_delete=models.CASCADE, related_name="auction_config"
    )
    registration_open = models.BooleanField(default=False)
    auction_active = models.BooleanField(default=False)
    min_bid_price = models.DecimalField(max_digits=10, decimal_places=2, default=500)
    initial_budget = models.DecimalField(max_digits=10, decimal_places=2, default=50000)
    rules = models.TextField(blank=True, default="")

    class Meta:
        verbose_name = "Auction Configuration"

    def __str__(self):
        return f"Auction Config — {self.season.name}"
