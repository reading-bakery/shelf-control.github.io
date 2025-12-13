// challenge-abc.js
document.addEventListener("DOMContentLoaded", () => {
    const csvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=844699592&single=true&output=csv";

    const container = document.querySelector(".originalsprache-challenge");

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete(results) {
            const data = results.data.filter(row => row.Nummer);
            renderOriginalsprache(data);
        }
    });

    function renderOriginalsprache(data) {
        const maxPerRow = 4;
        const maxRows = 3;
        const maxItems = maxPerRow * maxRows;

        if (data.length <= maxItems) {
            const grid = document.createElement("div");
            grid.classList.add("originalsprache-grid");

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
        card.classList.add("originalsprache-card");

        const inner = document.createElement("div");
        inner.classList.add("originalsprache-card-inner");

        const front = document.createElement("div");
        front.classList.add("originalsprache-card-front");

        const back = document.createElement("div");
        back.classList.add("originalsprache-card-back");

        const hasCover = Boolean(item.Cover);

        /* ---------- Vorder- / Rückseite ---------- */
        if (hasCover) {
            front.innerHTML = `<img src="${item.Cover}" alt="${item.Buch || ""}">`;
        } else {
            front.innerHTML = `<div class="originalsprache-placeholder"></div>`;
        }

        back.innerHTML = `
            <div class="originalsprache-language">
                ${item.Originalsprache || "–"}
            </div>
        `;

        /* ---------- Nummer ---------- */
        const letterContainer = document.createElement("div");
        letterContainer.classList.add("originalsprache-letter-container");

        [...item.Nummer].forEach(letter => {
            const span = document.createElement("span");
            span.classList.add("originalsprache-letter");
            span.textContent = letter;
            letterContainer.appendChild(span);
        });

        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);
        card.appendChild(letterContainer);

        /* ---------- Flip (nur wenn Cover existiert) ---------- */
        if (hasCover) {
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
        carousel.classList.add("originalsprache-carousel");

        /* ---------- Navigation ---------- */
        const nav = document.createElement("div");
        nav.classList.add("originalsprache-carousel-nav");

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("span");
            dot.classList.add("originalsprache-dot");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => goToSlide(i));
            nav.appendChild(dot);
        }

        container.appendChild(nav);

        /* ---------- Track ---------- */
        const track = document.createElement("div");
        track.classList.add("originalsprache-carousel-track");

        for (let i = 0; i < totalSlides; i++) {
            const slide = document.createElement("div");
            slide.classList.add("originalsprache-carousel-slide");

            const grid = document.createElement("div");
            grid.classList.add("originalsprache-grid");

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

            nav.querySelectorAll(".originalsprache-dot")
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
