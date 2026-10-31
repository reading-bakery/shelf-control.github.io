document.addEventListener('DOMContentLoaded', () => {
    const bookshelfWrapper = document.getElementById('bookshelfWrapper');
    const tabButtons = document.querySelectorAll('.tab-btn');
    let allItems = [];

    // Neue Farbpalette aus deinen Bildern (abwechselnde Verläufe für die Buchrücken)
    const spineColors = [
        "linear-gradient(135deg, #F6BD60 0%, #F7EDE2 100%)", // Palette 1: Gelb zu Cremeweiß[cite: 17]
        "linear-gradient(135deg, #F5CAC3 0%, #84A59D 100%)", // Palette 1: Altrosa zu Salbeigrün[cite: 17]
        "linear-gradient(135deg, #F28482 0%, #F6BD60 100%)", // Palette 1: Koralle zu Gelb[cite: 17]
        "linear-gradient(135deg, #0b4f6c 0%, #39739d 100%)", // Palette 2: Tiefes Ozeanblau zu Hellblau[cite: 18]
        "linear-gradient(135deg, #e3c4b5 0%, #c18559 100%)", // Palette 2: Sandfarben zu Ocker[cite: 18]
        "linear-gradient(135deg, #e5a954 0%, #fbd19a 100%)", // Palette 3: Herbst-Gold zu hellem Pfirsich[cite: 19]
        "linear-gradient(135deg, #d26a63 0%, #854252 100%)", // Palette 3: Rostrot zu Dunkelkirsche[cite: 19]
        "linear-gradient(135deg, #718798 0%, #e5a954 100%)"  // Palette 3: Schiefergrau zu Gold[cite: 19]
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

        // 1. Trenne echte Bücher von Dekorationen
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

        // 2. Ersten Deko-Einschub nach 7 Büchern, danach alle 23 Bücher
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

        // 3. Aufteilen auf Regalböden
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