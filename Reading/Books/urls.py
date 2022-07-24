from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name='index'),
    path("register", views.register, name="register"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("show/<str:isbn>", views.book_page, name="book_page"),
    path("quotes", views.quotes, name="quotes"),
    path("toisbn/<str:title>", views.BookToLink, name="toisbn"),
    path("state", views.BookState, name="bookstate"),
    path("advanced", views.advanced_search, name="advanced")
]