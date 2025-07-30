// currently.js

document.addEventListener('DOMContentLoaded', () => {
    const DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSnCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv';

    // --- REMOVE THESE LINES ---
    // const contentArea = document.createElement('div');
    // contentArea.id = 'currently-reading-books';
    // document.body.appendChild(contentArea);
    // --- END REMOVAL ---

    // --- ADD THIS LINE INSTEAD ---
    const contentArea = document.getElementById('currently-reading-books');
    if (!contentArea) {
        console.error("Error: '#currently-reading-books' element not found in the HTML.");
        return; // Stop execution if the container is not found
    }
    // --- END ADDITION ---


    Papa.parse(DATA_URL, {
        download: true,
        header: true,
        complete: function(results) {
            const books = results.data;
            displayCurrentlyReading(books);
        },
        error: function(err, file) {
            console.error("Error parsing CSV:", err, file);
            contentArea.innerHTML = '<p>Failed to load currently reading books. Please try again later.</p>';
        }
    });

    function displayCurrentlyReading(books) {
        // Clear any existing content in the div before adding new
        contentArea.innerHTML = ''; 

        let currentlyReadingBooks = books.filter(book => {
            // Check if the 'Ende' (End) column is empty or contains '#NUM!' (from your data)
            return !book.Ende || book.Ende === '#NUM!';
        });

        // Optional: Sort by Start date if desired, to show more recent reads first
        currentlyReadingBooks.sort((a, b) => {
            const dateA = new Date(a.Start);
            const dateB = new Date(b.Start);
            return dateB - dateA; // Descending order
        });

        if (currentlyReadingBooks.length === 0) {
            contentArea.innerHTML = '<p>No books currently being read.</p>';
            return;
        }

        currentlyReadingBooks.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';

            const coverImage = document.createElement('img');
            coverImage.className = 'book-cover';
            // Use the 'Cover' column (B) for the image source
            coverImage.src = book.Cover;
            coverImage.alt = `Cover of ${book.Titel}`;

            const bookTitle = document.createElement('h3');
            bookTitle.textContent = book.Titel;

            const bookAuthor = document.createElement('p');
            bookAuthor.textContent = `Author: ${book['Autor:in']}`; // Use bracket notation for special characters

            bookCard.appendChild(coverImage);
            bookCard.appendChild(bookTitle);
            bookCard.appendChild(bookAuthor);
            contentArea.appendChild(bookCard);
        });
    }
});