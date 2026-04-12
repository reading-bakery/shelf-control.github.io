document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("subContainer");
    const zufallBtn = document.getElementById("luckyZufall");

    // --- KONFIGURATION ---
    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";
    const SHEET_TSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=tsv";

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

    // --- MODAL ELEMENTE ---
    const modal = document.getElementById("book-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalAuthor = document.getElementById("modal-author");
    const modalCover = document.getElementById("modal-cover");
    const confirmBtn = document.getElementById("modal-confirm");
    const cancelBtn = document.getElementById("modal-cancel");

    let alleBuecher = [];
    let bereitsGeleseneCover = "";

    // 1. Google Sheets Abgleich
    try {
        const sheetResponse = await fetch(SHEET_TSV_URL);
        if (sheetResponse.ok) {
            bereitsGeleseneCover = await sheetResponse.text();
            console.log("Zufall-Abgleich mit Google Sheets erfolgreich.");
        }
    } catch (e) { 
        console.warn("Abgleich im Zufall-Modus nicht möglich."); 
    }

    // 2. JSON laden und filtern
    try {
        const response = await fetch(jsonURL);
        const daten = await response.json();
        // Nur ungelesene Bücher mit Cover
        alleBuecher = daten.books.filter(b => b.cover && !bereitsGeleseneCover.includes(b.cover));
    } catch (e) { 
        console.error("Fehler beim Laden der Buchdaten:", e); 
    }

    // 3. Modal-Logik und Übertragung
    const openModalAndAdd = (buch, wrapperElement) => {
        // Modal mit Buchdaten befüllen
        modalCover.src = baseURL + buch.cover;
        modalTitle.textContent = buch.title;
        modalAuthor.textContent = buch.author;

        // Modal anzeigen
        modal.style.display = "flex";

        // Abbrechen-Button
        cancelBtn.onclick = () => { 
            modal.style.display = "none"; 
        };

        // Hinzufügen-Button
        confirmBtn.onclick = async () => {
            modal.style.display = "none";

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
                
                // UI Feedback im Zufall-Container
                wrapperElement.style.transition = "opacity 0.5s ease, transform 0.5s ease";
                wrapperElement.style.opacity = "0";
                wrapperElement.style.transform = "scale(0.8)";
                
                setTimeout(() => {
                    wrapperElement.innerHTML = "<p style='color:#a2bba3; font-weight:bold; font-size:1.2rem;'>Viel Spaß beim Lesen! 📖</p>";
                    wrapperElement.style.opacity = "1";
                    wrapperElement.style.transform = "scale(1)";
                    // Buch lokal entfernen, damit es nicht erneut gewürfelt wird
                    alleBuecher = alleBuecher.filter(b => b.cover !== buch.cover);
                }, 500);

            } catch (error) { 
                console.error("Übertragung fehlgeschlagen:", error); 
            }
        };
    };

    // 4. Der Würfel-Event (Zufallsauswahl)
    zufallBtn.addEventListener("click", () => {
        container.innerHTML = ""; 

        if (alleBuecher.length === 0) {
            container.innerHTML = "<p style='color:white;'>Keine ungelesenen Bücher im SuB gefunden.</p>";
            return;
        }

        const buch = alleBuecher[Math.floor(Math.random() * alleBuecher.length)];

        const wrapper = document.createElement("div");
        wrapper.classList.add("buch-wrapper");

        const img = document.createElement("img");
        img.src = baseURL + buch.cover;
        img.alt = buch.title;
        img.classList.add("sub-bild-large"); 

        const overlay = document.createElement("div");
        overlay.classList.add("plus-overlay");
        overlay.textContent = "+";
        overlay.style.pointerEvents = "auto"; 
        
        overlay.addEventListener("click", (e) => {
            e.stopPropagation();
            openModalAndAdd(buch, wrapper);
        });

        wrapper.appendChild(img);
        wrapper.appendChild(overlay);
        container.appendChild(wrapper);
    });
});