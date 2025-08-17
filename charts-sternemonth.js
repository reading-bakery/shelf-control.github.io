async function loadMonateCarousel() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=4625754&single=true&output=csv';
    const res = await fetch(url);
    const text = await res.text();
    const rows = text.split('\n').map(r => r.split(','));
    const container = document.querySelector('.monatschallenge');

    if (rows.length < 2) return;

    const header = rows[0];
    const dataRows = rows.slice(1);

    const monate = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

    // Slide erstellen, 2 Monate pro Slide
    let currentSlide;
    dataRows.forEach((row, index) => {
        if (index % 2 === 0) { // 2 Monate pro Slide
            currentSlide = document.createElement('div');
            currentSlide.classList.add('carousel-slide-2');
            container.appendChild(currentSlide);
        }

        const thema = row[1] || 'Kein Thema';
        // Bilder aus B, C, D, G, J
        const covers = [row[2], row[3], row[4], row[6], row[9]].filter(Boolean);

        const monthDiv = document.createElement('div');
        monthDiv.classList.add('month-block-2');

        const monthName = monate[index] || `Monat ${index + 1}`;
        monthDiv.innerHTML = `
            <h4>${monthName}</h4>
            <div class="month-theme-2">${thema}</div>
            <div class="books-wrapper-2" id="books-${index}"></div>
        `;

        currentSlide.appendChild(monthDiv);

        const booksWrapper = monthDiv.querySelector(`#books-${index}`);
        covers.forEach(url => {
            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');
            bookDiv.innerHTML = `<img src="${url}" alt="Buchcover">`;
            booksWrapper.appendChild(bookDiv);
        });
    });

    // Dots erstellen
    const numSlides = Math.ceil(dataRows.length / 2); // 2 Monate pro Slide
    const dotsContainer = document.createElement('div');
    dotsContainer.classList.add('carousel-dots');
    container.appendChild(dotsContainer);

    const slides = container.querySelectorAll('.carousel-slide-2');
    let currentIndex = 0;

    for (let i = 0; i < numSlides; i++) {
        const dot = document.createElement('button');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            slides.forEach(s => s.style.display = 'none');
            slides[i].style.display = 'block';
            dotsContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            dot.classList.add('active');
            currentIndex = i;
        });
        dotsContainer.appendChild(dot);
    }

    // Ersten Slide anzeigen
    slides.forEach(s => s.style.display = 'none');
    if (slides[0]) slides[0].style.display = 'block';
}

loadMonateCarousel();
