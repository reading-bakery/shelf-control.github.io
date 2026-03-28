document.addEventListener("DOMContentLoaded", () => {
    // CSV-Quellen (Google Sheets Veröffentlichungen)
    const booksCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv";
    const dailyCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv";

    // Google Form URLs
    const FORM_DAILY = 'https://docs.google.com/forms/d/e/1FAIpQLSe58QnLhT5Kujn2Wv-nF5uJqUM6JWQJ7NxDJT-iRNJiwXOEzg/formResponse';
    const FORM_FINISH = 'https://docs.google.com/forms/d/e/1FAIpQLSeFSSyKXQxicXnnc3c3ItkxgU_4HsD5jxqhieg9xumRT7bGCg/formResponse';

    // Feld-IDs für das DAILY Formular (Fortschritt eintragen)
    const FIELD_DAILY_TITLE = "entry.1952704878"; 
    const FIELD_DAILY_PAGES = "entry.1828547420"; 
    const FIELD_DAILY_MINS  = "entry.1811867671"; 
    const FIELD_DAILY_DATE  = "entry.1557582300"; 

    // Feld-IDs für das FINISH Formular (Buch beenden)
    const FIELD_FINISH_TITLE = "entry.1669812265"; 
    const FIELD_FINISH_DATE  = "entry.40812439"; 
    const FIELD_FINISH_STAR  = "entry.884078194"; 
    const FIELD_FINISH_FAZIT = "entry.1398380839"; 
    const FIELD_FINISH_TEMPO = "entry.2104570190"; 

    // Hilfsfunktion: Deutsches Format für Streaks (TT.MM.JJJJ)
    const getGermanDate = () => {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    // Hilfsfunktion: ISO Format für Beenden (YYYY-MM-DD)
    const getIsoDate = () => new Date().toISOString().split('T')[0];

    // Daten laden
    Promise.all([
        fetch(booksCsvUrl).then(res => res.text()),
        fetch(dailyCsvUrl).then(res => res.text())
    ]).then(([booksText, dailyText]) => {
        const books = Papa.parse(booksText, { header: true }).data;
        const daily = Papa.parse(dailyText, { header: true }).data;

        const container = document.getElementById("currently");
        if (!container) return;
        container.innerHTML = "";

        books.forEach(book => {
            const start = book["Start"];
            const end = book["Ende"];
            
            if (start && !end) {
                const cover = book["Cover"];
                const totalPages = parseInt(book["Seitenzahl total"]) || 0;
                const totalMinutes = parseInt(book["Minuten total"]) || 0;
                const format = book["Format"];
                const title = book["Titel"] || book["Buch"] || "";

                // Fortschritt berechnen
                let progress = 0;
                daily.forEach(entry => {
                    if (entry["Buch"] === title) {
                        progress += (format === "Hörbuch") ? (parseInt(entry["Minuten"]) || 0) : (parseInt(entry["Seiten"]) || 0);
                    }
                });

                const total = format === "Hörbuch" ? totalMinutes : totalPages;
                const percentage = total ? Math.min((progress / total) * 100, 100) : 0;

                const bookDiv = document.createElement("div");
                bookDiv.classList.add("currently-book");
                bookDiv.innerHTML = `
                    <div class="cover-wrapper">
                        <img src="${cover}" alt="${title}" class="currently-cover">
                        <div class="overlay-buttons">
                            <button class="btn-progress">＋ Fortschritt</button>
                            <button class="btn-finish">✔ Beenden</button>
                        </div>
                    </div>
                    <div class="currently-info">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${percentage}%;"></div>
                        </div>
                        <p>${progress} / ${total} ${format === "Hörbuch" ? "Minuten" : "Seiten"}
                        <br> <strong>(${percentage.toFixed(0)}%)</strong></p>
                    </div>
                `;

                // --- Event: Fortschritt hinzufügen (DAILY) ---
                bookDiv.querySelector(".btn-progress").addEventListener("click", () => {
                    const unit = format === "Hörbuch" ? "Minuten" : "Seiten";
                    const val = prompt(`Wie viele ${unit} hast du heute bei "${title}" geschafft?`);
                    
                    if (val && !isNaN(val)) {
                        const fd = new FormData();
                        fd.append(FIELD_DAILY_TITLE, title);
                        fd.append(FIELD_DAILY_DATE, getGermanDate()); // Streaks brauchen TT.MM.JJJJ
                        
                        if (format === "Hörbuch") {
                            fd.append(FIELD_DAILY_MINS, val);
                        } else {
                            fd.append(FIELD_DAILY_PAGES, val);
                        }

                        fetch(FORM_DAILY, { method: "POST", mode: "no-cors", body: fd })
                        .then(() => {
                            alert("Fortschritt gespeichert!");
                            location.reload();
                        })
                        .catch(err => alert("Fehler: " + err));
                    }
                });


                // --- Event: Buch abschließen (FINISH) ---
                bookDiv.querySelector(".btn-finish").addEventListener("click", () => {
                    // 1. Auswahl Fazit
                    const fazitOptionen = ["Abgebrochen", "Flop", "Solide", "Lesenswert", "Highlight"];
                    const fazitText = fazitOptionen.map((opt, i) => `${i + 1}: ${opt}`).join("\n");
                    const fazitWahl = prompt(`Wähle ein Fazit (Zahl eingeben):\n${fazitText}`, "");
                    const ausgewähltesFazit = fazitOptionen[parseInt(fazitWahl) - 1] || "Solide";

                    // 2. Auswahl Lesetempo
                    const tempoOptionen = ["Langsam", "Mittel", "Schnell"];
                    const tempoText = tempoOptionen.map((opt, i) => `${i + 1}: ${opt}`).join("\n");
                    const tempoWahl = prompt(`Wähle das Lesetempo (Zahl eingeben):\n${tempoText}`, "");
                    const ausgewähltesTempo = tempoOptionen[parseInt(tempoWahl) - 1] || "Mittel";

                    // 3. Sterne & Bestätigung
                    const sterne = prompt("Bewertung (1-5 Sterne):", "");

                    if (confirm(`"${title}" beenden?\nFazit: ${ausgewähltesFazit}\nTempo: ${ausgewähltesTempo}\nSterne: ${sterne}`)) {
                        const fd = new FormData();
                        fd.append(FIELD_FINISH_TITLE, title);
                        fd.append(FIELD_FINISH_DATE, getIsoDate()); 
                        fd.append(FIELD_FINISH_STAR, sterne);
                        fd.append(FIELD_FINISH_FAZIT, ausgewähltesFazit);
                        fd.append(FIELD_FINISH_TEMPO, ausgewähltesTempo);

                        fetch(FORM_FINISH, { method: "POST", mode: "no-cors", body: fd })
                        .then(() => {
                            alert("Buch erfolgreich archiviert!");
                            location.reload();
                        })
                        .catch(err => alert("Fehler beim Senden: " + err));
                    }
                });

                container.appendChild(bookDiv);
            }
        });
    }).catch(err => console.error("Fehler beim Laden der CSV-Daten:", err));
});