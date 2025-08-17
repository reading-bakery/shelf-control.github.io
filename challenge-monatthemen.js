async function loadMonateCarousel() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=4625754&single=true&output=csv';
    const res = await fetch(url);
    const text = await res.text();
    const rows = text.split('\n').map(r => r.split(','));
    const container = document.querySelector('.monatschallenge');

    if (rows.length < 2) return;

    const header = rows[0];
    const dataRows = rows.slice(1);

    let currentSlide;

    // Carousel-Dots-Container
    const numSlides = Math.ceil(dataRows.length / 3);
    const dotsContainer = document.createElement('div');
    dotsContainer.classList.add('carousel-dots');
    container.insertBefore(dotsContainer, container.firstChild); // Dots an den Anfang des Containers verschieben

    dataRows.forEach((row, index) => {
        if (index % 3 === 0) { // 3 Monate pro Slide
            currentSlide = document.createElement('div');
            currentSlide.classList.add('carousel-slide-2');
            container.appendChild(currentSlide);
        }

        const monthName = row[0] || `Monat ${index + 1}`;
        const thema = row[1] || 'Noch kein Thema';

        const monthDiv = document.createElement('div');
        monthDiv.classList.add('month-block-2');
        monthDiv.innerHTML = `
            <h4>${monthName}: ${thema}</h4>
            <div class="books-wrapper-2"></div>
        `;
        currentSlide.appendChild(monthDiv);

        const booksWrapper = monthDiv.querySelector('.books-wrapper-2');

        // Cover-Spalten: D, G, J -> Index 3,6,9
        // Status-Spalten: E, H, K -> Index 4,7,10
        const coverIndexes = [3, 6, 9];
        const statusIndexes = [4, 7, 10];

        coverIndexes.forEach((coverIndex, i) => {
            const coverUrl = row[coverIndex];
            if (coverUrl && coverUrl.trim() !== '') {
                // Status aus Sheet auslesen, Großschreibung erzwingen
                const statusRaw = (row[statusIndexes[i]] || 'NO').trim().toUpperCase();

                // Farben dynamisch zuweisen
                const statusColors = {
                    'YES': '#3CB371',
                    'ABBR': '#9370DB',
                    'NO': 'gray'
                };

                const color = statusColors[statusRaw] || 'gray';

                const bookDiv = document.createElement('div');
                bookDiv.classList.add('book');
                bookDiv.innerHTML = `
                    <img src="${coverUrl}" alt="Buchcover">
                    <div class="book-status-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="${color}" class="bi bi-award-fill" viewBox="0 0 16 16">
                            <path d="m8 0 1.669.864 1.858.282.842 1.68 1.337 1.32L13.4 6l.306 1.854-1.337 1.32-.842 1.68-1.858.282L8 12l-1.669-.864-1.858-.282-.842-1.68-1.337-1.32L2.6 6l-.306-1.854 1.337-1.32.842-1.68L6.331.864z"/>
                            <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/>
                        </svg>
                    </div>
                `;
                booksWrapper.appendChild(bookDiv);
            }
        });
    });

    // Initiale Slide anzeigen
    const slides = container.querySelectorAll('.carousel-slide-2');
    slides.forEach((s, i) => s.style.display = i === 0 ? 'block' : 'none');

    // Dots erstellen
    for (let i = 0; i < numSlides; i++) {
        const dot = document.createElement('button');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            slides.forEach(s => s.style.display = 'none');
            slides[i].style.display = 'block';
            dotsContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            dot.classList.add('active');
        });
        dotsContainer.appendChild(dot);
    }
}

loadMonateCarousel();
