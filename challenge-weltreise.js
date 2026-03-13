document.addEventListener("DOMContentLoaded", () => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=2117169712&single=true&output=csv";
    const container = document.querySelector(".weltreise-challenge");

    // Länder-Emoji / SVG Mapping
    const flagMap = {
        "Russland": "🇷🇺", "Chile": "🇨🇱", "England": "🏴", "USA": "🇺🇸", "Griechenland": "🇬🇷",
        "Zypern": "🇨🇾", "Deutschland": "🇩🇪", "Brasilien": "🇧🇷", "El Salvador": "🇸🇻", "Italien": "🇮🇹",
        "Frankreich": "🇫🇷", "Spanien": "🇪🇸", "Portugal": "🇵🇹", "Niederlande": "🇳🇱", "Österreich": "🇦🇹",
        "Schweiz": "🇨🇭", "Ukraine": "🇺🇦", "Australien": "🇦🇺", "Kanada": "🇨🇦", "Mexiko": "🇲🇽",
        "Argentinien": "🇦🇷", "Kolumbien": "🇨🇴", "Israel": "🇮🇱", "Japan": "🇯🇵", "China": "🇨🇳",
        "Südkorea": "🇰🇷", "Vietnam": "🇻🇳", "Thailand": "🇹🇭", "Malaysia": "🇲🇾", "Serbien": "🇷🇸",
        "Kroatien": "🇭🇷", "Irland": "🇮🇪", "Island": "🇮🇸",
        "Schottland": "<img src='flags/scotland.svg' alt='Schottland' class='weltreise-flagge-img'>",
        "Wales": "<img src='flags/wales.svg' alt='Wales' class='weltreise-flagge-img'>",
        "Nordirland": "<img src='flags/northern_ireland.svg' alt='Nordirland' class='weltreise-flagge-img'>",
        "Polen": "🇵🇱", "Dänemark": "🇩🇰", "Schweden": "🇸🇪", "Norwegen": "🇳🇴", "Finnland": "🇫🇮",
        "Türkei": "🇹🇷", "Indien": "🇮🇳", "Neuseeland": "🇳🇿", "Ägypten": "🇪🇬"
    };

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data.filter(row => row.Nummer);
            renderWeltreise(data);
        }
    });

    function renderWeltreise(data) {
        const maxPerRow = 4;
        const maxRows = 3;
        const maxItems = maxPerRow * maxRows;

        if (data.length <= maxItems) {
            const grid = document.createElement("div");
            grid.classList.add("weltreise-grid");
            data.forEach(item => grid.appendChild(createCard(item)));
            container.appendChild(grid);
        } else {
            createCarousel(data, maxPerRow, maxRows);
        }
    }

    function createCard(item) {
        const div = document.createElement("div");
        div.classList.add("weltreise-card");

        const country = item['Land (Setting)']?.trim();
        let flagHtml = "";
        if (country && flagMap[country]) flagHtml = `<div class="weltreise-flagge">${flagMap[country]}</div>`;

        let content = item.Cover ? `<img src="${item.Cover}" alt="${item.Buch || ''}">` : `<div class="weltreise-placeholder"></div>`;

        const letterContainer = document.createElement("div");
        letterContainer.classList.add("weltreise-letter-container");
        if (item.Nummer) [...item.Nummer].forEach(l => {
            const span = document.createElement("span");
            span.classList.add("weltreise-letter");
            span.textContent = l;
            letterContainer.appendChild(span);
        });

        div.innerHTML = `${flagHtml}${content}`;
        div.appendChild(letterContainer);
        return div;
    }

    function createCarousel(data, maxPerRow, maxRows) {
        const itemsPerSlide = maxPerRow * maxRows;
        const totalSlides = Math.ceil(data.length / itemsPerSlide);

        const carousel = document.createElement("div");
        carousel.classList.add("weltreise-carousel");

        const nav = document.createElement("div");
        nav.classList.add("weltreise-carousel-nav");
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("span");
            dot.classList.add("weltreise-dot");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => goToSlide(i));
            nav.appendChild(dot);
        }
        container.appendChild(nav);

        const track = document.createElement("div");
        track.classList.add("weltreise-carousel-track");

        for (let i = 0; i < totalSlides; i++) {
            const slide = document.createElement("div");
            slide.classList.add("weltreise-carousel-slide");
            const slice = data.slice(i * itemsPerSlide, i * itemsPerSlide + itemsPerSlide);

            const grid = document.createElement("div");
            grid.classList.add("weltreise-grid");
            slice.forEach(item => grid.appendChild(createCard(item)));

            slide.appendChild(grid);
            track.appendChild(slide);
        }

        carousel.appendChild(track);
        container.appendChild(carousel);

        let currentSlide = 0, startX = 0, isDragging = false;

        function goToSlide(index) {
            currentSlide = index;
            track.style.transform = `translateX(${-100 * index}%)`;
            nav.querySelectorAll(".weltreise-dot").forEach((d,i)=>d.classList.toggle("active",i===index));
        }

        track.addEventListener("touchstart", e => { startX = e.touches[0].clientX; isDragging = true; });
        track.addEventListener("touchmove", e => {
            if (!isDragging) return;
            const diff = e.touches[0].clientX - startX;
            track.style.transform = `translateX(${-100 * currentSlide + (diff / carousel.offsetWidth) * 100}%)`;
        });
        track.addEventListener("touchend", e => {
            if (!isDragging) return;
            isDragging = false;
            const diff = e.changedTouches[0].clientX - startX;
            if (diff < -50 && currentSlide < totalSlides-1) goToSlide(currentSlide+1);
            else if (diff > 50 && currentSlide>0) goToSlide(currentSlide-1);
            else goToSlide(currentSlide);
        });
    }
});
