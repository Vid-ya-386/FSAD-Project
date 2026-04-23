// ==============================
// 🍯 BOOKHIVE — OPEN LIBRARY EDITION
// ==============================

// --- Display Book Cards ---
function displayBooksOL(books, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  books.forEach((book) => {
    const title = book.title || "Untitled";
    const author =
      (book.authors && book.authors[0]?.name) ||
      (book.author_name && book.author_name[0]) ||
      "Unknown Author";
    const coverId = book.cover_id || book.cover_i;
    const coverUrl = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
      : "assets/default_cover.jpg";

    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${coverUrl}" alt="${title}">
      <h3>${title}</h3>
      <p>${author}</p>
    `;
    card.addEventListener("click", () => {
      localStorage.setItem("selectedBookOL", JSON.stringify(book));
      window.location.href = "book.html";
    });
    container.appendChild(card);
  });
}

// --- Fetch books from Open Library Search API ---
async function fetchBooksOL(query, containerId) {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
    );
    const data = await response.json();
    if (data.docs && data.docs.length > 0) {
      displayBooksOL(data.docs, containerId);
    } else {
      document.getElementById(containerId).innerHTML =
        "<p>No books found 🥲</p>";
    }
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

// --- Fetch books by genre using Subjects API ---
async function fetchGenreOL(genre, containerId) {
  try {
    const response = await fetch(
      `https://openlibrary.org/subjects/${genre.toLowerCase()}.json?limit=20`
    );
    const data = await response.json();
    if (data.works && data.works.length > 0) {
      displayBooksOL(data.works, containerId);
    } else {
      document.getElementById(containerId).innerHTML =
        "<p>No books found 🥲</p>";
    }
  } catch (error) {
    console.error("Error fetching genre:", error);
  }
}

// ==============================
// 🐝 HOMEPAGE LOADING
// ==============================
if (window.location.pathname.includes("index.html")) {
  // --- Trending Books (general fiction & romance mix)
  fetchBooksOL("romance OR thriller OR fantasy", "trendingBooks");

  // --- New Releases (approximation — sort newest first)
  fetchBooksOL("new OR 2024 OR 2025 fiction", "newReleases");

  // --- Genre Highlights ---
  const genres = [
    "romance",
    "thriller",
    "fantasy",
    "mystery",
    "science_fiction",
    "young_adult",
  ];
  const genreSection = document.getElementById("genreHighlights");

  genres.forEach((genre) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("genre-highlight");

    wrapper.innerHTML = `
      <h3>${genre.replace("_", " ").toUpperCase()}</h3>
      <div class="carousel-container">
        <button class="scroll-btn left">❮</button>
        <div class="book-container small-grid" id="genre-${genre}"></div>
        <button class="scroll-btn right">❯</button>
      </div>
      <a href="genre.html?genre=${encodeURIComponent(
        genre
      )}" class="see-more">See more →</a>
    `;

    genreSection.appendChild(wrapper);
    fetchGenreOL(genre, `genre-${genre}`);
  });
}

// ==============================
// 🐝 CAROUSEL SCROLL BUTTONS
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const scrollContainers = document.querySelectorAll(".book-container");
  scrollContainers.forEach((container) => {
    const leftBtn = container.parentElement.querySelector(".scroll-btn.left");
    const rightBtn = container.parentElement.querySelector(".scroll-btn.right");

    if (leftBtn && rightBtn) {
      leftBtn.addEventListener("click", () => {
        container.scrollBy({ left: -400, behavior: "smooth" });
      });
      rightBtn.addEventListener("click", () => {
        container.scrollBy({ left: 400, behavior: "smooth" });
      });
    }
  });
});

// ==============================
// 🐝 GENRE PAGE HANDLER
// ==============================
if (window.location.pathname.includes("genre.html")) {
  const params = new URLSearchParams(window.location.search);
  const genre = params.get("genre") || "";
  const search = params.get("search") || "";

  const title = document.getElementById("genreTitle");
  if (search) {
    title.textContent = `Results for "${search}"`;
    fetchBooksOL(search, "genreBooks");
  } else if (genre) {
    title.textContent = `${genre.replace("_", " ").toUpperCase()} Books`;
    fetchGenreOL(genre, "genreBooks");
  }

  const sortSelect = document.getElementById("sortSelect");
  sortSelect.addEventListener("change", () => sortBooks(sortSelect.value));
}

// ==============================
// 🐝 SORTING FUNCTION
// ==============================
function sortBooks(option) {
  const container = document.getElementById("genreBooks");
  const books = Array.from(container.getElementsByClassName("book-card"));
  if (option === "A-Z") {
    books.sort((a, b) =>
      a.querySelector("h3").textContent.localeCompare(
        b.querySelector("h3").textContent
      )
    );
  } else if (option === "Z-A") {
    books.sort((a, b) =>
      b.querySelector("h3").textContent.localeCompare(
        a.querySelector("h3").textContent
      )
    );
  }
  container.innerHTML = "";
  books.forEach((book) => container.appendChild(book));
}

// ==============================
// 🐝 BOOK DETAILS PAGE
// ==============================
if (window.location.pathname.includes("book.html")) {
  const book = JSON.parse(localStorage.getItem("selectedBookOL"));
  const container = document.getElementById("bookDetails");

  if (!book) {
    container.innerHTML = "<p>No book data found!</p>";
  } else {
    const title = book.title || "Untitled";
    const author =
      (book.authors && book.authors[0]?.name) ||
      (book.author_name && book.author_name[0]) ||
      "Unknown Author";
    const coverId = book.cover_id || book.cover_i;
    const coverUrl = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : "assets/default_cover.jpg";

    container.innerHTML = `
      <img src="${coverUrl}" alt="${title}">
      <div class="info">
        <h2>${title}</h2>
        <p><strong>Author:</strong> ${author}</p>
        <p><strong>First Published:</strong> ${
          book.first_publish_year || "N/A"
        }</p>
        <p><strong>Subjects:</strong> ${
          book.subject ? book.subject.slice(0, 5).join(", ") : "N/A"
        }</p>
        <p><strong>Description:</strong><br>
        ${
          book.description
            ? book.description.value || book.description
            : "No description available."
        }</p>
        <div class="buy-links">
          <a href="https://openlibrary.org${book.key}" target="_blank" class="buy-btn">View on Open Library</a>
        </div>
      </div>
    `;
  }
}
