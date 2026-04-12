document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("subContainer");
    const zufallBtn = document.getElementById("luckyZufall");

    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";
    
    // Deinen TSV-Link hier einfügen
    const SHEET_TSV_URL = "DEIN_GOOGLE_SHEET_TSV_LINK_HIER";

    const FORM_ENTRIES = {
        start: "entry.231863637", title: "entry.554995646", author: "entry.890797774", 
        gender: "entry.1685694101", umfang: "entry.436245051", seiten: "entry.1082451600",
        minuten: "entry.1433991187", genre: "entry.1105252862", sprache: "entry.807495643",
        format: "entry.9727566", status: "entry.914730295", verlag: "entry.1674035100", 
        cover: "entry.952453014"
    };

    let alleBuecher = [];
    let bereitsGeleseneCover = "";

    // 1. Google Sheets Abgleich laden
    try {
        const sheetResponse = await fetch(SHEET_TSV_URL);
        if (sheetResponse.ok) bereitsGeleseneCover = await sheetResponse.text();
    } catch (e) { console.warn("Abgleich nicht möglich."); }

    // 2. JSON laden und filtern
    try {
        const response = await fetch(jsonURL);
        const daten = await response.json();
        alleBuecher = daten.books.filter(b => b.cover && !bereitsGeleseneCover.includes(b.cover));
    } catch (e) { console.error("Fehler beim Laden:", e); }

    // 3. Funktion: Buch senden (identisch zu sub.js)
    const addToGoogleSheets = async (buch, element) => {
        const confirmMsg = `Möchtest du "${buch.title}" in die Google Sheets aufnehmen?`;
        if (!confirm(confirmMsg)) return;

        const githubLink = `https://github.com/reading-bakery/shelf-control.github.io/blob/main/images/sub/${buch.cover}?raw=true`;
        const formData = new FormData();
        const today = new Date().toISOString().split('T')[0];

        formData.append(FORM_ENTRIES.start, today);
        formData.append(FORM_ENTRIES.title, buch.title || "");
        formData.append(FORM_ENTRIES.author, buch.author || "");
        formData.append(FORM_ENTRIES.gender, buch.gender || "");
        formData.append(FORM_ENTRIES.umfang, buch.umfang || "");
        formData.append(FORM_ENTRIES.seiten, buch.seiten || "");
        formData.append(FORM_ENTRIES.minuten, ""); 
        formData.append(FORM_ENTRIES.genre, buch.genre || "");
        formData.append(FORM_ENTRIES.sprache, buch.sprache || "");
        formData.append(FORM_ENTRIES.format, buch.format || "");
        formData.append(FORM_ENTRIES.status, "Gelesen"); 
        formData.append(FORM_ENTRIES.verlag, buch.verlag || "");
        formData.append(FORM_ENTRIES.cover, githubLink);

        try {
            fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData });
            
            // UI Feedback: Element ausblenden
            element.style.transition = "opacity 0.5s ease";
            element.style.opacity = "0";
            setTimeout(() => {
                element.innerHTML = "<p style='color:white;'>Buch wurde hinzugefügt! 🚀</p>";
                element.style.opacity = "1";
            }, 500);

            alert(`"${buch.title}" wurde übertragen!`);
        } catch (error) { console.error(error); }
    };

    // 4. Zufalls-Event
    zufallBtn.addEventListener("click", () => {
        container.innerHTML = "";

        if (alleBuecher.length === 0) {
            container.innerHTML = "<p style='color:white;'>Keine Bücher im SuB gefunden.</p>";
            return;
        }

        const buch = alleBuecher[Math.floor(Math.random() * alleBuecher.length)];

        // Wir bauen die gleiche Struktur wie in der sub.js (Wrapper + Overlay)
        const wrapper = document.createElement("div");
        wrapper.classList.add("buch-wrapper", "zufall-single"); // Klasse für spezielles Zufall-Styling

        const img = document.createElement("img");
        img.src = baseURL + buch.cover;
        img.alt = buch.title;
        img.classList.add("sub-bild", "sub-bild-large");

        const overlay = document.createElement("div");
        overlay.classList.add("plus-overlay");
        overlay.textContent = "+";
        
        // Klick auf das + führt die Funktion aus
        overlay.addEventListener("click", () => addToGoogleSheets(buch, wrapper));

        wrapper.appendChild(img);
        wrapper.appendChild(overlay);
        container.appendChild(wrapper);
    });
});