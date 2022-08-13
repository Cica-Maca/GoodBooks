from cmath import e
from email.policy import HTTP
from pydoc import resolve
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from logging import exception
from django.shortcuts import redirect, render, resolve_url
from django.http import HttpResponse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from .models import User, user_book, review
from django.contrib.auth.decorators import login_required
import requests
import json


def index(request):
    genres = ["Fantasy", "Crime", "Romance", "Horror", "Biography"] # Default genres if the user is not logged in.
    if request.user.is_authenticated:
        genres = request.user.genres # Getting the genres the user selected
    error = getError(request.session)
    Top_this_week = top_books() # Calling top_books function which returns an array of dictionaries with info for every bestselling book this week.
    return render(request, "Books/index.html", {
        "top_books": Top_this_week,
        "genres": genres,
        "error": error
    })

def register(request):
    if request.method == "POST":
        # Getting the POST data and checking if it is valid, if not display error message.
        username = request.POST["username"]
        password = request.POST["password"]
        email = request.POST["email"]
        genres = request.POST.getlist("genres")
        confirm = request.POST["password-repeat"]
        challenge = request.POST["reading-challenge"]
        if not challenge:
            challenge = 10
        if not (username and password and email and genres and confirm):
            makeError(request.session, "Invalid inputs.")
            return HttpResponseRedirect(reverse("register"))
        if len(genres) < 3:
            makeError(request.session, "Pick atleast 3 favourite genres.")
            return HttpResponseRedirect(reverse("register"))
        if password != confirm: 
            makeError(request.session, "Passwords do not match!")
            return HttpResponseRedirect(reverse("register"))
        try:
            user = User.objects.create_user(username, email, password, genres=genres, reading_challenge=challenge)
            user.save()
        except IntegrityError:
            makeError(request.session, "Username already taken.")
            return HttpResponseRedirect(reverse("register"))
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
        
    return render(request, "Books/register.html")


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is None:
            # If the user with the entered info doesn't exist, redirect to index and display an error.
            makeError(request.session, "You have entered your username or password incorrectly.")
            return HttpResponseRedirect(reverse("index"))
        login(request, user)
        return HttpResponseRedirect(reverse("index"))

    return render(request, "Books/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))

def book_page(request, id):
    if request.method == "POST": # POST method means the user wants to submit his own review to the book page.
        userReview = request.POST["review"] # Getting the review input
        if not request.user: # Checking if the user is logged in.
            return HttpResponseRedirect(resolve_url('book_page', id))
        if not userReview: # Checking if the review is empty or not.
            return HttpResponseRedirect(resolve_url('book_page', id))
        if review.objects.filter(user_id=request.user, book_id=id).exists(): # Checking if the user already reviewed the same book.
            makeError(request.session, "You already have a review for that book.") # If yes redirect to book page and display an error.
            return HttpResponseRedirect(resolve_url('book_page', id))
        review(user_id=request.user, book_id=id, review=userReview).save() # If the review is valid, save into db and redirect.
        return HttpResponseRedirect(resolve_url('book_page', id)) 
    if request.method == "DELETE": # DELETE is used if the user wants to delete the review.
        if not request.user: # Checking if the user is logged in.
            return JsonResponse({"message": "Error, not logged in."}, status=400)
        data = json.loads(request.body) # Getting the json data from fetch.
        userWhoWantsToDelete = data["user"] # Getting the user who is trying to delete the review.
        if userWhoWantsToDelete == str(request.user): # Delete the review only if the user who sends the request is the same as the logged in user.
            try:
                review.objects.get(user_id=request.user, book_id=id).delete() # Getting the review and deleting it.
                return JsonResponse({"message": "Success"}, status=201)
            except:
                return JsonResponse({"message": "Error"}, status=400)
        else:
            return JsonResponse({"message": "Error"}, status=400)


    book = {} # Intializing a dict, used for storing book data.
    book_id_or_isbn = ""

    """ top_books() function sends request to nytimes api to get the weekly top books, this api returns the isbn of the book. 
        Google books api returns different json data if using the isbn instead of the google books id of the book.
        For this reason there is a check to determine if the id is isbn or an actual id.
    """
    if id.isdigit() or (id[:-1].isdigit() and id[-1] == "X"): # Checking if the id is isbn (Checking if it is a digit or if the last character is X and the rest of the chars are digits.)
        url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{id}" 
        book_data = requests.get(url=url).json() # Requesting data in json
        book["title"] = book_data["items"][0]["volumeInfo"]["title"]
        try:
            book["author"] = [book_data["items"][0]["volumeInfo"]["authors"][0], book_data["items"][0]["volumeInfo"]["authors"][1]]
            book["more"] = "True" # If there is more than 1 author
        except:
            book["author"] = book_data["items"][0]["volumeInfo"]["authors"][0]
        book_id_or_isbn = book_data["items"][0]["id"]
        book["date"] = book_data["items"][0]["volumeInfo"]["publishedDate"]
        book["id"] = book_data["items"][0]["id"]
        book["desc"] = book_data["items"][0]["volumeInfo"]["description"] if "description" in book_data["items"][0]["volumeInfo"] else "No description"
        book["page_count"] = book_data["items"][0]["volumeInfo"]["pageCount"]
            
        book["rating"] = book_data["items"][0]["volumeInfo"]["averageRating"] if "averageRating" in book_data["items"][0]["volumeInfo"] else "0"
        book["image"] = book_data["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"]
    else: # Case if it is not an isbn
        book_id_or_isbn = id
        url = f"https://www.googleapis.com/books/v1/volumes/{id}"
        book_data = requests.get(url=url).json()
        book["title"] = book_data["volumeInfo"]["title"]
        book["id"] = id
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

    info_book_bool = False # Used for checking if the user has set the book_state or not
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
    
    if request.user.is_authenticated and review.objects.filter(book_id=book_id_or_isbn, user_id=request.user).exists():
        # Checking if the user has already reviewed the book and if yes not displaying the form for submiting a new review on html.
        user_already_reviewed = review.objects.get(book_id=book_id_or_isbn, user_id=request.user)
    else:
        user_already_reviewed = False
    reviews = review.objects.filter(book_id=book_id_or_isbn) # Getting all the reviews for the book.
    if request.user.is_authenticated:
        reviews = reviews.exclude(user_id=request.user) # Excluding the review made by the user (if made).
    return render(request, "books/book_page.html", {
        "book" : book,
        "info_book": info_book_bool,
        "reviews": reviews,
        "user_already_reviewed": user_already_reviewed,
        "error": getError(request.session)
    })

def quotes(request):
    return render(request, "books/quotes.html")

def BookToLink(request, title): # Redirect from quotes. Used for getting the id of the book by searching for its title. Quotes page only has title of the volume.
    url = f"https://www.googleapis.com/books/v1/volumes?q={title}&printType=books"
    book_data = requests.get(url=url).json()
    id = book_data["items"][0]["id"]
    return HttpResponseRedirect(resolve_url('book_page', id)) # Redirecting to book_page with the actual id of the book.

def BookState(request):
    if request.method != "PUT":
        return HttpResponseRedirect(resolve_url('index'))
    data = json.loads(request.body)
    if data['bookState'] == "Read": # Updating the db in correlation to the data that was sent by user. 
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


@login_required
def profile(request):
    # Getting post data and updating the user model if form is valid.
    if request.method == "POST":
        newUsername = request.POST["username"]
        newEmail = request.POST["email"]
        password = request.POST["password"]
        readingChallenge = request.POST["reading-challenge"]
        newGenres = request.POST.getlist("genres")
        if not password:
            makeError(request.session, "You must enter your current password to save changes made to the profile.")
            return HttpResponseRedirect(reverse(profile))
        if not newUsername:
            makeError(request.session, "Username can not be empty.")
            return HttpResponseRedirect(reverse(profile))
        if not newEmail:
            makeError(request.session, "Email can not be empty.")
            return HttpResponseRedirect(reverse(profile))
        if not readingChallenge or int(readingChallenge) < 1 or int(readingChallenge) > 100:
            makeError(request.session, "Reading challenge must be in the range 1-100.")
            return HttpResponseRedirect(reverse(profile))
        auth = authenticate(request, username=request.user, password=password)
        if not auth:
            makeError(request.session, "Your password is incorrect.")
            return HttpResponseRedirect(reverse(profile))
        request.user.username = newUsername
        request.user.email = newEmail
        request.user.genres = newGenres
        request.user.reading_challenge = readingChallenge
        request.user.save()
    return render(request, "books/profile.html", {
        "error": getError(request.session)
    })

@login_required
def library(request): # Displaying info about the user's books.
    userBooks = user_book.objects.filter(user_id=request.user, is_read=True)
    wantRead = user_book.objects.filter(user_id=request.user, to_read=True)
    reading = user_book.objects.filter(user_id=request.user, is_reading=True)
    userBooksNumber = user_book.objects.filter(user_id=request.user, is_read=True).count()
    return render(request, "books/library.html", {
        "Books": userBooks,
        "booksRead": userBooksNumber,
        "Percentage": userBooksNumber / 20 * 100,
        "wantRead": wantRead,
        "reading": reading
    })


def top_books(): # Sending request to nytimeapi to get the weekly top books.
    url = "https://api.nytimes.com/svc/books/v3/lists/current/combined-print-and-e-book-fiction.json?api-key=dJm5Qeq1IAZgEJ7j6YmBAPLWA23SrzdP"
    data = requests.get(url=url).json()
    books = []
    # Sorting Json data into list of dictionaries so that it can be read in django template.
    for i in range(15):
        if data['results']['books'][i]['primary_isbn10'] == "None":
            isbn = data['results']['books'][i]['primary_isbn13']
        else: 
            isbn = data['results']['books'][i]['primary_isbn10']
        books.append({"title":data['results']['books'][i]['title'].lower().capitalize(), "isbn": isbn, "image": data['results']['books'][i]['book_image'], "desc": data['results']['books'][i]['description'], "author": data['results']['books'][i]['author']})
    return books

def getError(session):
    if 'error' in session:
        error = session['error']
        del session['error']
        return error
    return False

def makeError(session, error):
    session['error'] = error
    return