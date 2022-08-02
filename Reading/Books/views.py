from cmath import e
from pydoc import resolve
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from logging import exception
from django.shortcuts import redirect, render, resolve_url
from django.http import HttpResponse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from .models import User, user_book
import requests
import json


def index(request):
    genres = ["Fantasy", "Crime", "Romance", "Horror", "Biography"]
    if request.user.is_authenticated:
        genres = request.user.genres

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
                "error": "Invalid inputs."
            })
        if len(genres) < 3:
            return render(request, "Books/register.html", {
                "error": "Please pick 3 favourite genres."
            })
        if password != confirm: 
            return render(request, "Books/register.html", {
                "error": "Passwords do not match!"
            })
        try:
            user = User.objects.create_user(username, email, password, genres=genres)
            user.save()
        except IntegrityError:
            return render(request, "Books/register.html", {
                "error": "Username already taken."
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
            return HttpResponseRedirect(reverse("index"))
        login(request, user)
        return HttpResponseRedirect(reverse("index"))

    return render(request, "Books/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))

def book_page(request, isbn):
    book = {}
    book_id_or_isbn = ""
    if isbn.isdigit():
        url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
        book_data = requests.get(url=url).json()
        book["title"] = book_data["items"][0]["volumeInfo"]["title"]
        try:
            book["author"] = [book_data["items"][0]["volumeInfo"]["authors"][0], book_data["items"][0]["volumeInfo"]["authors"][1]]
            book["more"] = "True"
        except:
            book["author"] = book_data["items"][0]["volumeInfo"]["authors"][0]
        book_id_or_isbn = book_data["items"][0]["id"]
        book["date"] = book_data["items"][0]["volumeInfo"]["publishedDate"]
        book["id"] = book_data["items"][0]["id"]
        book["desc"] = book_data["items"][0]["volumeInfo"]["description"] if "description" in book_data["items"][0]["volumeInfo"] else "No description"
        book["page_count"] = book_data["items"][0]["volumeInfo"]["pageCount"]
            
        book["rating"] = book_data["items"][0]["volumeInfo"]["averageRating"] if "averageRating" in book_data["items"][0]["volumeInfo"] else "0"
        book["image"] = book_data["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"]
    else: # If not digit, isbn is then an id of a book.
        book_id_or_isbn = isbn
        url = f"https://www.googleapis.com/books/v1/volumes/{isbn}"
        book_data = requests.get(url=url).json()
        book["title"] = book_data["volumeInfo"]["title"]
        book["id"] = isbn
        try:
            book["author"] = [book_data["volumeInfo"]["authors"][0], book_data["volumeInfo"]["authors"][1]]
            book["more"] = "True"
        except:
            book["author"] = book_data["volumeInfo"]["authors"][0]
        book["date"] = book_data["volumeInfo"]["publishedDate"]
        
        book["desc"] = book_data["volumeInfo"]["description"] if "description" in book_data["volumeInfo"] else "No description"
        book["page_count"] = book_data["volumeInfo"]["pageCount"]
        book["rating"] = book_data["volumeInfo"]["averageRating"] if "rating" in book_data["volumeInfo"] else '0'
        book["image"] = book_data["volumeInfo"]["imageLinks"]["thumbnail"]

    print(book_id_or_isbn)
    info_book_bool = False
    if request.user.is_authenticated:
        user = request.user
        try:
            users_book = user_book.objects.get(user_id=user, book_isbn=book_id_or_isbn)
            if users_book.is_read:
                info_book_bool = "Read"
            elif users_book.to_read:
                info_book_bool = "Want to read"
            elif users_book.is_reading:
                info_book_bool = "Currently reading"
        except:
            pass
    return render(request, "books/book_page.html", {
        "book" : book,
        "info_book": info_book_bool
    })

def quotes(request):
    return render(request, "books/quotes.html")

def BookToLink(request, title):
    url = f"https://www.googleapis.com/books/v1/volumes?q={title}&printType=books"
    book_data = requests.get(url=url).json()
    isbn = book_data["items"][0]["volumeInfo"]["industryIdentifiers"][0]["identifier"]
    return HttpResponseRedirect(resolve_url('book_page', isbn))

def BookState(request):
    if request.method != "PUT":
        return HttpResponseRedirect(resolve_url('index'))
    data = json.loads(request.body)
    if data['bookState'] == "Read":
        user_book.objects.update_or_create(user_id=request.user, book_isbn=data['isbn'], defaults={'is_read':True, 'to_read':False, 'is_reading':False})
    elif data['bookState'] == "Want to read":
        user_book.objects.update_or_create(user_id=request.user, book_isbn=data['isbn'], defaults={'is_read':False, 'to_read':True, 'is_reading':False})
    elif data['bookState'] == "Currently reading":
        user_book.objects.update_or_create(user_id=request.user, book_isbn=data['isbn'], defaults={'is_read':False, 'to_read':False, 'is_reading':True})
    elif data['bookState'] == "Remove":
        user_book.objects.get(user_id=request.user, book_isbn=data['isbn']).delete()
    return JsonResponse({"message": "Success"}, status=201)

def advanced_search(request):
    return render(request, "books/advancedSearch.html")

def profile(request):
    return render(request, "books/profile.html")

def library(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse(index))
    userBooks = user_book.objects.filter(user_id=request.user, is_read=True)
    wantRead = user_book.objects.filter(user_id=request.user, to_read=True)
    reading = user_book.objects.filter(user_id=request.user, is_reading=True)
    readingChallenge = request.user.reading_challenge
    userBooksNumber = user_book.objects.filter(user_id=request.user, is_read=True).count()
    return render(request, "books/library.html", {
        "Books": userBooks,
        "booksRead": userBooksNumber,
        "Percentage": userBooksNumber / 20 * 100,
        "wantRead": wantRead,
        "reading": reading
    })


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