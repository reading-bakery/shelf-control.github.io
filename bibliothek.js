document.addEventListener('DOMContentLoaded', () => {
    const bookshelfWrapper = document.getElementById('bookshelfWrapper');
    const tabButtons = document.querySelectorAll('.tab-btn');
    let allItems = [];

    // Ausgewogene Mischung aus hellen Basistönen und kräftigen, harmonischen Farbverläufen für perfekte Lesbarkeit
    const spineColors = [
        "linear-gradient(135deg, #d65d85 0%, #a23b5f 100%)", // 1. Sanftes Rosa-Pink
        "linear-gradient(135deg, #a1dbd8 0%, #587371 100%)", // 2. Helles Mint-Türkis
        "linear-gradient(135deg, #ffd166 0%, #f4a261 100%)", // 3. Kräftiges Sonnen-Gelb zu Orange
        "linear-gradient(135deg, #70758f 0%, #424e9e 100%)", // 4. Helles Lavendelblau
        "linear-gradient(135deg, #e76f51 0%, #bc4749 100%)", // 5. Kräftiges Terrakotta zu Rostrot
        "linear-gradient(135deg, #aebd9c 0%, #5e8235 100%)", // 6. Frisches Hellgrün
        "linear-gradient(135deg, #2a9d8f 0%, #264653 100%)", // 7. Kräftiges Petrol zu Dunkelblau
        "linear-gradient(135deg, #98815c 0%, #ac8347 100%)", // 8. Helles Vanille-Beige
        "linear-gradient(135deg, #c783d1 0%, #522d59 100%)", // 9. Zartes Flieder-Lila
        "linear-gradient(135deg, #d78769 0%, #783a25 100%)", // 10. Warmes Taupe / Braun-Grau
        "linear-gradient(135deg, #da6779 0%, #c41628 100%)", // 11. Sehr helles Pastell-Koralle
        "linear-gradient(135deg, #73989c 0%, #266e77 100%)", // 12. Helles Eisblau
        "linear-gradient(135deg, #d3cb75 0%, #55512a 100%)", // 13. Cremiges Pastellgelb
        "linear-gradient(135deg, #7f7393 0%, #5123a1 100%)", // 14. Kräftiges Lavendel-Violett
        "linear-gradient(135deg, #688069 0%, #1b7d20 100%)", // 15. Saftiges Frühlingsgrün
        "linear-gradient(135deg, #beaa8b 0%, #c38426 100%)", // 16. Kräftiges Bernstein-Orange
        "linear-gradient(135deg, #889ca7 0%, #2076a0 100%)"  // 17. Edles Schiefer-Blau-Grau
    ];

    fetch('bibliothek.json')
        .then(response => response.json())
        .then(data => {
            allItems = data.books || [];
            renderBookshelf(allItems);
        })
        .catch(error => console.error('Fehler beim Laden der Bibliothek:', error));

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');
            if (filter === 'all') {
                renderBookshelf(allItems);
            } else {
                const filtered = allItems.filter(item => {
                    const format = item.format ? item.format.toLowerCase() : '';
                    if (filter === 'Print') {
                        return format !== 'ebook' && format !== 'deko' && format !== 'deko2';
                    }
                    return format === filter.toLowerCase();
                });
                renderBookshelf(filtered, true);
            }
        });
    });

    function renderBookshelf(items, isFiltered = false) {
        bookshelfWrapper.innerHTML = '';

        if (items.length === 0) {
            bookshelfWrapper.innerHTML = '<p style="text-align:center; color: whitesmoke; font-family: \'Dosis\', sans-serif;">Keine Einträge in dieser Kategorie gefunden.</p>';
            return;
        }

        // Trenne echte Bücher von Dekorationen
        const booksOnly = items.filter(item => {
            const fmt = item.format ? item.format.toLowerCase() : '';
            return fmt !== 'deko' && fmt !== 'deko2';
        });

        const decoOnly = items.filter(item => {
            const fmt = item.format ? item.format.toLowerCase() : '';
            return fmt === 'deko' || fmt === 'deko2';
        });

        const defaultDecos = decoOnly.length > 0 ? decoOnly : [
            { title: "Farn", format: "Deko", cover: "farn.png" },
            { title: "Tute", format: "Deko2", cover: "tute.png" }
        ];

        // Ersten Deko-Einschub nach 7 Büchern, danach alle 23 Bücher
        const finalDisplayList = [];
        let bookCounter = 0;
        let decoIndex = 0;

        booksOnly.forEach((book) => {
            finalDisplayList.push(book);
            bookCounter++;

            if (!isFiltered) {
                if (bookCounter === 7 || (bookCounter > 7 && (bookCounter - 7) % 23 === 0)) {
                    const currentDeco = defaultDecos[decoIndex % defaultDecos.length];
                    finalDisplayList.push(currentDeco);
                    decoIndex++;
                }
            }
        });

        // Aufteilen auf Regalböden
        const itemsPerShelf = 15;
        let currentShelf = createShelfElement();

        finalDisplayList.forEach((item, index) => {
            if (index > 0 && index % itemsPerShelf === 0) {
                bookshelfWrapper.appendChild(currentShelf);
                currentShelf = createShelfElement();
            }

            const randomColor = spineColors[index % spineColors.length];
            const element = createShelfItemElement(item, randomColor);
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