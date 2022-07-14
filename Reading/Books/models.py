from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    genres = models.JSONField(default=list)

class user_book(models.Model):
    user_id = models.ForeignKey(User, related_name="user", on_delete=models.CASCADE)
    book_isbn = models.IntegerField()
    to_read = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)
    is_reading = models.BooleanField(default=False)