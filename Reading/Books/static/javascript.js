// Horizontal scroll on index-genre
var screenWidth;
// Info-card positioning
if (!isMobile())
{
  // Positioning info-card
  var info;
  document.querySelectorAll('.index-genre').forEach(books => {
    books.addEventListener('mouseover', event => {
      var book = event.target
      if(book.className === 'book-img')
      {
        book = book.parentNode
      }
      if (book.className === 'list-book')
      {
        console.log(book)
  
        window.onresize = displayWindowSize()
        window.onload = displayWindowSize()
        rect = book.getBoundingClientRect()
        var pos = Math.round(rect.x)
        info = book.parentNode.nextElementSibling
        var width = book.offsetWidth;
        if (pos + width + 300 > screenWidth) // 300 is the width of info-card
        {
          info.setAttribute('style', `left: ${pos-300}px;`)
        }
        else {
          info.setAttribute('style', `left: ${pos + width}px;`)
        }
        
      }
    })
  })
  // Adding event listeners on arrow divs inside index-genre divs for scroll behavior. 
  document.querySelectorAll('.index-genre').forEach(item => {
    item.children[1].addEventListener('click', e => {    
      window.onresize = displayDivSize(item)
      window.onload = displayDivSize(item)
  
      item.scrollBy({
        top: 0,
        left: -screenWidth+150,
        behavior: 'smooth'
      });
      
    })
    item.children[0].addEventListener('click', e => {
      window.onresize = displayDivSize(item)
      window.onload = displayDivSize(item)
  
      item.scrollBy({
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
var genre_inner
var fantasy_books


// Getting all divs with index-genre class and fetching books for every genre in divs by calling bookList() for every genre.
document.querySelectorAll('.index-genre').forEach(genre =>{
  if (genre.id !== "top-books-week" && genre.id !== "book-author"){
  fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${genre.id}&maxResults=40&Type=books`)
    .then(response => {
      return response.json()
    })
      .then(items => {
        bookList(items, genre)
        })
    }
  })
  
// Checking if there is show more div and if true call showMore()
var show_desc = document.querySelector('#show-more-desc')
if (show_desc != null){
  if (show_desc.previousElementSibling.innerHTML.length < 300){
    show_desc.remove()
  }else {
  show_desc.addEventListener('click', e => {
    element_desc = document.querySelector('#show-more-desc')
    showMore(element_desc.previousElementSibling, element_desc)
  })
  }
}

var indexGenrePosition;
var author_name = document.querySelectorAll('.content-book-hidden')

// Checking if the user is on book_page and if true call authorBooks()
if (author_name.length !== 0){
  var book_title = document.querySelector('#content-book-title').innerHTML
  authorBooks(author_name, book_title)
  window.addEventListener('resize', moveArrow)
  window.addEventListener('load', moveArrow)
}

if (document.URL.includes("quotes")){
  fetch('https://goodquotesapi.herokuapp.com/tag/popular').then(response => {
    return response.json()
  }).then(quotes => {
    quotes.quotes.forEach(quote => {
      displayQuotes(quote)
    })
  })
}
















 

// Fetches books by author and displays them in a list on book page
function authorBooks(authors, title){
  authors.forEach(function(author, i){
    console.log(author)
    fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:"${author.id}"&maxResults=40&printType=books`).then(response => {
    return response.json()
  })
    .then(items => {
          bookList(items, document.querySelectorAll('.index-genre')[i], title);
      }
    )
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
    text.classList.replace('content-info-desc-hide', 'content-info-desc-show')
    state.innerHTML = "less..."
  }else{
    text.classList.replace('content-info-desc-show', 'content-info-desc-hide')
    state.innerHTML = "...more"
  }
}

// Fetches 40 books by genre and and displays them in a list
function bookList(items, genre, title){

  genre = genre || document.querySelector('.index-genre');
  title = title || null
  console.log(title)
  var i = 0;
  items.items.every(item => {
    if (i > 30) return false
    try {
    genre_inner = document.createElement("div");
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
    genre_inner_link.href = '/Books/show/' + item.volumeInfo.industryIdentifiers[0].identifier
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
    if(item.volumeInfo.industryIdentifiers[0].type == 'OTHER' || !info_card_desc.textContent || title === book_name.textContent){
      genre_inner.remove()
      i--
      console.log("izbriso")
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
  var contentQuote = document.createElement('div')
  var divQuote = document.createElement('div')
  var quoteText = document.createElement('p')
  var quoteAuthor = document.createElement('p')

  contentQuote.className = "content-quote"
  divQuote.className = "quote"
  quoteText.className = "quote-text"
  quoteAuthor.className = "quote-author"

  quoteText.textContent = quote.quote
  quoteAuthor.textContent = quote.author

  divQuote.append(quoteText, quoteAuthor)
  contentQuote.append(divQuote)
  document.querySelector('.body').append(contentQuote)
}