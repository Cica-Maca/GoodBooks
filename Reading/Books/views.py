from cmath import e
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from logging import exception
from django.shortcuts import redirect, render, resolve_url
from django.http import HttpResponse
from django.db import IntegrityError
from .models import User
import requests
import json

# Create your views here.

def index(request):
    genres = ["Fantasy", "Crime", "Romance", "Horror", "Biography"]
    if request.user.is_authenticated:
        user = User.objects.get(username=request.user.username)
        genres = user.genres

    Top_this_week = top_books()
    return render(request, "Books/index.html", {
        "top_books": Top_this_week,
        "genres": genres
    })

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        email = request.POST["email"]
        genres = request.POST.getlist("genres")
        confirm = request.POST["password-repeat"]
        if not (username and password and email and genres and confirm):
            return render(request, "Books/register.html", {
                "message": "Invalid inputs."
            })
        if len(genres) < 3:
            return render(request, "Books/register.html", {
                "message": "Please pick 3 favourite genres."
            })
        if password != confirm: 
            return render(request, "Books/register.html", {
                "message": "Passwords do not match!"
            })
        try:
            user = User.objects.create_user(username, email, password, genres=genres)
            user.save()
        except IntegrityError:
            return render(request, "Books/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
        
    return render(request, "Books/register.html")


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is None:
            print("greska")
            return HttpResponseRedirect(reverse("index"))
        login(request, user)
        return HttpResponseRedirect(reverse("index"))

    return render(request, "Books/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))

def book_page(request, isbn):
    url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
    book_data = requests.get(url=url).json()
    book = {}
    book["title"] = book_data["items"][0]["volumeInfo"]["title"]
    try:
        book["author"] = [book_data["items"][0]["volumeInfo"]["authors"][0], book_data["items"][0]["volumeInfo"]["authors"][1]]
        book["more"] = "True"
    except:
        book["author"] = book_data["items"][0]["volumeInfo"]["authors"][0]

    book["date"] = book_data["items"][0]["volumeInfo"]["publishedDate"]
    book["desc"] = book_data["items"][0]["volumeInfo"]["description"]
    book["page_count"] = book_data["items"][0]["volumeInfo"]["pageCount"]
    try:
        book["rating"] = book_data["items"][0]["volumeInfo"]["averageRating"]
    except:
        book["rating"] = '0'
    book["image"] = book_data["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"]
    return render(request, "books/book_page.html", {
        "book" : book
    })

def quotes(request):
    return render(request, "books/quotes.html")

def BookToLink(request, title):
    url = f"https://www.googleapis.com/books/v1/volumes?q={title}&printType=books"
    book_data = requests.get(url=url).json()
    isbn = book_data["items"][0]["volumeInfo"]["industryIdentifiers"][0]["identifier"]
    return HttpResponseRedirect(resolve_url('book_page', isbn))

def top_books():
    url = "https://api.nytimes.com/svc/books/v3/lists/current/combined-print-and-e-book-fiction.json?api-key=dJm5Qeq1IAZgEJ7j6YmBAPLWA23SrzdP"
    data = requests.get(url=url).json()
    books = []
    for i in range(15):
        if data['results']['books'][i]['primary_isbn10'] == "None":
            isbn = data['results']['books'][i]['primary_isbn13']
        else: 
            isbn = data['results']['books'][i]['primary_isbn10']
        books.append({"title":data['results']['books'][i]['title'].lower().capitalize(), "isbn": isbn, "image": data['results']['books'][i]['book_image'], "desc": data['results']['books'][i]['description'], "author": data['results']['books'][i]['author']})
    return books