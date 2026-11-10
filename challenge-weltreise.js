document.addEventListener("DOMContentLoaded", () => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1664133022&single=true&output=csv";
    
    // Google Forms URL und Entry-ID für das Land
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScyxXjbJx5AQ0vXzo2hzl_RFzG1Etv8SF90Sh7wuYRSEHmlTA/formResponse";
    const ENTRY_LAND = "entry.386951989";

    const container = document.querySelector(".weltreise-challenge");

    // Modal Elemente
    const modal = document.getElementById("weltreise-modal");
    const openModalBtn = document.getElementById("open-weltreise-modal");
    const closeModalBtn = document.getElementById("close-weltreise-modal");
    const cancelModalBtn = document.getElementById("cancel-weltreise-modal");
    const saveModalBtn = document.getElementById("save-weltreise-modal");
    const countryInput = document.getElementById("weltreise-country-input");
    const modalMessage = document.getElementById("weltreise-modal-message");

    // Liste bereits vorhandener Länder aus der Tabelle für den Abgleich
    let existingCountries = [];

    // Flaggen für verschiedene Länder
    const flagMap = {
        "Afghanistan": "<img src='flags/af.svg' class='weltreise-flagge-img' alt='Afghanistan'>",
        "Albanien": "<img src='flags/al.svg' class='weltreise-flagge-img' alt='Albanien'>",
        "Ägypten": "<img src='flags/eg.svg' class='weltreise-flagge-img' alt='Ägypten'>",
        "Argentinien": "<img src='flags/ar.svg' class='weltreise-flagge-img' alt='Argentinien'>",
        "Armenien": "<img src='flags/am.svg' class='weltreise-flagge-img' alt='Armenien'>",
        "Australien": "<img src='flags/au.svg' class='weltreise-flagge-img' alt='Australien'>",
        "Belarus": "<img src='flags/by.svg' class='weltreise-flagge-img' alt='Belarus'>",
        "Belgien": "<img src='flags/be.svg' class='weltreise-flagge-img' alt='Belgien'>",
        "Brasilien": "<img src='flags/br.svg' class='weltreise-flagge-img' alt='Brasilien'>",
        "Bulgarien": "<img src='flags/bg.svg' class='weltreise-flagge-img' alt='Bulgarien'>",
        "Chile": "<img src='flags/cl.svg' class='weltreise-flagge-img' alt='Chile'>",
        "China": "<img src='flags/cn.svg' class='weltreise-flagge-img' alt='China'>",
        "Dänemark": "<img src='flags/dk.svg' class='weltreise-flagge-img' alt='Dänemark'>",
        "Deutschland": "<img src='flags/de.svg' class='weltreise-flagge-img' alt='Deutschland'>",
        "El Salvador": "<img src='flags/sv.svg' class='weltreise-flagge-img' alt='El Salvador'>",
        "England": "<img src='flags/gb-eng.svg' class='weltreise-flagge-img' alt='England'>",
        "Estland": "<img src='flags/ee.svg' class='weltreise-flagge-img' alt='Estland'>",
        "Finnland": "<img src='flags/fi.svg' class='weltreise-flagge-img' alt='Finnland'>",
        "Frankreich": "<img src='flags/fr.svg' class='weltreise-flagge-img' alt='Frankreich'>",
        "Georgien": "<img src='flags/ge.svg' class='weltreise-flagge-img' alt='Georgien'>",
        "Ghana": "<img src='flags/gh.svg' class='weltreise-flagge-img' alt='Ghana'>",
        "Griechenland": "<img src='flags/gr.svg' class='weltreise-flagge-img' alt='Griechenland'>",
        "Guatemala": "<img src='flags/gt.svg' class='weltreise-flagge-img' alt='Guatemala'>",
        "Indien": "<img src='flags/in.svg' class='weltreise-flagge-img' alt='Indien'>",
        "Indonesien": "<img src='flags/id.svg' class='weltreise-flagge-img' alt='Indonesien'>",
        "Irak": "<img src='flags/iq.svg' class='weltreise-flagge-img' alt='Irak'>",
        "Iran": "<img src='flags/ir.svg' class='weltreise-flagge-img' alt='Iran'>",
        "Irland": "<img src='flags/ie.svg' class='weltreise-flagge-img' alt='Irland'>",
        "Island": "<img src='flags/is.svg' class='weltreise-flagge-img' alt='Island'>",
        "Israel": "<img src='flags/il.svg' class='weltreise-flagge-img' alt='Israel'>",
        "Italien": "<img src='flags/it.svg' class='weltreise-flagge-img' alt='Italien'>",
        "Japan": "<img src='flags/jp.svg' class='weltreise-flagge-img' alt='Japan'>",
        "Kanada": "<img src='flags/ca.svg' class='weltreise-flagge-img' alt='Kanada'>",
        "Kenia": "<img src='flags/ke.svg' class='weltreise-flagge-img' alt='Kenia'>",
        "Kolumbien": "<img src='flags/co.svg' class='weltreise-flagge-img' alt='Kolumbien'>",
        "Kroatien": "<img src='flags/hr.svg' class='weltreise-flagge-img' alt='Kroatien'>",
        "Kuba": "<img src='flags/cu.svg' class='weltreise-flagge-img' alt='Kuba'>",
        "Libanon": "<img src='flags/lb.svg' class='weltreise-flagge-img' alt='Libanon'>",
        "Litauen": "<img src='flags/lt.svg' class='weltreise-flagge-img' alt='Litauen'>",
        "Lettland": "<img src='flags/lv.svg' class='weltreise-flagge-img' alt='Lettland'>",
        "Malaysia": "<img src='flags/my.svg' class='weltreise-flagge-img' alt='Malaysia'>",
        "Marokko": "<img src='flags/ma.svg' class='weltreise-flagge-img' alt='Marokko'>",
        "Mexiko": "<img src='flags/mx.svg' class='weltreise-flagge-img' alt='Mexiko'>",
        "Namibia": "<img src='flags/na.svg' class='weltreise-flagge-img' alt='Namibia'>",
        "Neuseeland": "<img src='flags/nz.svg' class='weltreise-flagge-img' alt='Neuseeland'>",
        "Niederlande": "<img src='flags/nl.svg' class='weltreise-flagge-img' alt='Niederlande'>",
        "Nordirland": "<img src='flags/gb-nir.svg' class='weltreise-flagge-img' alt='Nordirland'>",
        "Norwegen": "<img src='flags/no.svg' class='weltreise-flagge-img' alt='Norwegen'>",
        "Österreich": "<img src='flags/at.svg' class='weltreise-flagge-img' alt='Österreich'>",
        "Pakistan": "<img src='flags/pk.svg' class='weltreise-flagge-img' alt='Pakistan'>",
        "Peru": "<img src='flags/pe.svg' class='weltreise-flagge-img' alt='Peru'>",
        "Polen": "<img src='flags/pl.svg' class='weltreise-flagge-img' alt='Polen'>",
        "Portugal": "<img src='flags/pt.svg' class='weltreise-flagge-img' alt='Portugal'>",
        "Puerto Rico": "<img src='flags/pr.svg' class='weltreise-flagge-img' alt='Puerto Rico'>",
        "Rumänien": "<img src='flags/ro.svg' class='weltreise-flagge-img' alt='Rumänien'>",
        "Russland": "<img src='flags/ru.svg' class='weltreise-flagge-img' alt='Russland'>",
        "Schottland": "<img src='flags/gb-sct.svg' class='weltreise-flagge-img' alt='Schottland'>",
        "Schweiz": "<img src='flags/ch.svg' class='weltreise-flagge-img' alt='Schweiz'>",
        "Schweden": "<img src='flags/se.svg' class='weltreise-flagge-img' alt='Schweden'>",
        "Serbien": "<img src='flags/rs.svg' class='weltreise-flagge-img' alt='Serbien'>",
        "Spanien": "<img src='flags/es.svg' class='weltreise-flagge-img' alt='Spanien'>",
        "Südafrika": "<img src='flags/za.svg' class='weltreise-flagge-img' alt='Südafrika'>",
        "Südkorea": "<img src='flags/kr.svg' class='weltreise-flagge-img' alt='Südkorea'>",
        "Tansania": "<img src='flags/tz.svg' class='weltreise-flagge-img' alt='Tansania'>",
        "Tschechien": "<img src='flags/cz.svg' class='weltreise-flagge-img' alt='Tschechien'>",
        "Thailand": "<img src='flags/th.svg' class='weltreise-flagge-img' alt='Thailand'>",
        "Türkei": "<img src='flags/tr.svg' class='weltreise-flagge-img' alt='Türkei'>",
        "Ukraine": "<img src='flags/ua.svg' class='weltreise-flagge-img' alt='Ukraine'>",
        "Ungarn": "<img src='flags/hu.svg' class='weltreise-flagge-img' alt='Ungarn'>",
        "USA": "<img src='flags/us.svg' class='weltreise-flagge-img' alt='USA'>",
        "Venezuela": "<img src='flags/ve.svg' class='weltreise-flagge-img' alt='Venezuela'>",
        "Vietnam": "<img src='flags/vn.svg' class='weltreise-flagge-img' alt='Vietnam'>",
        "Wales": "<img src='flags/gb-wls.svg' class='weltreise-flagge-img' alt='Wales'>",
        "Zypern": "<img src='flags/cy.svg' class='weltreise-flagge-img' alt='Zypern'>"
    };

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            let data = results.data
                .map(row => {
                    const countryName = row['Land'] || row['Land (Setting)'] || Object.values(row)[1];
                    return { country: countryName ? countryName.trim() : "" };
                })
                .filter(item => item.country);
            
            data.sort((a, b) => a.country.localeCompare(b.country, 'de', { sensitivity: 'base' }));
            existingCountries = data.map(item => item.country);

            renderWeltreise(data);
        }
    });

    // --- MODAL LOGIK ---
    const openModal = () => {
        if (!modal) return;
        countryInput.value = "";
        modalMessage.textContent = "";
        modalMessage.className = "modal-message";
        saveModalBtn.disabled = false;
        saveModalBtn.textContent = "Hinzufügen";
        modal.classList.add("active");
        countryInput.focus();
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove("active");
    };

    if (openModalBtn) openModalBtn.addEventListener("click", openModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

    window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    if (saveModalBtn) {
        saveModalBtn.addEventListener("click", async () => {
            const newCountry = countryInput.value.trim();

            if (!newCountry) {
                modalMessage.textContent = "Bitte gib einen Ländernamen ein!";
                modalMessage.className = "modal-message error";
                return;
            }

            const exists = existingCountries.some(
                c => c.toLowerCase() === newCountry.toLowerCase()
            );

            if (exists) {
                modalMessage.textContent = `Das Land "${newCountry}" ist bereits in der Liste vorhanden!`;
                modalMessage.className = "modal-message error";
                return;
            }

            saveModalBtn.disabled = true;
            saveModalBtn.textContent = "Wird gesendet...";
            modalMessage.textContent = "";

            const formData = new FormData();
            formData.append(ENTRY_LAND, newCountry);

            try {
                await fetch(FORM_URL, {
                    method: "POST",
                    mode: "no-cors",
                    body: formData
                });

                modalMessage.textContent = `"${newCountry}" wurde erfolgreich hinzugefügt! 🎉`;
                modalMessage.className = "modal-message success";

                setTimeout(() => {
                    location.reload();
                }, 1200);

            } catch (err) {
                console.error("Fehler beim Hinzufügen des Landes:", err);
                modalMessage.textContent = "Fehler beim Hinzufügen. Bitte erneut versuchen.";
                modalMessage.className = "modal-message error";
                saveModalBtn.disabled = false;
                saveModalBtn.textContent = "Hinzufügen";
            }
        });
    }

    function renderWeltreise(data) {
        if (!container) return;
        container.innerHTML = "";

        const maxPerRow = 4;
        // Dynamische Reihen-Anzahl je nach Bildschirmbreite (Mobile < 740px = 3 Reihen, sonst 4 Reihen)
        const maxRows = window.innerWidth <= 740 ? 3 : 4;
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

        const country = item.country;
        let flagHtml = flagMap[country] || `<div class="weltreise-placeholder">${country}</div>`;

        div.innerHTML = `
            <div class="weltreise-flagge">${flagHtml}</div>
            <div class="weltreise-country-name">${country}</div>
        `;

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
            slice.forEach(item => grid.gridappendChild ? grid.appendChild(createCard(item)) : grid.appendChild(createCard(item)));

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