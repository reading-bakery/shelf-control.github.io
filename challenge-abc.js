// challenge-abc.js
document.addEventListener("DOMContentLoaded", () => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=476127889&single=true&output=csv";
    const container = document.querySelector(".abc-challenge");

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data.filter(row => row.Buchstabe);
            renderABC(data);
        }
    });

    function renderABC(data) {
        const maxPerRow = 4;
        const maxRows = 3;
        const maxItems = maxPerRow * maxRows;

        if (data.length <= maxItems) {
            const grid = document.createElement("div");
            grid.classList.add("abc-grid");
            data.forEach(item => {
                const card = createCard(item);
                grid.appendChild(card);
            });
            container.appendChild(grid);
        } else {
            createCarousel(data, maxPerRow, maxRows);
        }
    }

    function createCard(item) {
        const div = document.createElement("div");
        div.classList.add("abc-card");

        let content;
        if (item.Cover) {
            content = `<img src="${item.Cover}" alt="${item.Buch || ''}">`;
        } else {
            content = `<div class="abc-placeholder"></div>`;
        }

        // Buchstaben in einzelne <span> aufsplitten
        const letterContainer = document.createElement("div");
        letterContainer.classList.add("abc-letter-container");
        [...item.Buchstabe].forEach(letter => {
            const span = document.createElement("span");
            span.classList.add("abc-letter");
            span.textContent = letter;
            letterContainer.appendChild(span);
        });

        div.innerHTML = content;
        div.appendChild(letterContainer);

        return div;
    }

    function createCarousel(data, maxPerRow, maxRows) {
        const itemsPerSlide = maxPerRow * maxRows;
        const totalSlides = Math.ceil(data.length / itemsPerSlide);

        const carousel = document.createElement("div");
        carousel.classList.add("abc-carousel");

        // Carousel Navigation direkt unter Überschrift
        const nav = document.createElement("div");
        nav.classList.add("abc-carousel-nav");
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("span");
            dot.classList.add("abc-dot");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => goToSlide(i));
            nav.appendChild(dot);
        }
        container.appendChild(nav); // Dots vor Track hinzufügen

        const track = document.createElement("div");
        track.classList.add("abc-carousel-track");

        for (let i = 0; i < totalSlides; i++) {
            const slide = document.createElement("div");
            slide.classList.add("abc-carousel-slide");

            const start = i * itemsPerSlide;
            const end = start + itemsPerSlide;
            const slice = data.slice(start, end);

            const grid = document.createElement("div");
            grid.classList.add("abc-grid");

            slice.forEach(item => {
                const card = createCard(item);
                grid.appendChild(card);
            });

            slide.appendChild(grid);
            track.appendChild(slide);
        }

        carousel.appendChild(track);
        container.appendChild(carousel);

        let currentSlide = 0;
        let startX = 0;
        let isDragging = false;

        function goToSlide(index) {
            currentSlide = index;
            const offset = -100 * index;
            track.style.transform = `translateX(${offset}%)`;
            nav.querySelectorAll(".abc-dot").forEach((d, i) => d.classList.toggle("active", i === index));
        }

        // Touch-Events für Swipe
        track.addEventListener("touchstart", e => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        track.addEventListener("touchmove", e => {
            if (!isDragging) return;
            const moveX = e.touches[0].clientX;
            const diff = moveX - startX;
            track.style.transform = `translateX(${-100 * currentSlide + (diff / carousel.offsetWidth) * 100}%)`;
        });

        track.addEventListener("touchend", e => {
            if (!isDragging) return;
            isDragging = false;
            const endX = e.changedTouches[0].clientX;
            const diff = endX - startX;

            if (diff < -50 && currentSlide < totalSlides - 1) {
                goToSlide(currentSlide + 1);
            } else if (diff > 50 && currentSlide > 0) {
                goToSlide(currentSlide - 1);
            } else {
                goToSlide(currentSlide); // zurück zur aktuellen Slide
            }
        });
    }
});
