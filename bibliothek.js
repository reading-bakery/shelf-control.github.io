document.addEventListener('DOMContentLoaded', () => {
    const bookshelfWrapper = document.getElementById('bookshelfWrapper');
    const tabButtons = document.querySelectorAll('.tab-btn');
    let allBooks = [];

    // 10 unterschiedliche, ansprechende Buchrücken-Farben
    const spineColors = [
        "linear-gradient(135deg, #4a1515 0%, #2c0b0b 100%)", // Dunkelrot / Bordeaux
        "linear-gradient(135deg, #1b3a4b 0%, #0e1f28 100%)", // Mitternachtsblau
        "linear-gradient(135deg, #2d312e 0%, #171917 100%)", // Schiefergrau / Anthrazit
        "linear-gradient(135deg, #3d2c1e 0%, #20170f 100%)", // Dunkles Lederbraun
        "linear-gradient(135deg, #283618 0%, #131a0b 100%)", // Tannengrün / Oliv
        "linear-gradient(135deg, #4a284a 0%, #241324 100%)", // Dunkles Pflaumenlila
        "linear-gradient(135deg, #5c3a21 0%, #301e11 100%)", // Warmes Holzbraun
        "linear-gradient(135deg, #1f363d 0%, #0e191c 100%)", // Petrol / Dunkelblau
        "linear-gradient(135deg, #4d3319 0%, #261a0c 100%)", // Rostbraun
        "linear-gradient(135deg, #332233 0%, #1a111a 100%)"  // Dunkles Aubergine
    ];

    // Daten aus JSON laden
    fetch('bibliothek.json')
        .then(response => response.json())
        .then(data => {
            allBooks = data.books || [];
            renderBookshelf(allBooks);
        })
        .catch(error => console.error('Fehler beim Laden der Bücher:', error));

    // Event Listener für Tab-Filter (Alle / Haptisch / E-Books)
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');
            if (filter === 'all') {
                renderBookshelf(allBooks);
            } else {
                const filteredBooks = allBooks.filter(book => {
                    if (filter === 'Print') {
                        return book.format.toLowerCase() !== 'ebook';
                    }
                    return book.format.toLowerCase() === filter.toLowerCase();
                });
                renderBookshelf(filteredBooks);
            }
        });
    });

    // Regal-Rendering (max 12 Bücher pro Regalboden)
    function renderBookshelf(books) {
        bookshelfWrapper.innerHTML = '';

        if (books.length === 0) {
            bookshelfWrapper.innerHTML = '<p style="text-align:center; color: whitesmoke; font-family: \'Dosis\', sans-serif;">Keine Bücher in dieser Kategorie gefunden.</p>';
            return;
        }

        const booksPerShelf = 12;
        let currentShelf = createShelfElement();

        books.forEach((book, index) => {
            if (index > 0 && index % booksPerShelf === 0) {
                bookshelfWrapper.appendChild(currentShelf);
                currentShelf = createShelfElement();
            }

            // Wähle eine Farbe basierend auf dem Index (rotiert durch die 10 Farben)
            const randomColor = spineColors[index % spineColors.length];

            const bookElement = createBookElement(book, randomColor);
            currentShelf.appendChild(bookElement);
        });

        bookshelfWrapper.appendChild(currentShelf);
    }

    function createShelfElement() {
        const shelf = document.createElement('div');
        shelf.classList.add('shelf-row');
        return shelf;
    }

    function createBookElement(book, spineColor) {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        const isEbook = book.format && book.format.toLowerCase() === 'ebook';
        const badgeClass = isEbook ? 'ebook' : 'print';
        const formatLabel = isEbook ? 'eBook' : 'Print';

        // Pfad- und Endungsanpassung (.jpg statt .jpeg)
        let imagePath = book.cover;
        if (imagePath) {
            if (imagePath.endsWith('.jpeg')) {
                imagePath = imagePath.replace('.jpeg', '.jpg');
            }
            if (!imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
                imagePath = 'images/bibliothek/' + imagePath;
            }
        }

        bookCard.innerHTML = `
            <div class="book-spine" style="background: ${spineColor};">
                <span class="spine-title">${book.title}</span>
            </div>
            <div class="book-cover-container">
                <img src="${imagePath}" alt="${book.title}" class="book-cover" onerror="this.src='https://via.placeholder.com/130x190?text=Kein+Cover'">
                <span class="format-badge ${badgeClass}">${formatLabel}</span>
            </div>
        `;

        return bookCard;
    }
});