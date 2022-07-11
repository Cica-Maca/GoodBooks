import json
import requests
import json


url = "https://api.nytimes.com/svc/books/v3/lists/current/combined-print-and-e-book-fiction.json?api-key=dJm5Qeq1IAZgEJ7j6YmBAPLWA23SrzdP"

r = requests.get(url=url)

data = r.json()

books = []


for i in range(15):
    books.append({"title":data['results']['books'][i]['title'].lower().capitalize(), "isbn": data['results']['books'][i]['primary_isbn10'], "image": data['results']['books'][i]['book_image']})
    # books[data['results']['books'][i]['title'].lower().capitalize()] = [data['results']['books'][i]['primary_isbn10'], data['results']['books'][i]['book_image']]

print(books)