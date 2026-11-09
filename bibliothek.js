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
            const rezi = item.rezi ? item.rezi.toLowerCase() : '';
            const title = item.title ? item.title.toLowerCase() : '';
            const autor = item.autor ? item.autor.toLowerCase() : '';
            const isDeko = format === 'deko' || format === 'deko2';

            if (query.length > 0 && isDeko) return false;

            let matchesTab = true;
            if (filter === 'Print') {
                matchesTab = format !== 'ebook';
            } else if (filter === 'eBook') {
                matchesTab = format === 'ebook';
            } else if (filter === 'rezi') {
                matchesTab = rezi === 'ja';
            } else if (filter === 'Original') {
                matchesTab = sprache === 'original';
            }

            if (isDeko) {
                if (query.length > 0) return false;
                return true; 
            }

            const matchesSearch = title.includes(query) || autor.includes(query);

            return matchesTab && matchesSearch;
        });

        const isSearchActive = query.length > 0;
        renderBookshelf(filtered, true, isSearchActive);
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

        // Bücher alphabetisch nach Titel sortieren (mit localeCompare für Umlaute)
        booksOnly.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'de', { sensitivity: 'base' }));

        const isMobile = window.innerWidth <= 480;
        // Erkennung für Tablets im Hochformat (z.B. iPad Air 4 mit ~820px Breite)
        const isIPadPortrait = window.innerWidth >= 768 && window.innerWidth <= 850 && window.innerHeight > window.innerWidth;

        const allDecoSources = allItems.filter(item => {
            const fmt = item.format ? item.format.toLowerCase() : '';
            return fmt === 'deko' || fmt === 'deko2';
        });

        const decoOnly = items.filter(item => {
            const fmt = item.format ? item.format.toLowerCase() : '';
            if (isMobile && fmt === 'deko2') return false;
            return fmt === 'deko' || fmt === 'deko2';
        });

        const availableDecos = decoOnly.length > 0 ? decoOnly : (allDecoSources.length > 0 ? allDecoSources : [
            { title: "Farn", format: "Deko", cover: "farn.png" }
        ]);

        const finalDisplayList = [];
        let bookCounter = 0;
        let decoIndex = 0;

        booksOnly.forEach((book) => {
            finalDisplayList.push(book);
            bookCounter++;

            if (!isSearchMode) {
                if (bookCounter === 11 || (bookCounter > 11 && (bookCounter - 11) % 23 === 0)) {
                    const currentDeco = availableDecos[decoIndex % availableDecos.length];
                    finalDisplayList.push(currentDeco);
                    decoIndex++;
                }
            }
        });

        // Limit-Definitionen: Auf iPad Air 4 Hochkant = 7 Bücher + 1 Counter = 8 Elemente oben, danach 11 Bücher pro Brett
        const firstShelfLimit = isSearchMode ? 5 : (isIPadPortrait ? 7 : (isMobile ? 9 : 10));
        const subsequentShelfLimit = isSearchMode ? 8 : (isIPadPortrait ? 11 : (isMobile ? 9 : 15));

        let currentShelf = createShelfElement(isSearchMode);

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
        const rezi = item.rezi ? item.rezi.toLowerCase() : '';
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
            const isRezi = rezi === 'ja';

            let imagePath = item.cover;
            if (imagePath) {
                if (imagePath.endsWith('.jpeg')) {
                    imagePath = imagePath.replace('.jpeg', '.jpg');
                }
                if (!imagePath.startsWith('http') && !imagePath.startsWith('images/')) {
                    imagePath = 'images/bibliothek/' + imagePath;
                }
            }

            let leftBadgeHtml = '';
            if (isRezi) {
                leftBadgeHtml = '<span class="format-badge original">Rezi</span>';
            } else if (isOriginal) {
                leftBadgeHtml = '<span class="format-badge original">Original</span>';
            }

            itemCard.innerHTML = `
                <div class="book-spine" style="background: ${spineColor};">
                    <span class="spine-title">${item.title}</span>
                </div>
                <div class="book-cover-container">
                    <img src="${imagePath}" alt="${item.title}" class="book-cover" onerror="this.src='https://via.placeholder.com/130x190?text=Kein+Cover'">
                    ${leftBadgeHtml}
                    <span class="format-badge ${badgeClass}">${formatLabel}</span>
                </div>
            `;

            itemCard.addEventListener('click', () => {
                const modal = document.getElementById('bookModal');
                const modalCover = document.getElementById('modalCover');
                const modalTitle = document.getElementById('modalTitle');
                const modalKlappentext = document.getElementById('modalKlappentext');

                if (modal) {
                    const isEnglish = item.sprache && (item.sprache.toLowerCase() === 'en' || item.sprache.toLowerCase() === 'englisch' || item.sprache.toLowerCase() === 'original');
                    const langCode = isEnglish ? 'en' : 'de';

                    modalTitle.setAttribute('lang', langCode);
                    modalKlappentext.setAttribute('lang', langCode);

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