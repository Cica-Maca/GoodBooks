// Horizontal scroll on index-genre
var screenWidth;
// Info-card positioning
if (!isMobile())
{
  // Positioning info-card
  let info;
  document.querySelectorAll('.index-genre').forEach(books => {
    // Displaying info-card next to book div
    books.addEventListener('mouseover', event => {
      let book = event.target
      if(book.className === 'book-img')
      {
        book = book.parentNode
      }
      if (book.className === 'list-book')
      {
  
        window.onresize = displayWindowSize()
        window.onload = displayWindowSize()
        rect = book.getBoundingClientRect()
        let pos = Math.round(rect.x)
        info = book.parentNode.nextElementSibling
        let width = book.offsetWidth;
        if (pos + width + 300 > screenWidth) // 300 is the width of info-card
        {
          info.setAttribute('style', `left: ${pos-300}px;`)
        }
        else {
          info.setAttribute('style', `left: ${pos + width}px;`)
        }
        
      }
    })

    // Scrolling to right when clicking on the arrows inside index-genre
    // calling requestBooks for pagination
    books.children[1].addEventListener('click', e => {    
      window.onresize = displayDivSize(books)
      window.onload = displayDivSize(books)
  
      books.scrollBy({
        top: 0,
        left: -screenWidth+150,
        behavior: 'smooth'
      });
      
    })
    books.children[0].addEventListener('click', e => {
      if (books.id !== "top-books-week" && books.id !== "book-author"){
        let maxVisibleItemsOnScreen = Math.ceil(screen.width / 120 + 5) // 120 is the width of list-book div, adding 5 in case there are faulty book items
        let loadItemsNumber = maxVisibleItemsOnScreen + Number(books.dataset.startindex) + 1
        requestBooks(books, loadItemsNumber)
      }
      window.onresize = displayDivSize(books)
      window.onload = displayDivSize(books)
  
      books.scrollBy({
        top: 0,
        left: screenWidth-150,
        behavior: 'smooth'
      });
      
    })

  })
}
else {
  document.querySelectorAll('.arrow').forEach(arrow => {
    arrow.remove()
  })
  document.querySelectorAll('.arrow-right').forEach(arrow => {
    arrow.remove()
  })
}

// Getting all divs with index-genre class and fetching books for every genre in divs by calling bookList() for every genre.
document.querySelectorAll('.index-genre').forEach(genre =>{
  if (genre.id !== "top-books-week" && genre.id !== "book-author"){
    let maxVisibleItemsOnScreen = Math.ceil(screen.width / 120 + 5) // 120 is the width of list-book div, adding 5 in case there are faulty book items
    genre.setAttribute('data-startIndex', maxVisibleItemsOnScreen)

    requestBooks(genre, maxVisibleItemsOnScreen)
    }
  })
  
// Checking if there is show more div and if true call showMore()
if (document.URL.includes('show')){
  let show = document.querySelector('.show-desc')
  if (show.clientHeight + show.clientWidth < 900){
    document.querySelector('#show-more-desc').remove()
  }else {
  let show_desc = document.querySelector('#show-more-desc')
  show_desc.addEventListener('click', e => {
    showMore(show, show_desc)
  })
  }
}

// Checking if the user is on book_page and if true call authorBooks()
if (document.URL.includes('show')){
  let author_name = document.querySelectorAll('.content-book-hidden')
  let book_title = document.querySelector('#content-book-title').innerHTML
  authorBooks(author_name, book_title)
  window.addEventListener('resize', moveArrow)
  window.addEventListener('load', moveArrow)
}

if (document.URL.includes("quotes")){
  PopularQuotes()

  let search = document.querySelector('.search-quotes')
  search.addEventListener('keypress', e => {
    if(e.key === "Enter")
    {
      document.querySelectorAll('.content-quote').forEach(quote => {
        quote.remove()
      })
      searchQuotes(e.target.value)
    }
  })
  document.querySelectorAll('.dropdown-item').forEach(tag => {
    tag.addEventListener('click', e =>{
      tagClicked = e.target.textContent
      document.querySelectorAll('.content-quote').forEach(quote => {
        quote.remove()
      })
      searchQuotes(tagClicked)
      let currentTag = document.querySelector('.drp-title')
      currentTag.textContent = tagClicked
    })
  })
}


if(document.URL.includes("show"))
{
  let user = JSON.parse(document.getElementById('user_id').textContent)
  let csrftoken = getCookie('csrftoken');
  document.querySelectorAll('.dropdown-item').forEach(state => {
    state.addEventListener('click', event => {
      fetch(`/Books/state`, {
        method: 'PUT',
        body: JSON.stringify({
          "bookState": event.target.textContent,
          "isbn": window.location.href.split('/')[5].replace('#', ''),
          "user": user
        }),
        headers: { "X-CSRFToken": csrftoken },
      }).then(response => response)
      .then(result => {
        if(result.status === 201 || result.status === 200){
          changeState(event.target.textContent)
        }
      })
    })
  }) 
}

document.getElementById('search-books').addEventListener("submit", () => {
  let search = document.getElementById('search-query').value
  let searchResultsDiv = document.querySelector('.search-results')
  searchBooks(search)
  .then(books => {
    searchResultsDiv.style.display = "block"
    searchResultsDiv.innerHTML = ""
    if (books.totalItems > 0){
      books.items.forEach(book => {
        displaySearchResults(book)
      })
    }else {
      searchResultsDiv.textContent = "No results"
    }
    searchResultsDiv.append(AdvancedSearchLink())
  })
})

document.onclick = e => {
  if (e.target.className !== "search-results" && e.target.id !== "search-query"){
    HideSearchResults()
  }
}















 

// Fetches books by author and displays them in a list on book page
function authorBooks(authors, title){
  authors.forEach(function(author, i){
    console.log(author)
    fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:"${author.id}"&maxResults=40&printType=books&fields=items(id,%20volumeInfo/title,%20volumeInfo/authors,%20volumeInfo/publishedDate,%20volumeInfo/description,%20volumeInfo/industryIdentifiers/type,%20volumeInfo/pageCount,%20volumeInfo/imageLinks/thumbnail)`).then(response => {
    if (!response.ok) return Promise.reject(response);
    return response.json()
  })
    .then(items => {
        if (items.totalItems !== 0)
          bookList(items, document.querySelectorAll('.index-genre')[i], title);
        else {
           document.querySelector('.index-genre').remove()
           document.querySelector('.author-name').remove()
        }
        if (!(document.querySelector('.index-genre').hasChildNodes())){
          document.querySelector('.index-genre').remove()
          document.querySelector('.author-name').remove()
        }

      }
    ).catch(error => {
      serviceError(error, author)
    })
  })
  
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

// Getting the width of the window
function displayWindowSize() {
  screenWidth = window.innerWidth
}

// Getting the width of a div
function displayDivSize(div) {
  screenWidth = div.clientWidth
}

// Read More function
function showMore(text, state) {
  if (state.innerHTML === "...more"){
    text.style.webkitLineClamp = "1000"
    state.innerHTML = "less..."
  }else{
    text.style.webkitLineClamp = "10"
    state.innerHTML = "...more"
  }
}

// Fetches 40 books by genre and and displays them in a list
function bookList(items, genre, title){

  genre = genre || document.querySelector('.index-genre');
  title = title || null
  let i = 0;
  items.items.every(item => {
    if (i > 30) return false
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
      i--
    }
    i++
    return true;
    }catch(error)
    {
      genre_inner.remove()
      return true;
      
    }

  })

}

function moveArrow()
{
  
    document.querySelectorAll('.index-genre').forEach(item => {
      var rect = item.getBoundingClientRect();
      document.querySelectorAll('.arrow-right').forEach(arrow => {
        arrow.setAttribute('style', `left:${rect.right-27}px`)
      })
    })
}

function displayQuotes(quote){
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
          displayQuotes(quote)
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
          serviceError("No results", document.querySelector('.body'))
})
}

function PopularQuotes(page){
  page = page || '1'
  fetch(`https://goodquotesapi.herokuapp.com/tag/popular?page=${page}`).then(response => {
    if (!response.ok) return Promise.reject(response);
    return response.json()
  }).then(quotes => {
    quotes.quotes.forEach(quote => {
      displayQuotes(quote)
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
    serviceError("Service unavailable", document.querySelector('.body'))
  })
}

function serviceError(error, div){
  errorMessage = document.createElement('p')
  errorMessage.textContent = error
  errorMessage.className = 'error-message'
  div.append(errorMessage)


}

function requestBooks(genre, loadItemsNumber)
{
  let visibleItems = Math.ceil(screen.width / 120 + 5)
  let url
  if (loadItemsNumber === visibleItems){
    url = `https://www.googleapis.com/books/v1/volumes?q=subject:${genre.id}&maxResults=${visibleItems}&printType=books&fields=items(id,%20volumeInfo/title,%20volumeInfo/authors,%20volumeInfo/publishedDate,%20volumeInfo/description,%20volumeInfo/industryIdentifiers/type,%20volumeInfo/pageCount,%20volumeInfo/imageLinks/thumbnail)`
  }
  else {
    url = `https://www.googleapis.com/books/v1/volumes?q=subject:${genre.id}&maxResults=${visibleItems}&startIndex=${loadItemsNumber}&printType=books&fields=items(id,%20volumeInfo/title,%20volumeInfo/authors,%20volumeInfo/publishedDate,%20volumeInfo/description,%20volumeInfo/industryIdentifiers/type,%20volumeInfo/pageCount,%20volumeInfo/imageLinks/thumbnail)`
    genre.setAttribute('data-startIndex', loadItemsNumber)
  }
  if(loadItemsNumber < 200){ // 200 is max total items returned for genres
    fetch(url)
    .then(response => {
      if (!response.ok) return Promise.reject(response);
      return response.json()
    })
      .then(items => {
        bookList(items, genre)
        }).catch(error => {
          serviceError(error, genre)
        })
    }
}

async function searchBooks(search){
  search = search.replace(' ', '%')
  return fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:"${search}"&langRestrict=en`)
    .then(response => {
      if (!response.ok) return Promise.reject(response);
      return response.json()
    })
    .then(books => (books))
    .catch(error => {
      console.log(error)
    })
}

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

  image.src = book.volumeInfo.imageLinks.thumbnail
  author.textContent = book.volumeInfo.authors[0]
  title.textContent = book.volumeInfo.title
  link.href = `/Books/show/${book.id}`

  itemDetails.append(title, author)
  saerchItem.append(image, itemDetails)
  link.append(saerchItem)

  document.querySelector('.search-results').append(link)
}

function HideSearchResults() {
  document.querySelector('.search-results').style.display = "none"
}

function AdvancedSearchLink() {
  let link = document.createElement('a')
  link.className = "as"
  link.textContent = "Advanced Search"
  link.href = "/Books/advanced"
  return link
}