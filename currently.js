document.addEventListener("DOMContentLoaded", () => {
    const booksCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv";
    const dailyCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv";

    // --- Google Form URLs ---
    const FORM_DAILY = 'https://docs.google.com/forms/d/e/1FAIpQLSe58QnLhT5Kujn2Wv-nF5uJqUM6JWQJ7NxDJT-iRNJiwXOEzg/formResponse';
    const FORM_FINISH = 'https://docs.google.com/forms/d/e/1FAIpQLSeFSSyKXQxicXnnc3c3ItkxgU_4HsD5jxqhieg9xumRT7bGCg/formResponse';

    // --- Feld-IDs DAILY ---
    const FIELD_DAILY_TITLE = "entry.1952704878"; 
    const FIELD_DAILY_PAGES = "entry.1828547420"; 
    const FIELD_DAILY_MINS  = "entry.1811867671"; 
    const FIELD_DAILY_DATE  = "entry.1557582300"; 

    // --- Feld-IDs FINISH ---
    const FIELD_FINISH_TITLE = "entry.1669812265"; 
    const FIELD_FINISH_DATE  = "entry.40812439"; 
    const FIELD_FINISH_STAR  = "entry.884078194"; 
    const FIELD_FINISH_FAZIT = "entry.1398380839"; 
    const FIELD_FINISH_TEMPO = "entry.2104570190"; 
    const FIELD_FINISH_STIMMUNG = "entry.599488239";
    const FIELD_FINISH_THEMEN = "entry.612668501";
    const FIELD_FINISH_SUBGENRE = "entry.172863033";

    // --- Hilfsfunktionen ---
    const getGermanDate = () => {
        const d = new Date();
        return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
    };
    const getIsoDate = () => new Date().toISOString().split('T')[0];

    // --- Checkbox/Radio Modal ---
    function openCheckboxModal(modalId, options, title="Auswahl", multiple=true) {
        return new Promise(resolve => {
            const modal = document.getElementById(modalId);
            const modalContent = modal.querySelector(".modal-content");
            const list = modal.querySelector(".checkbox-list");
            const search = modal.querySelector("input");
            const h3 = modal.querySelector("h3");

            h3.textContent = title;
            list.innerHTML = "";
            options.forEach(opt => {
                const label = document.createElement("label");
                if(multiple) label.innerHTML = `<input type="checkbox" value="${opt}"> ${opt}`;
                else label.innerHTML = `<input type="radio" name="singleChoice" value="${opt}"> ${opt}`;
                list.appendChild(label);
            });

            search.value = "";
            search.oninput = () => {
                const val = search.value.toLowerCase();
                list.querySelectorAll("label").forEach(l => {
                    l.style.display = l.textContent.toLowerCase().includes(val) ? "block" : "none";
                });
            };

            let errorMsg = modalContent.querySelector(".error-msg");
            if(!errorMsg) {
                errorMsg = document.createElement("div");
                errorMsg.className = "error-msg";
                errorMsg.style.color = "red";
                errorMsg.style.fontSize = "0.9em";
                errorMsg.style.marginTop = "4px";
                h3.after(errorMsg);
            }
            errorMsg.textContent = "";
            modalContent.style.border = "";

            modal.style.display = "flex";

            const save = () => {
                const checkedInputs = Array.from(list.querySelectorAll("input:checked"));
                if(checkedInputs.length === 0) {
                    modalContent.style.border = "2px solid red";
                    errorMsg.textContent = `Bitte ${title} abgeben`;
                    return; 
                }
                modalContent.style.border = "";
                errorMsg.textContent = "";
                const checked = checkedInputs.map(i=>i.value);
                modal.style.display = "none";
                cleanup();
                resolve(checked);
            };
            const cancel = () => {
                modal.style.display = "none";
                cleanup();
                resolve([]);
            };

            function cleanup() {
                modal.querySelector(".modal-save").removeEventListener("click", save);
                modal.querySelector(".modal-cancel").removeEventListener("click", cancel);
            }

            modal.querySelector(".modal-save").addEventListener("click", save);
            modal.querySelector(".modal-cancel").addEventListener("click", cancel);
        });
    }

    // --- Sterne Modal ---
    function openStarsModal() {
        return new Promise(resolve => {
            const modal = document.getElementById("starsModal");
            const modalContent = modal.querySelector(".modal-content");
            const input = modal.querySelector("input");
            const h3 = modal.querySelector("h3");

            let errorMsg = modalContent.querySelector(".error-msg");
            if(!errorMsg) {
                errorMsg = document.createElement("div");
                errorMsg.className = "error-msg";
                errorMsg.style.color = "red";
                errorMsg.style.fontSize = "0.9em";
                errorMsg.style.marginTop = "4px";
                h3.after(errorMsg);
            }
            errorMsg.textContent = "";
            modalContent.style.border = "";

            modal.style.display = "flex";

            const save = () => {
                let val = input.value.trim().replace(",", ".");
                const num = parseFloat(val);
                if(isNaN(num) || num < 1 || num > 5) {
                    modalContent.style.border = "2px solid red";
                    errorMsg.textContent = "Bitte Bewertung abgeben (Komma-Zahlen von 1 bis 5 erlaubt)";
                    return;
                }
                modalContent.style.border = "";
                errorMsg.textContent = "";
                modal.style.display = "none";
                cleanup();
                resolve(num.toString().replace(".", ",")); // mit Komma
            };
            const cancel = () => {
                modal.style.display = "none";
                cleanup();
                resolve("");
            };
            function cleanup() {
                modal.querySelector(".modal-save").removeEventListener("click", save);
                modal.querySelector(".modal-cancel").removeEventListener("click", cancel);
            }

            modal.querySelector(".modal-save").addEventListener("click", save);
            modal.querySelector(".modal-cancel").addEventListener("click", cancel);
        });
    }

    // --- CSV Daten laden ---
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
            if (!start || end) return;

            const cover = book["Cover"];
            const totalPages = parseInt(book["Seitenzahl total"]) || 0;
            const totalMinutes = parseInt(book["Minuten total"]) || 0;
            const format = book["Format"];
            const title = book["Titel"] || book["Buch"] || "";

            let progress = 0;
            daily.forEach(entry => {
                if (entry["Buch"] === title) {
                    progress += (format==="Hörbuch") ? (parseInt(entry["Minuten"])||0) : (parseInt(entry["Seiten"])||0);
                }
            });
            const total = format==="Hörbuch"? totalMinutes : totalPages;
            const percentage = total ? Math.min((progress/total)*100,100) : 0;

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
                    <p>${progress} / ${total} ${format==="Hörbuch"?"Minuten":"Seiten"}<br>
                    <strong>(${percentage.toFixed(0)}%)</strong></p>
                </div>
            `;
            container.appendChild(bookDiv);

            // --- Fortschritt ---
            bookDiv.querySelector(".btn-progress").addEventListener("click", () => {
                const unit = format==="Hörbuch"?"Minuten":"Seiten";
                const val = prompt(`Wie viele ${unit} hast du heute bei "${title}" geschafft?`);
                if (!val || isNaN(val)) return;
                const fd = new FormData();
                fd.append(FIELD_DAILY_TITLE, title);
                fd.append(FIELD_DAILY_DATE, getGermanDate());
                if(format==="Hörbuch") fd.append(FIELD_DAILY_MINS,val);
                else fd.append(FIELD_DAILY_PAGES,val);
                fetch(FORM_DAILY,{method:"POST",mode:"no-cors",body:fd})
                    .then(()=> { alert("Fortschritt gespeichert!"); location.reload(); })
                    .catch(err=>alert("Fehler: "+err));
            });

            // --- Buch beenden ---
            bookDiv.querySelector(".btn-finish").addEventListener("click", async () => {
                // Reihenfolge: Sterne, Fazit, Sub Genre, Themen, Stimmung, Tempo

                const sterne = await openStarsModal();

                const fazitArr = await openCheckboxModal("fazitModal", ["Abgebrochen","Flop","Solide","Lesenswert","Highlight"], "Fazit", false);
                const fazit = fazitArr[0];

                const subgenreArr = await openCheckboxModal("subgenreModal", ["Klassiker", "(Auto-)Biografie", "Zeitgenössisch", "Mystery", "Fantasy", "Science Fiction", "Dystopie", "Historisch", "Magischer Realismus", "Kinderbuch", "New Adult", "Young Adult", "Horror"], "Sub Genre", true);
                const subgenreStr = subgenreArr.join(", ");

                const themenArr = await openCheckboxModal("themenModal", [
                    "Abenteuer","Ableismus","Antisemitismus","Alkoholismus","Armut","Bücher","Coming of Age","DDR","Demenz/Alzheimer","Depression","Diktatur","Ehebruch/Betrug","Eifersucht","Eltern-Kind-Beziehung","Elternschaft","Emanzipation","Familie","Female Rage","Feminismus","Freundschaft","Geheimnisse","Generationen","Gerichtsverfahren","Geschwister","Gesellschaft","Gewalt","Holocaust","Homophobie","Identität/Herkunft","Klassismus","Krankheit","Krieg","Kunst","Liebe","Magie","Missbrauch","Mord","Musik","Nachkriegszeit","Natur","Philosophie","Politik","Psychologisch","Queer","Rassismus","Religion","Rolle der Frau","Sexismus","Spionage","Sprache","Soziologie","Tod","Trauer","Trauma","Toxische Beziehungen","Vergewaltigung","Verrat","Wissenschaft","Zeitreise"
                ], "Themen", true);
                const themenStr = themenArr.join(", ");

                const stimmungArr = await openCheckboxModal("stimmungModal", ["Traurig","Langweilig","Lustig/Humorvoll","Aufwühlend","Spannend","Melancholisch","Informativ","Romantisch","Nachdenklich","Düster","Gruselig","Cozy/Gemütlich","Ruhig","Herausfordernd/Komplex","Verwirrend","Eklig","Überraschend","Dramatisch"], "Stimmung", true);
                const stimmungStr = stimmungArr.join(", ");

                const tempoArr = await openCheckboxModal("tempoModal", ["Langsam","Mittel","Schnell"], "Lesetempo", false);
                const tempo = tempoArr[0];

                if(confirm(`"${title}" beenden?\nSterne: ${sterne}\nFazit: ${fazit}\nSub Genre: ${subgenreStr}\nThemen: ${themenStr}\nStimmung: ${stimmungStr}\nTempo: ${tempo}`)){
                    const fd = new FormData();
                    fd.append(FIELD_FINISH_TITLE, title);
                    fd.append(FIELD_FINISH_DATE, getIsoDate());
                    fd.append(FIELD_FINISH_STAR, sterne);
                    fd.append(FIELD_FINISH_FAZIT, fazit);
                    fd.append(FIELD_FINISH_SUBGENRE, subgenreStr);
                    fd.append(FIELD_FINISH_THEMEN, themenStr);
                    fd.append(FIELD_FINISH_STIMMUNG, stimmungStr);
                    fd.append(FIELD_FINISH_TEMPO, tempo);

                    fetch(FORM_FINISH,{method:"POST",mode:"no-cors",body:fd})
                        .then(()=> { alert("Buch erfolgreich archiviert!"); location.reload(); })
                        .catch(err=>alert("Fehler beim Senden: "+err));
                }
            });
        });
    }).catch(err => console.error("Fehler beim Laden der CSV-Daten:", err));
});
