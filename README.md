# GoodBooks

This project is a webpage where users can browse books. I started this project to primarily expand my knowledge on JavaScript and client-server communication, databases.

Used:
- Django
- Bootstrap
- sqlite3
- GoogleBooks API
- Nytimes API
- For quotes used ``` https://goodquotesapi.herokuapp.com ```

## Distinctiveness and Complexity:

The user if not registered can browse and search books. 
- Index page lists top Books of the week which are fetched from Nytimes API, lists books by default genres, these books are fetched from GoogleBooks API. 
- Show page gets detailed info about the book like description, rating, number of pages... It also displays other books by the same author and the book's rating.
- Quotes page lists quotes by various authors and their books. User can search quotes by author, book title and tag.

During registration user needs to enter in his details (username, email, password), his reading goal for the year and favourite genres which are then displayed on index page.

Registered user can:
- Set the state on books (read, want to read, currently reading) so that they are easily accessible from the library page.
- Access to the profile page where the user can change his info (email, username, favourite genres, reading goal.
- Access to the library where the user can see his read books and books he wants to read alongside a reading goal tracker.
- Ability to add reviews on already read books.

Application is mobile responsive.

## Database 
Database stores all users, user's books, reviews. user's books and reviews tables use foreign keys to relate to users.

## Possible improvements
Like every project, this one can also be improved. Possible improvements:
- Star rating reviews.
- Seeing other user's libraries.
- Adding users as friends.
- Author page with author's biography and recent works.
- Amazon book link on book page.

## Requirements:
- Django.
- Libraries: requests, json.
- This is not mandatory but if you want to see weekly top books, go to Nytimes books API and get an api key, create config.py file in root folder and paste your api key in api_key variable.

## How to launch the app.
1. Check that you have Django installed
2. Clone the repository
3. Go to reading folder
4. Run ``` python manage.py migrate ``` 
5. Run ``` python manage.py runserver ```
