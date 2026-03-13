from django.test import TestCase

from .models import Item


class ItemModelTest(TestCase):
    def test_create_item(self):
        item = Item.objects.create(name="Test Item", description="A test item")
        self.assertEqual(str(item), "Test Item")
        self.assertEqual(Item.objects.count(), 1)

    def test_default_ordering(self):
        Item.objects.create(name="First")
        Item.objects.create(name="Second")
        items = list(Item.objects.values_list("name", flat=True))
        self.assertEqual(items, ["Second", "First"])
