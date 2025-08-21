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

    let currentSlide;
    dataRows.forEach((row, index) => {
        if (index % 3 === 0) {
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
        // Ensure index is within bounds
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }

        slides.forEach(s => s.style.display = 'none');
        slides[index].style.display = 'block';
        dots.forEach(d => d.classList.remove('active'));
        dots[index].classList.add('active');
        currentIndex = index;
    }

    // --- Optimized Touch-Events for Swipe ---
    let startX = 0;
    let isDragging = false;
    
    // Attach event listeners to the main container
    container.addEventListener("touchstart", e => {
        isDragging = true;
        startX = e.touches[0].clientX;
        // Optionally, add a class for CSS transitions to be disabled during drag
        container.style.transition = 'none';
    });

    container.addEventListener("touchmove", e => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        
        // This is a simple visual drag effect.
        // It's not strictly necessary for functionality but improves UX.
        const currentOffset = -currentIndex * container.offsetWidth;
        container.style.transform = `translateX(${currentOffset + diff}px)`;
    });

    container.addEventListener("touchend", e => {
        if (!isDragging) return;
        isDragging = false;
        
        // Re-enable CSS transitions
        container.style.transition = 'transform 0.3s ease-in-out';
        container.style.transform = 'none'; // Reset the live transform

        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        // Determine if a swipe occurred based on a threshold
        const swipeThreshold = 50; // pixels
        if (diff < -swipeThreshold) {
            showSlide(currentIndex + 1);
        } else if (diff > swipeThreshold) {
            showSlide(currentIndex - 1);
        } else {
            // No significant swipe, stay on the current slide
            showSlide(currentIndex);
        }
    });

    // Add mouse events for testing on desktop
    container.addEventListener("mousedown", e => {
        isDragging = true;
        startX = e.clientX;
        container.style.transition = 'none';
    });
    
    container.addEventListener("mousemove", e => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent text selection
        const currentX = e.clientX;
        const diff = currentX - startX;
        const currentOffset = -currentIndex * container.offsetWidth;
        container.style.transform = `translateX(${currentOffset + diff}px)`;
    });

    container.addEventListener("mouseup", e => {
        if (!isDragging) return;
        isDragging = false;
        container.style.transition = 'transform 0.3s ease-in-out';
        container.style.transform = 'none';

        const endX = e.clientX;
        const diff = endX - startX;
        const swipeThreshold = 50;
        if (diff < -swipeThreshold) {
            showSlide(currentIndex + 1);
        } else if (diff > swipeThreshold) {
            showSlide(currentIndex - 1);
        } else {
            showSlide(currentIndex);
        }
    });

    container.addEventListener("mouseleave", () => {
        if (isDragging) {
            isDragging = false;
            container.style.transition = 'transform 0.3s ease-in-out';
            container.style.transform = 'none';
            showSlide(currentIndex);
        }
    });
}

loadMonateCarousel();