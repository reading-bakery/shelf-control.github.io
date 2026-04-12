document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".sub");
    const searchInput = document.getElementById("sub-search");

    // URLs
    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";

    // Google Form Entry IDs
    const FORM_ENTRIES = {
        start: "entry.231863637", title: "entry.554995646", author: "entry.890797774", 
        gender: "entry.1685694101", umfang: "entry.436245051", seiten: "entry.1082451600",
        minuten: "entry.1433991187", genre: "entry.1105252862", sprache: "entry.807495643",
        format: "entry.9727566", status: "entry.914730295", verlag: "entry.1674035100", 
        cover: "entry.952453014"
    };

    let alleBuecher = [];

    // Funktion: Buch an Google Sheets senden
    const addToGoogleSheets = async (buch) => {
        const confirmMsg = `Möchtest du "${buch.title}" in die Google Sheets aufnehmen?`;
        if (!confirm(confirmMsg)) return;

        // Dein spezielles Link-Format für die Tabelle
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
        formData.append(FORM_ENTRIES.status, buch.status || "SuB"); 
        formData.append(FORM_ENTRIES.verlag, buch.verlag || "");
        formData.append(FORM_ENTRIES.cover, githubLink);

        try {
            await fetch(FORM_URL, {
                method: "POST",
                mode: "no-cors",
                body: formData
            });
            alert(`"${buch.title}" wurde erfolgreich gesendet!`);
        } catch (error) {
            console.error("Fehler beim Senden:", error);
            alert("Fehler beim Senden an Google Sheets.");
        }
    };

    // Funktion: Bücher in der Galerie anzeigen
    const renderBooks = (buecherListe) => {
        container.innerHTML = "";

        buecherListe.forEach(buch => {
            if (buch.cover) {
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
                
                overlay.addEventListener("click", () => addToGoogleSheets(buch));

                wrapper.appendChild(img);
                wrapper.appendChild(overlay);
                container.appendChild(wrapper);
            }
        });

        if (buecherListe.length === 0) {
            container.innerHTML = "<p style='color:white;'>Keine Treffer gefunden.</p>";
        }
    };

    // JSON Daten laden
    try {
        const response = await fetch(jsonURL);
        if (!response.ok) throw new Error("sub.json konnte nicht geladen werden.");

        const daten = await response.json();
        alleBuecher = daten.books; 
        renderBooks(alleBuecher);
    } catch (error) {
        console.error("Fehler:", error);
        container.textContent = "Fehler beim Laden der Bibliothek.";
    }

    // Filter-Logik
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
});