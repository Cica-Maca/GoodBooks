from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    genres = models.JSONField(default=list)
    reading_challenge = models.IntegerField(default=10)

class user_book(models.Model):
    user_id = models.ForeignKey(User, related_name="user", on_delete=models.CASCADE)
    book_isbn = models.TextField()
    to_read = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)
    is_reading = models.BooleanField(default=False)

class review(models.Model):
    user_id = models.ForeignKey(User, related_name="user_id", on_delete=models.CASCADE)
    book_id = models.TextField()
    review = models.TextField()