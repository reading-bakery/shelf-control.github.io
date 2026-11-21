document.addEventListener('DOMContentLoaded', () => {
    const bookshelfWrapper = document.getElementById('bookshelfWrapper');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('searchInput');

    const modal = document.getElementById('bookModal');
    const modalCover = document.getElementById('modalCover');
    const modalTitle = document.getElementById('modalTitle');
    const modalKlappentext = document.getElementById('modalKlappentext');
    const modalLoanInfo = document.getElementById('modalLoanInfo');

    const loanModal = document.getElementById('loanModal');
    const closeLoanModal = document.getElementById('closeLoanModal');
    const loanBookTitle = document.getElementById('loanBookTitle');
    const loanForm = document.getElementById('loanForm');
    const loanPersonInput = document.getElementById('loanPersonInput');
    const loanDateInput = document.getElementById('loanDateInput');
    const submitLoanBtn = loanForm ? loanForm.querySelector('.loan-submit-btn') : null;
    const returnLoanBtn = document.getElementById('returnLoanBtn');
    const cancelLoanBtn = document.getElementById('cancelLoanBtn');
    const loanStatusMsg = document.getElementById('loanStatusMsg');

    // Veröffentlichte CSV-Datei des Ausleih-Sheets
    const LOANS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=33699038&single=true&output=csv';

    // Google Form Konfiguration
    const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/DEIN_FORMULAR_ID/formResponse';
    const ENTRY_BUCH = 'entry.346005667';
    const ENTRY_WER = 'entry.1529153488';
    const ENTRY_DATUM_LEIHE = 'entry.1913292543';
    const ENTRY_ZURUECK = 'entry.5600036';
    const STORAGE_KEY = 'shelfControlAusleihen_v1';

    let allItems = [];
    let activeModalBook = null;
    let localLoansMap = loadLocalLoans();
    let sheetLoansByTitle = {};

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

    function loadLocalLoans() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (err) {
            console.error('Fehler beim Laden lokaler Ausleihen:', err);
            return {};
        }
    }

    function saveLocalLoans() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(localLoansMap));
        } catch (err) {
            console.error('Fehler beim Speichern lokaler Ausleihen:', err);
        }
    }

    function normalizeTitle(title) {
        return (title || '').trim().toLowerCase();
    }

    function parseCSV(csvText) {
        const rows = [];
        let currentRow = [];
        let currentVal = '';
        let inQuotes = false;

        for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i];
            const nextChar = csvText[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentVal += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                currentRow.push(currentVal.trim());
                currentVal = '';
            } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
                if (char === '\r') i++;
                currentRow.push(currentVal.trim());
                if (currentRow.some(cell => cell !== '')) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentVal = '';
            } else {
                currentVal += char;
            }
        }

        if (currentVal.length > 0 || currentRow.length > 0) {
            currentRow.push(currentVal.trim());
            if (currentRow.some(cell => cell !== '')) {
                rows.push(currentRow);
            }
        }

        return rows;
    }

    async function fetchLoansFromCSV() {
        try {
            const cacheBusterUrl = `${LOANS_CSV_URL}&_t=${Date.now()}`;
            const response = await fetch(cacheBusterUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const csvText = await response.text();
            const rows = parseCSV(csvText);

            if (rows.length < 2) return;

            const headers = rows[0].map(h => h.toLowerCase());
            const idxBuch = headers.findIndex(h => h.includes('buch') || h.includes('titel'));
            const idxWer = headers.findIndex(h => h.includes('wer') || h.includes('person') || h.includes('an wen'));
            const idxDatum = headers.findIndex(h => h.includes('datum') || h.includes('leihe'));
            const idxZurueck = headers.findIndex(h => h.includes('zurück') || h.includes('zurueck') || h.includes('rückgabe'));

            const parsedMap = {};

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const buch = idxBuch >= 0 ? (row[idxBuch] || '') : (row[1] || '');
                const wer = idxWer >= 0 ? (row[idxWer] || '') : (row[2] || '');
                const datum = idxDatum >= 0 ? (row[idxDatum] || '') : (row[3] || '');
                const zurueck = idxZurueck >= 0 ? (row[idxZurueck] || '') : (row[4] || '');

                if (!buch) continue;

                const norm = normalizeTitle(buch);
                if (zurueck && zurueck.trim() !== '') {
                    delete parsedMap[norm];
                    delete localLoansMap[norm];
                } else if (wer && wer.trim() !== '') {
                    parsedMap[norm] = { wer: wer.trim(), datum: datum.trim() };
                }
            }

            saveLocalLoans();
            sheetLoansByTitle = parsedMap;
        } catch (err) {
            console.warn('CSV-Ausleihen konnten nicht geladen werden:', err);
        }
    }

    function getLoanForBook(book) {
        if (!book) return null;
        const norm = normalizeTitle(book.title);

        if (Object.prototype.hasOwnProperty.call(localLoansMap, norm)) {
            return localLoansMap[norm];
        }
        if (sheetLoansByTitle[norm]) {
            return sheetLoansByTitle[norm];
        }
        if (book.ausgeliehenAn || book.wer || book.datumLeihe) {
            return {
                wer: book.ausgeliehenAn || book.wer || '',
                datum: book.datumLeihe || ''
            };
        }
        return null;
    }

    function formatGermanDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
        return dateStr;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function updateModalLoanDisplay(book) {
        if (!modalLoanInfo || !book) return;
        const loan = getLoanForBook(book);
        if (loan && loan.wer) {
            const dateFormatted = formatGermanDate(loan.datum);
            modalLoanInfo.innerHTML = `
                <div><strong>Ausgeliehen an:</strong> ${escapeHtml(loan.wer)}</div>
                ${dateFormatted ? `<div><strong>Seit:</strong> ${escapeHtml(dateFormatted)}</div>` : ''}
            `;
            modalLoanInfo.style.display = 'block';
        } else {
            modalLoanInfo.innerHTML = '';
            modalLoanInfo.style.display = 'none';
        }
    }

    function setLoanModalMode(isLoaned) {
        if (submitLoanBtn) {
            submitLoanBtn.textContent = 'Buch ausleihen';
            submitLoanBtn.style.display = isLoaned ? 'none' : 'inline-block';
        }
        if (returnLoanBtn) {
            returnLoanBtn.textContent = 'Buch zurückgegeben';
            returnLoanBtn.style.display = isLoaned ? 'inline-block' : 'none';
        }
        if (loanPersonInput) {
            loanPersonInput.readOnly = isLoaned;
        }
        if (loanDateInput) {
            loanDateInput.readOnly = isLoaned;
        }
    }

    function openLoanOverlay(book) {
        if (!loanModal || !book) return;
        const existingLoan = getLoanForBook(book);
        const isLoaned = Boolean(existingLoan && existingLoan.wer && existingLoan.wer.trim() !== '');
        const todayIso = new Date().toISOString().split('T')[0];

        if (loanBookTitle) {
            loanBookTitle.textContent = book.title || '';
        }
        loanPersonInput.value = isLoaned ? existingLoan.wer : '';
        loanDateInput.value = isLoaned && existingLoan.datum && existingLoan.datum.includes('-')
            ? existingLoan.datum
            : todayIso;
        loanStatusMsg.textContent = '';

        setLoanModalMode(isLoaned);

        loanModal.style.display = 'flex';
        if (!isLoaned) {
            loanPersonInput.focus();
        }
    }

    function closeLoanOverlay() {
        if (loanModal) {
            loanModal.style.display = 'none';
        }
        if (loanStatusMsg) {
            loanStatusMsg.textContent = '';
        }
    }

    async function sendToGoogleForm(paramsObj) {
        if (!GOOGLE_FORM_ACTION_URL || GOOGLE_FORM_ACTION_URL.includes('DEIN_FORMULAR_ID')) {
            return { sent: false, reason: 'no-url' };
        }

        const formData = new URLSearchParams();
        Object.entries(paramsObj).forEach(([key, val]) => {
            formData.append(key, val);
        });

        try {
            await fetch(GOOGLE_FORM_ACTION_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });
            return { sent: true };
        } catch (err) {
            console.error('Fehler beim Senden an Google Form:', err);
            return { sent: false, reason: 'error' };
        }
    }

    Promise.all([
        fetch('bibliothek.json').then(res => res.json()),
        fetchLoansFromCSV()
    ])
        .then(([data]) => {
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
            const loan = getLoanForBook(item);
            const isLoaned = Boolean(loan && loan.wer && loan.wer.trim() !== '');

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
            } else if (filter === 'leihe') {
                matchesTab = isLoaned;
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

        // Bücher alphabetisch nach Titel sortieren
        booksOnly.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'de', { sensitivity: 'base' }));

        // Exakte Geräte-Unterscheidung per JavaScript
        const width = window.innerWidth;
        const height = window.innerHeight;

        const isMobile = width <= 480;
        const isTabletPortrait = width > 480 && width <= 900 && height > width;
        const isTabletLandscape = width > 480 && width <= 1200 && height <= width;

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

        let firstShelfLimit, subsequentShelfLimit;

        if (isSearchMode) {
            firstShelfLimit = 5;
            subsequentShelfLimit = 8;
        } else if (isMobile) {
            firstShelfLimit = 9;
            subsequentShelfLimit = 9;
        } else if (isTabletPortrait) {
            firstShelfLimit = 5;
            subsequentShelfLimit = 9;
        } else if (isTabletLandscape) {
            firstShelfLimit = 8;
            subsequentShelfLimit = 12;
        } else {
            firstShelfLimit = 10;
            subsequentShelfLimit = 15;
        }

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
                if (modal) {
                    activeModalBook = item;

                    const isEnglish = item.sprache && (item.sprache.toLowerCase() === 'en' || item.sprache.toLowerCase() === 'englisch' || item.sprache.toLowerCase() === 'original');
                    const langCode = isEnglish ? 'en' : 'de';

                    modalTitle.setAttribute('lang', langCode);
                    modalKlappentext.setAttribute('lang', langCode);

                    modalCover.src = imagePath;
                    modalTitle.textContent = item.title;
                    modalKlappentext.textContent = item.klappentext && item.klappentext.trim() !== '' 
                        ? item.klappentext 
                        : 'Noch kein Klappentext hinterlegt.';

                    closeLoanOverlay();
                    updateModalLoanDisplay(item);

                    modal.style.display = 'flex';
                }
            });
        }

        return itemCard;
    }

    // Klick auf das Cover im Buch-Modal öffnet das eigene Ausleih-Modal darüber
    if (modalCover) {
        modalCover.addEventListener('click', () => {
            if (!activeModalBook) return;
            openLoanOverlay(activeModalBook);
        });
    }

    if (closeLoanModal) {
        closeLoanModal.addEventListener('click', closeLoanOverlay);
    }

    if (cancelLoanBtn) {
        cancelLoanBtn.addEventListener('click', closeLoanOverlay);
    }

    if (loanModal) {
        loanModal.addEventListener('click', (e) => {
            if (e.target === loanModal) {
                closeLoanOverlay();
            }
        });
    }

    // Buch zurückgeben
    if (returnLoanBtn) {
        returnLoanBtn.addEventListener('click', async () => {
            if (!activeModalBook) return;

            const norm = normalizeTitle(activeModalBook.title);
            const existingLoan = getLoanForBook(activeModalBook);
            const todayIso = new Date().toISOString().split('T')[0];

            localLoansMap[norm] = null;
            delete sheetLoansByTitle[norm];
            saveLocalLoans();

            updateModalLoanDisplay(activeModalBook);
            applyFilters();

            const result = await sendToGoogleForm({
                [ENTRY_BUCH]: activeModalBook.title || '',
                [ENTRY_WER]: existingLoan ? existingLoan.wer : '',
                [ENTRY_DATUM_LEIHE]: existingLoan ? existingLoan.datum : '',
                [ENTRY_ZURUECK]: todayIso
            });

            loanStatusMsg.textContent = result.sent
                ? 'Buch als zurückgegeben markiert und an Google Tabelle gesendet.'
                : 'Buch als zurückgegeben markiert.';

            loanPersonInput.value = '';
            loanDateInput.value = todayIso;
            setLoanModalMode(false);
            loanPersonInput.focus();
        });
    }

    // Neue Ausleihe speichern
    if (loanForm) {
        loanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!activeModalBook) return;

            const wer = loanPersonInput.value.trim();
            const datum = loanDateInput.value.trim();
            if (!wer || !datum) return;

            const norm = normalizeTitle(activeModalBook.title);
            const loanEntry = { wer, datum };
            localLoansMap[norm] = loanEntry;
            sheetLoansByTitle[norm] = loanEntry;
            saveLocalLoans();

            updateModalLoanDisplay(activeModalBook);
            applyFilters();

            setLoanModalMode(true);

            const result = await sendToGoogleForm({
                [ENTRY_BUCH]: activeModalBook.title || '',
                [ENTRY_WER]: wer,
                [ENTRY_DATUM_LEIHE]: datum,
                [ENTRY_ZURUECK]: ''
            });

            loanStatusMsg.textContent = result.sent
                ? 'Ausleihe gespeichert und an Google Tabelle gesendet.'
                : 'Ausleihe gespeichert.';
        });
    }

    document.addEventListener('click', (e) => {
        if (modal && (e.target.classList.contains('close-modal') || e.target === modal)) {
            modal.style.display = 'none';
            activeModalBook = null;
            closeLoanOverlay();
        }
    });
});