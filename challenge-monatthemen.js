async function loadMonateCarousel() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=4625754&single=true&output=csv';
    const res = await fetch(url);
    const text = await res.text();
    const rows = text.split('\n').map(r => r.split(','));
    const container = document.querySelector('.monatschallenge');

    if (rows.length < 2) return;

    const dataRows = rows.slice(1);
    const numSlides = Math.ceil(dataRows.length / 3);

    const dotsContainer = document.createElement('div');
    dotsContainer.classList.add('carousel-dots');
    container.insertBefore(dotsContainer, container.firstChild);

    let currentSlideEl;
    dataRows.forEach((row, index) => {
        if (index % 3 === 0) {
            currentSlideEl = document.createElement('div');
            currentSlideEl.classList.add('carousel-slide-2');
            container.appendChild(currentSlideEl);
        }

        const monthName = row[0] || `Monat ${index + 1}`;
        const thema = row[1] || 'Noch kein Thema';

        const monthDiv = document.createElement('div');
        monthDiv.classList.add('month-block-2');
        monthDiv.innerHTML = `
            <h4>${monthName}: ${thema}</h4>
            <div class="books-wrapper-2"></div>
        `;
        currentSlideEl.appendChild(monthDiv);

        const booksWrapper = monthDiv.querySelector('.books-wrapper-2');
        const coverIndexes = [3, 6, 9];
        const statusIndexes = [4, 7, 10];

        coverIndexes.forEach((coverIndex, i) => {
            const coverUrl = row[coverIndex];
            const bookDiv = document.createElement('div');

            if (coverUrl && coverUrl.trim() !== '') {
                const statusRaw = (row[statusIndexes[i]] || 'NO').trim().toUpperCase();
                const statusColors = { 'YES': '#3CB371', 'ABBR': '#9370DB', 'NO': 'gray' };
                const color = statusColors[statusRaw] || 'gray';

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
            } else {
                bookDiv.classList.add('placeholder-book');
                bookDiv.innerHTML = `<span>?</span>`;
            }

            booksWrapper.appendChild(bookDiv);
        });
    });

    const slides = container.querySelectorAll('.carousel-slide-2');
    slides.forEach((s, i) => s.style.display = i === 0 ? 'block' : 'none');

    const dots = [];
    for (let i = 0; i < numSlides; i++) {
        const dot = document.createElement('button');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showSlide(i));
        dotsContainer.appendChild(dot);
        dots.push(dot);
    }

    let currentIndex = 0;

    function showSlide(index) {
        if (index < 0) {
            index = numSlides - 1;
        } else if (index >= numSlides) {
            index = 0;
        }
        slides.forEach(s => s.style.display = 'none');
        slides[index].style.display = 'block';
        dots.forEach(d => d.classList.remove('active'));
        dots[index].classList.add('active');
        currentIndex = index;
    }

    // --- Integrierte Swipe- und Maus-Funktionalität ---
    let startX = 0;
    let isDragging = false;
    
    // Touch-Events für mobile Geräte
    container.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    container.addEventListener("touchend", e => {
        if (!isDragging) return;
        isDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        if (diff < -50 && currentIndex < numSlides - 1) {
            showSlide(currentIndex + 1);
        } else if (diff > 50 && currentIndex > 0) {
            showSlide(currentIndex - 1);
        }
    });
}

loadMonateCarousel();