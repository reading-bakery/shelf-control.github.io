document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".sub");
    const searchInput = document.getElementById("sub-search");

    // --- KONFIGURATION ---
    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";
    
    // HIER den Link aus "Im Web veröffentlichen" (TSV Format) einfügen:
    const SHEET_TSV_URL = "DEIN_GOOGLE_SHEET_TSV_LINK_HIER";

    const FORM_ENTRIES = {
        start: "entry.231863637", 
        title: "entry.554995646", 
        author: "entry.890797774", 
        gender: "entry.1685694101", 
        umfang: "entry.436245051", 
        seiten: "entry.1082451600",
        minuten: "entry.1433991187", 
        genre: "entry.1105252862", 
        sprache: "entry.807495643",
        format: "entry.9727566", 
        status: "entry.914730295", 
        verlag: "entry.1674035100", 
        cover: "entry.952453014"
    };

    let alleBuecher = [];
    let bereitsGeleseneCover = "";

    // 1. Abgleich: Vorhandene Einträge aus Google Sheets laden
    const ladeGeleseneStatus = async () => {
        try {
            const response = await fetch(SHEET_TSV_URL);
            if (!response.ok) throw new Error();
            bereitsGeleseneCover = await response.text();
            console.log("Abgleich mit Google Sheets erfolgreich.");
        } catch (e) {
            console.warn("Google Sheets Abgleich fehlgeschlagen. Zeige alle Cover.");
            bereitsGeleseneCover = "";
        }
    };

    // 2. Google Sheets Übertragung
    const addToGoogleSheets = async (buch, element) => {
        const confirmMsg = `Möchtest du "${buch.title}" in die Google Sheets aufnehmen?`;
        if (!confirm(confirmMsg)) return;

        // Link-Format für die Tabelle
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
            // Senden an Google Forms
            fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData });

            // Sofortiges Ausblenden in der UI
            element.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            element.style.opacity = "0";
            element.style.transform = "scale(0.8)";
            
            setTimeout(() => {
                element.remove();
                // Aus lokalem Speicher entfernen für Suche
                alleBuecher = alleBuecher.filter(b => b.cover !== buch.cover);
            }, 500);

            alert(`"${buch.title}" wurde übertragen! Es kann 1-2 Min. dauern, bis es auf allen Geräten verschwindet.`);
        } catch (error) {
            console.error("Fehler beim Senden:", error);
        }
    };

    // 3. Bilder rendern
    const renderBooks = (buecherListe) => {
        container.innerHTML = "";

        buecherListe.forEach(buch => {
            // Nur anzeigen, wenn der Dateiname NICHT in der Google TSV steht
            if (buch.cover && !bereitsGeleseneCover.includes(buch.cover)) {
                const wrapper = document.createElement("div");
                wrapper.classList.add("buch-wrapper");

                const img = document.createElement("img");
                img.src = baseURL + buch.cover;
                img.alt = buch.title;
                img.loading = "lazy";
                img.classList.add("sub-bild");

                const overlay = document.createElement("div");
                overlay.classList.add("plus-overlay");
                overlay.textContent = "+";
                
                overlay.addEventListener("click", () => addToGoogleSheets(buch, wrapper));

                wrapper.appendChild(img);
                wrapper.appendChild(overlay);
                container.appendChild(wrapper);
            }
        });
    };

    // Initialisierung
    const init = async () => {
        await ladeGeleseneStatus();
        
        try {
            const response = await fetch(jsonURL);
            if (!response.ok) throw new Error("JSON konnte nicht geladen werden.");
            const daten = await response.json();
            alleBuecher = daten.books;
            renderBooks(alleBuecher);
        } catch (error) {
            console.error("Fehler beim Laden:", error);
            container.textContent = "Bilder konnten nicht geladen werden.";
        }
    };

    // Suche
    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        const gefiltert = alleBuecher.filter(b => 
            (b.title || "").toLowerCase().includes(term) || 
            (b.author || "").toLowerCase().includes(term) || 
            (b.isbn || "").toLowerCase().includes(term) || 
            (b.genre || "").toLowerCase().includes(term)
        );
        renderBooks(gefiltert);
    });

    init();
});