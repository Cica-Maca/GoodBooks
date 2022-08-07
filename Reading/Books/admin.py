from django.contrib import admin

from .models import User, user_book, review

# Register your models here.

admin.site.register(User)
admin.site.register(user_book)
admin.site.register(review)