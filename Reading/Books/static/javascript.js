// Horizontal scroll on index-genre
// Info-card positioning
  // Positioning info-card
  document.querySelectorAll('.index-genre').forEach(books => {
    books.addEventListener('scroll', () => {
      if (books.offsetWidth + books.scrollLeft >= books.scrollWidth - 200){
        let maxVisibleItemsOnScreen = Math.ceil(screen.width / 120 + 5) // 120 is the width of list-book div, adding 5 in case there are faulty book items
        let loadItemsNumber = maxVisibleItemsOnScreen + Number(books.dataset.startindex) + 1 // Number of books that should be loaded.
        if (books.id !== "top-books-week" && books.id !== "book-author" && books.id!== 'readBooks' && books.id !== 'reading' && books.id !== 'wantRead' && books.id !== "Results"){
          requestBooks(books, loadItemsNumber)
        }
        if (books.id === "book-author"){
          const url = authorBooksUrl(books.previousElementSibling)
          requestBooks(books, loadItemsNumber, url)
        }
        if (books.id === "Results"){
          const advanced_url = AdvancedSearchUserQuery()
          requestBooks(books, loadItemsNumber, advanced_url)
        }
      }
    })
    // Displaying info-card next to book div
    if(!isMobile()){
      books.addEventListener('mouseover', event => {
        let info;
        let book = event.target
        if(book.className === 'book-img')
        {
          book = book.parentNode
        }
        if (book.className === 'list-book')
        {
          rect = book.getBoundingClientRect()
          let pos = Math.round(rect.x)
          info = book.parentNode.nextElementSibling
          let width = book.offsetWidth;
          if (pos + width + 300 > window.innerWidth) // 300 is the width of info-card, Checking if the card will go out of window, if yes move it on the other side.
          {
            info.setAttribute('style', `left: ${pos-300}px;`)
          }
          else {
            info.setAttribute('style', `left: ${pos + width}px;`)
          }
          
        }
      })

      // Scrolling to right when clicking on the arrows inside index-genre
      books.children[1].addEventListener('click', () => {    
        books.scrollBy({
          top: 0,
          left: - books.offsetWidth + 113, // Leaving the width of the last book
          behavior: 'smooth'
        });
        
      })
      books.children[0].addEventListener('click', () => {
        books.scrollBy({
          top: 0,
          left: books.offsetWidth - 113,
          behavior: 'smooth'
        })
      })
    }
    else {
      // Removing the arrow navigation if the user is on mobile
      document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.remove()
      })
      document.querySelectorAll('.arrow-right').forEach(arrow => {
        arrow.remove()
      })
    }
  })


// Getting all divs with index-genre class and fetching books for every genre in divs by calling bookList() for every genre.
document.querySelectorAll('.index-genre').forEach(genre =>{
  let maxVisibleItemsOnScreen = Math.ceil(screen.width / 120 + 5) // 120 is the width of list-book div, adding 5 in case there are faulty book items
  genre.setAttribute('data-startIndex', maxVisibleItemsOnScreen)
  if (genre.id !== "top-books-week" && genre.id !== "book-author" && genre.id !== 'Results' && genre.id !== 'readBooks' && genre.id !== 'reading' && genre.id !== 'wantRead'){

    requestBooks(genre, maxVisibleItemsOnScreen)
    }
  })
  
// Checking if there is show more div and if true call showMore()
if (document.URL.includes('show')){
  let show = document.querySelector('.show-less')
  if (show.scrollHeight + show.scrollWidth < 900){
    document.querySelector('#show-more-desc').remove()
  }else {
    let show_desc = document.querySelector('#show-more-desc')
    show_desc.addEventListener('click', e => {
      showMore(show, show_desc)
    })
  }
}

// Getting the book data and displaying it on library
if(document.URL.includes('library')){
  document.querySelectorAll('.content-book-hidden').forEach(book => {
    isbn = book.id
    let div = book.parentElement
    let url
    url = `https://www.googleapis.com/books/v1/volumes/${isbn}`
    book.remove()
    fetch(url)
    .then(response => {
      if (!response.ok) return Promise.reject(response);
    return response.json()})
    .then(items => {
      
      items = JSON.stringify(items)
      items = `{"items":[${items}]}`
      items = JSON.parse(items)
      
      bookList(items, div)
      moveArrow
    })
    .catch(error =>{
      serviceError(error)
    })
  })
  window.addEventListener('resize', moveArrow)
  window.addEventListener('load', moveArrow)
}


// Checking if the user is on book_page, calling requestBooks for books from the same author
if (document.URL.includes('show')){
  const author_name = document.querySelectorAll('.content-book-hidden')
  author_name.forEach(function(author, i) {
    let url = authorBooksUrl(author)
    const placeholderDiv = document.querySelectorAll('.index-genre')[i]
    requestBooks(placeholderDiv, Number(placeholderDiv.dataset.startindex), url)
  })
  window.addEventListener('resize', moveArrow)
  window.addEventListener('load', moveArrow)


  // Sending request to server when the user tries to delete his own review
  let deleteButton = document.querySelector('#deleteReview')
  if (deleteButton){
    deleteButton.addEventListener('click', () => {
      let user = JSON.parse(document.getElementById('user_id').textContent)
      let csrftoken = getCookie('csrftoken');
      let bookId = document.getElementById('book-id').dataset.bookid
      fetch(`/Books/show/${bookId}`, {
        method: 'DELETE',
        headers: { "X-CSRFToken": csrftoken },
        body: JSON.stringify({
          "user": user
        })

        
      })
      .then(response => response)
      .then(result => {
        if(result.status === 201 || result.status === 200){
          let userReview = document.getElementById('userReview')
          hidingAnimation(userReview) // Animation of the review dissapearing
        }
      })
      .catch(error => {
        serviceError(error)
       })
    })
  }
}

if (document.URL.includes("quotes")){
  PopularQuotes() // Default quotes page loads Popular quotes

  let search = document.querySelector('.search-quotes')
  search.addEventListener('keypress', e => {
    if(e.key === "Enter")
    {
      document.querySelectorAll('.content-quote').forEach(quote => {
        quote.remove() // Removing the previous quotes and populating the page with the searched quotes.
      })
      searchQuotes(e.target.value)
    }
  })
  document.querySelectorAll('.dropdown-item').forEach(tag => {
    tag.addEventListener('click', e =>{
      tagClicked = e.target.textContent
      document.querySelectorAll('.content-quote').forEach(quote => {
        quote.remove() // Removing the previous quotes and populating the page with quotes from selected tag.
      })
      searchQuotes(tagClicked)
      let currentTag = document.querySelector('.drp-title')
      currentTag.textContent = tagClicked
    })
  })
}


if(document.URL.includes("show"))
{
  // Changing the state of the user's book trough PUT request to the server.
  let user = JSON.parse(document.getElementById('user_id').textContent)
  let csrftoken = getCookie('csrftoken');
  document.querySelectorAll('.dropdown-item').forEach(state => {
    state.addEventListener('click', event => {
      fetch(`/Books/state`, {
        method: 'PUT',
        body: JSON.stringify({
          "bookState": event.target.textContent,
          "isbn": document.getElementById('book-id').dataset.bookid,
          "user": user
        }),
        headers: { "X-CSRFToken": csrftoken },
      })
      .then(response => response)
      .then(result => {
        if(result.status === 201 || result.status === 200){
          changeState(event.target.textContent)
          if(event.target.textContent == "Read"){
            document.querySelector('#writeReview').classList.remove('hideDiv') // If the user has read the book, let him make a review of it.
          }
          else {
            document.querySelector('#writeReview').classList.add('hideDiv') // If the user removes the book from his list, hide the review form.
          }
        }
      })
      .catch(error => {
        serviceError(error)
      })
    })
  }) 
}

// Books search.
document.getElementById('search-books').addEventListener("submit", () => {
  const search = document.getElementById('search-query').value
  const searchResultsDiv = document.querySelector('.search-results')
  if (window.innerWidth < 990)
  {
    searchResultsDiv.style.transform = "translate3d(0px, 121px, 0px)" // Move the search results div on smaller screens
  }
  searchBooks(search) // Calling the searchBooks function which returns the list of books with the same title.
  .then(books => {
    searchResultsDiv.style.height = "1000px"
    searchResultsDiv.innerHTML = "" // Removing the previous search results.
    const numberOfBooks = books.totalItems
    if (numberOfBooks > 0){
      for (let i = 0; i < books.totalItems; i++){
        let book = books.items[i]
        displaySearchResults(book)
      }
    }else {
      searchResultsDiv.textContent = "No results"
    }
    searchResultsDiv.append(AdvancedSearchLink())
  })
})

document.onclick = e => {
  if (e.target.className !== "search-results" && e.target.id !== "search-query"){
    HideSearchResults() // Hide search results if the user clicks from the search bar.
  }
}


if(document.URL.includes("advanced")){
  let advancedSearch = document.getElementById('advanced-search-form')
  advancedSearch.addEventListener('submit', () => {
    let advanced_url = AdvancedSearchUserQuery() // Function gets user's inputs and combines it into a url.
    let maxVisibleItemsOnScreen = Math.ceil(screen.width / 120 + 5) // 120 is the width of list-book div, adding 5 in case there are faulty book items
    let genre = document.querySelector('.index-genre')
    genre.setAttribute('data-startIndex', maxVisibleItemsOnScreen)
    genre.style.display = "flex"
    let genre_name = document.querySelector('.genre-name')
    genre_name.style.display = "block"
    let arrowR = document.querySelector('.arrow-right')
    let arrow = document.querySelector('.arrow')
    genre.innerHTML = "" // Removing the previous search results.
    genre.append(arrowR, arrow)
    requestBooks(genre, maxVisibleItemsOnScreen, advanced_url)
  })

}

if (document.URL.includes("profile")){
  let genres = document.querySelector('.genres')
  let genresPicked = genres.dataset.genres
  genres = genres.children // getting all the genres
  let genre, genreValue;
  for (let i = 0; i < genres.length; i++){
    genre = genres[i] // 1 child genre
    genreValue = genre.children[1].innerHTML // Checking if genre is selected by user or not
    if(genresPicked.includes(genreValue)){
      genre.children[0].checked = true // Selecting input field
    }
  }
  
}















 

// Fetches books by author and displays them in a list on book page
function authorBooksUrl(author){
    return `https://www.googleapis.com/books/v1/volumes?q=inauthor:"${author.id}"&printType=books&fields=totalItems,items(id,%20volumeInfo/title,%20volumeInfo/authors,%20volumeInfo/publishedDate,%20volumeInfo/description,%20volumeInfo/industryIdentifiers/type,%20volumeInfo/pageCount,%20volumeInfo/imageLinks/thumbnail)`
}

// Cutting the text on the 265 character.
function max_length(text){
  if(text.length > 265)
    return text.substring(0, 265) + '...';
  return text;
}

// Checking if the device has touch control
function isMobile() {
  try{ document.createEvent("TouchEvent"); return true; }
  catch(e){ return false; }
}

// Read More function
function showMore(text, state) {
  if (state.innerHTML === "...more"){
    text.classList.remove('show-less')
    text.classList.add('show-more')
    state.innerHTML = "less..."
  }else{
    text.classList.remove('show-more')
    text.classList.add('show-less')
    state.innerHTML = "...more"
  }
}

// Displays the books in an index-genre div.
function bookList(items, genre, title){
  title = title || null
  let item;
  let numberOfItems = items.items.length;
  for (let i = 0; i < numberOfItems; i++)
  {
    item = items.items[i];
    try {
      var genre_inner = document.createElement("div");
      var genre_inner_link = document.createElement("a")
      var link_list_book = document.createElement("li")
      var book_img = document.createElement("img")
      var book_name = document.createElement("div")
      var info_card = document.createElement("div")
      var info_card_title = document.createElement("h6")
      var info_card_author = document.createElement("div")
      var info_card_desc = document.createElement("div")


      genre_inner.className = `inner inner-genre`

      genre_inner_link.className = "link-book"
      genre_inner_link.href = '/Books/show/' + item.id
      genre_inner_link.id = item.volumeInfo.industryIdentifiers[0].identifier

      link_list_book.className = "list-book"

      book_img.className = "book-img"
      book_img.src = item.volumeInfo.imageLinks.thumbnail

      book_name.className = "book-name"
      book_name.textContent = item.volumeInfo.title

      info_card.className = "info-card"

      info_card_title.className = "info-card-title"
      info_card_title.textContent = item.volumeInfo.title

      info_card_author.className = "info-card-author"
      if(item.volumeInfo.authors[1])
      {
        info_card_author.innerHTML = `by <h6 style="margin-left:3px;">${item.volumeInfo.authors[0]}, ${item.volumeInfo.authors[1]}</h6>`
      }
      else {
        info_card_author.innerHTML = `by <h6 style="margin-left:3px;">${item.volumeInfo.authors[0]}</h6>`
      }

      
      info_card_desc.className = "info-card-desc"
      info_card_desc.textContent = item.volumeInfo.description
      
      info_card.append(info_card_title, info_card_author, info_card_desc)
      link_list_book.append(book_img, book_name)
      genre_inner_link.append(link_list_book)
      genre_inner.append(genre_inner_link, info_card)
      // genre_div.innerHTML = '<div class="{{ genre }}-inner inner-genre"><a href="" class="link-book" id=""><li class="list-book"><img class="book-img" src="Loading..."><div class="book-name"></div></li></a><div class="info-card"><h6 class="info-card-title"></h6><div class="info-card-author">by <h6 style="margin-left: 3px"></h6></div><div class="info-card-desc"></div></div></div>'
      genre.append(genre_inner)
      if(title === book_name.textContent){
        genre_inner.remove()
      }
    }
    catch(error)
      {
          genre_inner.remove()      
      }
  }

}

// Positioning the right arrow on the screen at all times. 
function moveArrow()
{
  document.querySelectorAll('.index-genre').forEach(item => {
    var rect = item.getBoundingClientRect();
    document.querySelectorAll('.arrow-right').forEach(arrow => {
      arrow.setAttribute('style', `left:${rect.right-27}px`)
    })
  })
}

// Displaying the quote in a div alongside the author and a link to the book.
function displayQuote(quote){
  let contentQuote = document.createElement('div')
  let divQuote = document.createElement('div')
  let quoteText = document.createElement('p')
  let quoteAuthor = document.createElement('p')
  let publication = document.createElement('a')

  contentQuote.className = "content-quote"
  divQuote.className = "quote"
  quoteText.className = "quote-text"
  quoteAuthor.className = "quote-author"


  if(quote.publication){
    publication.textContent = quote.publication
    publication.href = `/Books/toisbn/${quote.publication}`
    quoteAuthor.textContent = `--${quote.author}`
    quoteAuthor.append(publication)
  }
  else {
    quoteAuthor.textContent = `--${quote.author}`
  }
  

  quoteText.textContent = `"${quote.quote}"`
  

  divQuote.append(quoteText, quoteAuthor)
  contentQuote.append(divQuote)
  document.querySelector('.body').append(contentQuote)
}

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

// Chaning the button of the book state.
function changeState(state){
  let stateButton = document.querySelector('#book-state')
  if (state !== "Remove"){
    stateButton.innerHTML = state;
    stateButton.className = "btn btn-success btn-md"
    stateButton.nextElementSibling.className = "btn btn-sm btn-success dropdown-toggle dropdown-toggle-split"
    if (document.querySelector('#remove-item').style.display === 'none'){
      document.querySelector('#remove-item').style.display = 'block'
    }
  }
  else {
    stateButton.innerHTML = "Book State"
    stateButton.className = "btn btn-secondary btn-md"
    stateButton.nextElementSibling.className = "btn btn-sm btn-secondary dropdown-toggle dropdown-toggle-split"
    document.querySelector('#remove-item').style.display = 'none'
  }
}

// Pagination for quteos, getting the current page and the max page.
function createPagination(page, maxPage){
  let content = document.createElement('div')
  let spanPage = document.createElement('span')
  let inputPage = document.createElement('input')
  let spanMaxPage = document.createElement('span')

  content.className = 'content-quote'
  spanPage.className = 'page'
  spanMaxPage.className = 'page-max'
  inputPage.className = 'form-control'
  inputPage.id = 'pageInput'
  inputPage.style.width = '70px'
  inputPage.value = page
  inputPage.type = 'number'
  inputPage.min = '1'
  inputPage.max = maxPage
  spanPage.textContent = 'Page: '
  spanMaxPage.textContent = ` / ${maxPage}`

  content.append(spanPage, inputPage, spanMaxPage)
  document.querySelector('.body').append(content)
}

function searchQuotes(search, page){
      page = page || '1'
      search = search.replace(' ', '+')
      fetch(`https://goodquotesapi.herokuapp.com/author/${search}?page=${page}`).then(response => {
        if (!response.ok) return Promise.reject(response);
        return response.json()
      }).then(quotes => {
        quotes.quotes.forEach(quote => {
          displayQuote(quote)
          })
          createPagination(page, quotes.total_pages)
          document.querySelector('#pageInput').addEventListener('keypress', e => {
            if (e.key === "Enter"){
              document.querySelectorAll('.content-quote').forEach(element => {
                element.remove()
              })
              searchQuotes(search, e.target.value)
            }
          })

        }).catch(error => {
          serviceError("No results")
})
}

function PopularQuotes(page){
  page = page || '1'
  fetch(`https://goodquotesapi.herokuapp.com/tag/popular?page=${page}`).then(response => {
    if (!response.ok) return Promise.reject(response);
    return response.json()
  }).then(quotes => {
    quotes.quotes.forEach(quote => {
      displayQuote(quote)
    })
    createPagination(page, quotes.total_pages)
    document.querySelector('#pageInput').addEventListener('keypress', e => {
      if (e.key === "Enter"){
        document.querySelectorAll('.content-quote').forEach(element => {
          element.remove()
        })
        PopularQuotes(e.target.value)
      }
    })
  }).catch(error => {
    serviceError("Service unavailable")
  })
}

// Displaying the error on the top of the page.
function serviceError(error){
  errorMessage = document.createElement('p')
  errorMessage.textContent = error
  let div = document.getElementById('error-place') // Bootstrap code for showing error cards
  let errorHTML = `<div class="alert alert-danger alert-dismissible fade show" style="display:flex;justify-content:center;" role="alert"><strong style="padding-right:5px">Error </strong>${error}<button type="button" class="close" style="border:none;background-color:transparent;" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`

  div.innerHTML = errorHTML
}

// Gets the list of books from GoogleBooksAPI and then calls the bookList with the same items.
// Loads only the amount of books that can fit on the users screen.
function requestBooks(genre, loadItemsNumber, url)
{
  url = url || `https://www.googleapis.com/books/v1/volumes?q=subject:${genre.id}&printType=books&fields=totalItems,items(id,%20volumeInfo/title,%20volumeInfo/authors,%20volumeInfo/publishedDate,%20volumeInfo/description,%20volumeInfo/industryIdentifiers/type,%20volumeInfo/pageCount,%20volumeInfo/imageLinks/thumbnail)`

  let visibleItems = Math.ceil(screen.width / 120 + 5)
  if (loadItemsNumber === visibleItems){
    url = url + `&maxResults=${visibleItems}`
  }
  else {
    url = url + `&maxResults=${visibleItems}&startIndex=${loadItemsNumber}` 
    genre.setAttribute('data-startIndex', loadItemsNumber) // Saving the loaded books number for the next request.
  }
  fetch(url)
  .then(response => {
    if (!response.ok) return Promise.reject(response);
    return response.json()
  })
  .then(items => {
    if(items.totalItems > 0 && items.items)
    {
      bookList(items, genre)
    }
    else if(items.totalItems === 0){
      serviceError("No Results")
    }
    })
  .catch(error => {
    serviceError(error)
  })

}
// Returns the books with the same title.
async function searchBooks(search){
  search = search.replace(' ', '%')
  return fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:"${search}"&langRestrict=en&maxResults=10`)
    .then(response => {
      if (!response.ok) return Promise.reject(response);
      return response.json()
    })
    .then(books => (books))
    .catch(error => {
      console.log(error)
    })
}
// Displaying search results in a div, 10 books max.
function displaySearchResults(book) {
  let link = document.createElement('a')
  let saerchItem = document.createElement('div')
  let image = document.createElement('img')
  let itemDetails = document.createElement('div')
  let author = document.createElement('h6')
  let title = document.createElement('h5')

  saerchItem.className = "search-results-item"
  image.className = "search-item-image"
  itemDetails.className = "item-details"
  author.style.fontSize = "14px"
  title.style.fontSize = "15px"

  try {
    image.src = book.volumeInfo.imageLinks.thumbnail
    author.textContent = book.volumeInfo.authors[0]
    title.textContent = book.volumeInfo.title
    link.href = `/Books/show/${book.id}`
  }catch(error){
    return false
  }
 

  itemDetails.append(title, author)
  saerchItem.append(image, itemDetails)
  link.append(saerchItem)

  document.querySelector('.search-results').append(link)
}

// Hiding search div if the user click out of it.
function HideSearchResults() {
  document.querySelector('.search-results').style.height = "0px"
}

// Advanced search link at the bottom of search books results div.
function AdvancedSearchLink() {
  let link = document.createElement('a')
  link.className = "as"
  link.textContent = "Advanced Search"
  link.href = "/Books/advanced"
  return link
}


// Returning the googlebooks search query with the user's inputs
function AdvancedSearchUserQuery() {
  let exactTitle = document.getElementById('exactTitle').value
  let wordsInTitle = document.getElementById('titleWords').value
  let withoutWordsInTitle = document.getElementById('noWordsTitle').value
  let author = document.getElementById('author').value
  let isbn = document.getElementById('isbn').value
  let content = document.querySelector('input[name="inlineRadioOptions"]:checked').value
  let language = document.getElementById('language').value
  
  if (exactTitle)
    exactTitle = `+intitle:${exactTitle}`
  if (wordsInTitle)
    wordsInTitle = `+${wordsInTitle}`
  if (withoutWordsInTitle)
    withoutWordsInTitle = `-${withoutWordsInTitle}`
  if(author)
    author = `+inauthor:${author}`
  if(isbn)
    isbn = `+isbn:${isbn}`
  if(content)
    content = `&printType=${content}`
  if(language)
    language = `&langRestrict=${language}`



  let url = `https://www.googleapis.com/books/v1/volumes?q=${withoutWordsInTitle}${wordsInTitle}${exactTitle}${isbn}${author}${content}${language}`
  return url
}

// Hiding animation
function hidingAnimation(div) {
  div.classList.toggle('hideDiv');
  setTimeout(function(){ 
    div.style.display = "none"
  }, 1000)
}