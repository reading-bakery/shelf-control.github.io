document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("subContainer");
    const zufallBtn = document.getElementById("luckyZufall");

    // --- KONFIGURATION ---
    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";
    
    // Dein verifizierter TSV-Link für den Abgleich
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

    let alleBuecher = [];
    let bereitsGeleseneCover = "";

    // 1. Google Sheets Abgleich: Liste der gelesenen Bücher laden
    try {
        const sheetResponse = await fetch(SHEET_TSV_URL);
        if (sheetResponse.ok) {
            bereitsGeleseneCover = await sheetResponse.text();
            console.log("Zufall-Abgleich mit Google Sheets erfolgreich.");
        }
    } catch (e) { 
        console.warn("Abgleich im Zufall-Modus nicht möglich."); 
    }

    // 2. JSON laden und gelesene Bücher sofort herausfiltern
    try {
        const response = await fetch(jsonURL);
        const daten = await response.json();
        // Nur Bücher behalten, die ein Cover haben UND noch nicht im Sheet stehen
        alleBuecher = daten.books.filter(b => b.cover && !bereitsGeleseneCover.includes(b.cover));
    } catch (e) { 
        console.error("Fehler beim Laden der Buchdaten:", e); 
    }

    // 3. Funktion: Buch an Google Sheets senden (nach Klick auf +)
    const addToGoogleSheets = async (buch, element) => {
        const confirmMsg = `Möchtest du "${buch.title}" hinzufügen?`;
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
            
            // UI Feedback: Das Buch verschwindet
            element.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            element.style.opacity = "0";
            element.style.transform = "scale(0.8)";
            
            setTimeout(() => {
                element.innerHTML = "<p style='color:#a2bba3; font-weight:bold;'>Viel Spaß beim Lesen! 📖</p>";
                element.style.opacity = "1";
                element.style.transform = "scale(1)";
            }, 500);

        } catch (error) { 
            console.error("Übertragung fehlgeschlagen:", error); 
        }
    };

    // 4. Der Würfel-Event (Zufallsauswahl)
    zufallBtn.addEventListener("click", () => {
        container.innerHTML = ""; // Vorheriges Ergebnis löschen

        if (alleBuecher.length === 0) {
            container.innerHTML = "<p style='color:white;'>Keine ungelesenen Bücher im SuB gefunden.</p>";
            return;
        }

        // Zufälliges Buch aus der gefilterten Liste wählen
        const buch = alleBuecher[Math.floor(Math.random() * alleBuecher.length)];

        // Wrapper erstellen (für die Zentrierung und das Overlay)
       const wrapper = document.createElement("div");
            wrapper.classList.add("buch-wrapper");
            wrapper.style.margin = "0 auto"; 
            wrapper.style.width = "fit-content"; // ÄNDERUNG: Passt sich dem Bild an, statt fest 200px
            wrapper.style.display = "block"; // Stellt sicher, dass margin: auto funktioniert

        // Das Bild (erhält die "Large"-Klasse für die festen Maße)
        const img = document.createElement("img");
        img.src = baseURL + buch.cover;
        img.alt = buch.title;
        img.classList.add("sub-bild-large"); // Greift auf dein CSS (200x300px) zu

        // Das Plus-Overlay zum schnellen Hinzufügen
        const overlay = document.createElement("div");
        overlay.classList.add("plus-overlay");
        overlay.textContent = "+";
        overlay.style.pointerEvents = "auto"; // Wichtig für den Klick!
        
        overlay.addEventListener("click", (e) => {
            e.stopPropagation(); // Verhindert Konflikte mit anderen Klicks
            addToGoogleSheets(buch, wrapper);
        });

        // Alles zusammenbauen
        wrapper.appendChild(img);
        wrapper.appendChild(overlay);
        container.appendChild(wrapper);
    });
});