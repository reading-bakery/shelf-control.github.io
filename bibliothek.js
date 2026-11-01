document.addEventListener('DOMContentLoaded', () => {
    const bookshelfWrapper = document.getElementById('bookshelfWrapper');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('searchInput');
    let allItems = [];

    // 17 verschiedene Farben/Verläufe für die Buchrücken
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
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    function applyFilters() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const activeTab = document.querySelector('.tab-btn.active');
        const filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';

        const filtered = allItems.filter(item => {
            const format = item.format ? item.format.toLowerCase() : '';
            const sprache = item.sprache ? item.sprache.toLowerCase() : '';
            const title = item.title ? item.title.toLowerCase() : '';
            const autor = item.autor ? item.autor.toLowerCase() : '';
            const isDeko = format === 'deko' || format === 'deko2';

            let matchesTab = true;
            if (filter === 'Print') {
                matchesTab = format !== 'ebook' && !isDeko;
            } else if (filter === 'eBook') {
                matchesTab = format === 'ebook';
            } else if (filter === 'Original') {
                matchesTab = sprache === 'original' && !isDeko;
            }

            const matchesSearch = title.includes(query) || autor.includes(query);

            if (query.length > 0 && isDeko) return false;

            return matchesTab && matchesSearch;
        });

        const isSearchActive = query.length > 0;
        renderBookshelf(filtered, isSearchActive, isSearchActive);
    }

    function renderBookshelf(items, isFiltered = false, isSearchMode = false) {
        bookshelfWrapper.innerHTML = '';

        if (items.length === 0) {
            bookshelfWrapper.innerHTML = '<p style="text-align:center; color: whitesmoke; font-family: \'Dosis\', sans-serif;">Keine Einträge in dieser Kategorie gefunden.</p>';
            return;
        }

        const booksOnly = items.filter(item => {
            const fmt = item.format ? item.format.toLowerCase() : '';
            const isBook = fmt !== 'deko' && fmt !== 'deko2';
            const hasTitle = item.title && item.title.trim() !== '';
            return isBook && hasTitle;
        });

        // Bücher alphabetisch nach Titel sortieren (mit localesCompare für Umlaute)
        booksOnly.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'de', { sensitivity: 'base' }));

        const isMobile = window.innerWidth <= 480;

        const decoOnly = items.filter(item => {
            const fmt = item.format ? item.format.toLowerCase() : '';
            // Deko2 auf Mobilgeräten (Google Pixel 10a) herausfiltern
            if (isMobile && fmt === 'deko2') return false;
            return fmt === 'deko' || fmt === 'deko2';
        });

        const defaultDecos = decoOnly.length > 0 ? decoOnly : [
            { title: "Farn", format: "Deko", cover: "farn.png" }
        ];

        const finalDisplayList = [];
        let bookCounter = 0;
        let decoIndex = 0;

        booksOnly.forEach((book) => {
            finalDisplayList.push(book);
            bookCounter++;

            if (!isFiltered) {
                if (bookCounter === 11 || (bookCounter > 11 && (bookCounter - 11) % 23 === 0)) {
                    const currentDeco = defaultDecos[decoIndex % defaultDecos.length];
                    finalDisplayList.push(currentDeco);
                    decoIndex++;
                }
            }
        });

        // Regalbegrenzung für Mobilgeräte: Erstes Brett = 3 Bücher, Folgebretter = 6 Bücher
        const firstShelfLimit = isSearchMode ? 5 : (isMobile ? 9 : 10);
        const subsequentShelfLimit = isSearchMode ? 8 : (isMobile ? 8 : 15);

        let currentShelf = createShelfElement(isSearchMode);

        // Retro Flip-Clock Zähler oben auf dem ersten Regalboden einfügen
        const countBadge = document.createElement('div');
        countBadge.classList.add('flip-counter-container');
        
        const countStr = String(booksOnly.length);
        let digitsHtml = '';
        for (let i = 0; i < countStr.length; i++) {
            digitsHtml += `<div class="flip-card">${countStr[i]}</div>`;
        }

        countBadge.innerHTML = `
            <div style="display: flex; gap: 4px;">${digitsHtml}</div>
            <span class="flip-label">Bücher</span>
        `;
        currentShelf.appendChild(countBadge);

        finalDisplayList.forEach((item, index) => {
            const isFirstShelfFull = (index === firstShelfLimit);
            const isSubsequentShelfFull = (index > firstShelfLimit) && ((index - firstShelfLimit) % subsequentShelfLimit === 0);

            if (isFirstShelfFull || isSubsequentShelfFull) {
                bookshelfWrapper.appendChild(currentShelf);
                currentShelf = createShelfElement(isSearchMode);
            }

            const randomColor = spineColors[index % spineColors.length];
            const element = createShelfItemElement(item, randomColor);
            currentShelf.appendChild(element);
        });

        bookshelfWrapper.appendChild(currentShelf);
    }

    function createShelfElement(isSearchMode = false) {
        const shelf = document.createElement('div');
        shelf.classList.add('shelf-row');
        if (isSearchMode) {
            shelf.classList.add('search-mode');
        }
        return shelf;
    }

    function createShelfItemElement(item, spineColor) {
        const itemCard = document.createElement('div');
        
        const format = item.format ? item.format.toLowerCase() : '';
        const sprache = item.sprache ? item.sprache.toLowerCase() : '';
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
            const isOriginal = sprache === 'original';

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
                    ${isOriginal ? '<span class="format-badge original">Original</span>' : ''}
                    <span class="format-badge ${badgeClass}">${formatLabel}</span>
                </div>
            `;

            itemCard.addEventListener('click', () => {
                const modal = document.getElementById('bookModal');
                const modalCover = document.getElementById('modalCover');
                const modalTitle = document.getElementById('modalTitle');
                const modalKlappentext = document.getElementById('modalKlappentext');

                if (modal) {
                    modalCover.src = imagePath;
                    modalTitle.textContent = item.title;
                    modalKlappentext.textContent = item.klappentext && item.klappentext.trim() !== '' 
                        ? item.klappentext 
                        : 'Noch kein Klappentext hinterlegt.';
                    modal.style.display = 'flex';
                }
            });
        }

        return itemCard;
    }

    document.addEventListener('click', (e) => {
        const modal = document.getElementById('bookModal');
        if (modal && (e.target.classList.contains('close-modal') || e.target === modal)) {
            modal.style.display = 'none';
        }
    });
});