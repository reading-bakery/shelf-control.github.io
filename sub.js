document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".sub");
    const searchInput = document.getElementById("sub-search");

    // --- KONFIGURATION ---
    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";
    const SHEET_TSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=tsv"; 
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";

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

    // --- MODAL ELEMENTE ---
    const modal = document.getElementById("book-modal");
    const closeBtn = document.getElementById("modal-cancel");
    const confirmBtn = document.getElementById("modal-confirm");

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

    // Hilfsfunktion: Erfolgs-Modal anzeigen
    function openSuccessAddModal() {
        return new Promise(resolve => {
            const successModal = document.getElementById("successAddModal");
            const btnOk = document.getElementById("btnSuccessAddOk");

            successModal.style.display = "flex";

            const onOk = () => {
                successModal.style.display = "none";
                btnOk.removeEventListener("click", onOk);
                resolve();
            };

            btnOk.addEventListener("click", onOk);
        });
    }

    // Hauptfunktion: Buch zu Google Sheets hinzufügen
    const addToGoogleSheets = (buch, element) => {
        // Buch-Modal befüllen
        document.getElementById("modal-cover").src = baseURL + buch.cover;
        document.getElementById("modal-title").textContent = buch.title;
        document.getElementById("modal-author").textContent = buch.author;

        modal.style.display = "flex";

        closeBtn.onclick = () => { modal.style.display = "none"; };

        confirmBtn.onclick = async () => {
            confirmBtn.disabled = true;
            confirmBtn.textContent = "Wird gesendet...";

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
                // 1. Daten an Google senden
                await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData });

                // 2. Buch-Auswahl-Modal schließen
                modal.style.display = "none";

                // 3. Erfolgs-Bestätigung anzeigen und auf Klick warten
                await openSuccessAddModal();

                // 4. UI-Animation: Buch aus der Liste entfernen
                element.style.transition = "all 0.5s ease";
                element.style.opacity = "0";
                element.style.transform = "translateY(-20px) scale(0.8)";
                
                setTimeout(() => {
                    element.remove();
                    alleBuecher = alleBuecher.filter(b => b.cover !== buch.cover);
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = "Hinzufügen";
                }, 500);

            } catch (error) {
                console.error("Fehler beim Senden:", error);
                alert("Fehler beim Hinzufügen. Bitte erneut versuchen.");
                confirmBtn.disabled = false;
                confirmBtn.textContent = "Hinzufügen";
            }
        };
    };

    // 3. Bilder rendern
    const renderBooks = (buecherListe) => {
        container.innerHTML = "";

        buecherListe.forEach(buch => {
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

    // Schließen bei Klick außerhalb
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    init();
});