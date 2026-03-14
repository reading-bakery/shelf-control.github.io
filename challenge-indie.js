// challenge-indie.js
document.addEventListener("DOMContentLoaded", () => {
    const csvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=855937535&single=true&output=csv";

    const container = document.querySelector(".indie-challenge");

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete(results) {
            const data = results.data.filter(row => row.Nummer);
            renderIndie(data);
        }
    });

    function renderIndie(data) {
        const maxPerRow = 4;
        const maxRows = 3;
        const maxItems = maxPerRow * maxRows;

        if (data.length <= maxItems) {
            const grid = document.createElement("div");
            grid.classList.add("indie-grid");

            data.forEach(item => {
                grid.appendChild(createCard(item));
            });

            container.appendChild(grid);
        } else {
            createCarousel(data, maxPerRow, maxRows);
        }
    }

    function createCard(item) {
        const card = document.createElement("div");
        card.classList.add("indie-card");

        const inner = document.createElement("div");
        inner.classList.add("indie-card-inner");

        const front = document.createElement("div");
        front.classList.add("indie-card-front");

        const back = document.createElement("div");
        back.classList.add("indie-card-back");

        // Prüfen, ob ein Cover-Link existiert und nicht leer ist
        const hasCover = Boolean(item.Cover && item.Cover.trim() !== "");

        /* ---------- Vorder- / Rückseite ---------- */
        if (hasCover) {
            front.innerHTML = `<img src="${item.Cover}" alt="${item.Buch || ""}">`;
        } else {
            front.innerHTML = `<div class="indie-placeholder"></div>`;
        }

        back.innerHTML = `
            <div class="indie-verlag">
                <br>${item.Verlag || "–"}
            </div>
        `;

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);

        /* ---------- Nummer (NUR WENN COVER EXISTIERT) ---------- */
        if (hasCover) {
            const letterContainer = document.createElement("div");
            letterContainer.classList.add("indie-letter-container");

            const numText = String(item.Nummer || "");
            [...numText].forEach(letter => {
                const span = document.createElement("span");
                span.classList.add("indie-letter");
                span.textContent = letter;
                letterContainer.appendChild(span);
            });

            card.appendChild(letterContainer);

            /* ---------- Flip-Event (NUR WENN COVER EXISTIERT) ---------- */
            card.addEventListener("click", () => {
                card.classList.toggle("is-flipped");
            });
        }

        return card;
    }

    function createCarousel(data, maxPerRow, maxRows) {
        const itemsPerSlide = maxPerRow * maxRows;
        const totalSlides = Math.ceil(data.length / itemsPerSlide);

        const carousel = document.createElement("div");
        carousel.classList.add("indie-carousel");

        /* ---------- Navigation ---------- */
        const nav = document.createElement("div");
        nav.classList.add("indie-carousel-nav");

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("span");
            dot.classList.add("indie-dot");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => goToSlide(i));
            nav.appendChild(dot);
        }

        container.appendChild(nav);

        /* ---------- Track ---------- */
        const track = document.createElement("div");
        track.classList.add("indie-carousel-track");

        for (let i = 0; i < totalSlides; i++) {
            const slide = document.createElement("div");
            slide.classList.add("indie-carousel-slide");

            const grid = document.createElement("div");
            grid.classList.add("indie-grid");

            data
                .slice(i * itemsPerSlide, (i + 1) * itemsPerSlide)
                .forEach(item => grid.appendChild(createCard(item)));

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
            track.style.transform = `translateX(${-100 * index}%)`;

            nav.querySelectorAll(".indie-dot")
                .forEach((d, i) => d.classList.toggle("active", i === index));
        }

        /* ---------- Touch-Swipe ---------- */
        track.addEventListener("touchstart", e => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        track.addEventListener("touchmove", e => {
            if (!isDragging) return;
            const diff = e.touches[0].clientX - startX;
            track.style.transform =
                `translateX(${-100 * currentSlide + (diff / carousel.offsetWidth) * 100}%)`;
        });

        track.addEventListener("touchend", e => {
            if (!isDragging) return;
            isDragging = false;
            const diff = e.changedTouches[0].clientX - startX;

            if (diff < -50 && currentSlide < totalSlides - 1) {
                goToSlide(currentSlide + 1);
            } else if (diff > 50 && currentSlide > 0) {
                goToSlide(currentSlide - 1);
            } else {
                goToSlide(currentSlide);
            }
        });
    }
});