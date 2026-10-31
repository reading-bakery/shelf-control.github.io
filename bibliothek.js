document.addEventListener('DOMContentLoaded', () => {
    const bookshelfWrapper = document.getElementById('bookshelfWrapper');
    const tabButtons = document.querySelectorAll('.tab-btn');
    let allBooks = [];

    const spineColors = [
        "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
        "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)",
        "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
        "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
        "linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)",
        "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
        "linear-gradient(135deg, #fffde7 0%, #fff9c4 100%)",
        "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
        "linear-gradient(135deg, #fbe9e7 0%, #ffccbc 100%)",
        "linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%)"
    ];

    fetch('bibliothek.json')
        .then(response => response.json())
        .then(data => {
            allBooks = data.books || [];
            renderBookshelf(allBooks);
        })
        .catch(error => console.error('Fehler beim Laden der Bücher:', error));

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');
            if (filter === 'all') {
                renderBookshelf(allBooks);
            } else {
                const filteredBooks = allBooks.filter(book => {
                    const format = book.format ? book.format.toLowerCase() : '';
                    if (filter === 'Print') {
                        return format !== 'ebook' && format !== 'deko' && format !== 'deko2';
                    }
                    return format === filter.toLowerCase();
                });
                renderBookshelf(filteredBooks);
            }
        });
    });

    function renderBookshelf(books) {
        bookshelfWrapper.innerHTML = '';

        if (books.length === 0) {
            bookshelfWrapper.innerHTML = '<p style="text-align:center; color: whitesmoke; font-family: \'Dosis\', sans-serif;">Keine Einträge in dieser Kategorie gefunden.</p>';
            return;
        }

        const booksPerShelf = 12;
        let currentShelf = createShelfElement();

        books.forEach((book, index) => {
            if (index > 0 && index % booksPerShelf === 0) {
                bookshelfWrapper.appendChild(currentShelf);
                currentShelf = createShelfElement();
            }

            const randomColor = spineColors[index % spineColors.length];
            const element = createShelfItemElement(book, randomColor);
            currentShelf.appendChild(element);
        });

        bookshelfWrapper.appendChild(currentShelf);
    }

    function createShelfElement() {
        const shelf = document.createElement('div');
        shelf.classList.add('shelf-row');
        return shelf;
    }

    function createShelfItemElement(item, spineColor) {
        const itemCard = document.createElement('div');
        
        const format = item.format ? item.format.toLowerCase() : '';
        const isDeko = format === 'deko';
        const isDeko2 = format === 'deko2';

        if (isDeko) {
            itemCard.classList.add('deko-card');
            let imagePath = item.cover;
            if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
                imagePath = 'images/bibliothek/' + imagePath;
            }

            itemCard.innerHTML = `
                <div class="deko-container">
                    <img src="${imagePath}" alt="${item.title}">
                </div>
            `;
        } else if (isDeko2) {
            itemCard.classList.add('deko2-card');
            let imagePath = item.cover;
            if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
                imagePath = 'images/bibliothek/' + imagePath;
            }

            itemCard.innerHTML = `
                <div class="deko2-container">
                    <img src="${imagePath}" alt="${item.title}">
                </div>
            `;
        } else {
            itemCard.classList.add('book-card');

            const isEbook = format === 'ebook';
            const badgeClass = isEbook ? 'ebook' : 'print';
            const formatLabel = isEbook ? 'eBook' : 'Print';

            let imagePath = item.cover;
            if (imagePath) {
                if (imagePath.endsWith('.jpeg')) {
                    imagePath = imagePath.replace('.jpeg', '.jpg');
                }
                if (!imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
                    imagePath = 'images/bibliothek/' + imagePath;
                }
            }

            itemCard.innerHTML = `
                <div class="book-spine" style="background: ${spineColor};">
                    <span class="spine-title">${item.title}</span>
                </div>
                <div class="book-cover-container">
                    <img src="${imagePath}" alt="${item.title}" class="book-cover" onerror="this.src='https://via.placeholder.com/130x190?text=Kein+Cover'">
                    <span class="format-badge ${badgeClass}">${formatLabel}</span>
                </div>
            `;
        }

        return itemCard;
    }
});