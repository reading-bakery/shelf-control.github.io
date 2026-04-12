document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".sub");

    // Basis-URL für Bilder + JSON
    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json"; 

    try {
        const response = await fetch(jsonURL);
        if (!response.ok) throw new Error("sub.json konnte nicht geladen werden.");

        const bücher = await response.json();

        // Falls das JSON ein direktes Array von Objekten ist:
        bücher.forEach(buch => {
            // Wir prüfen, ob ein Cover-Dateiname existiert
            if (buch.cover) {
                const img = document.createElement("img");
                img.src = baseURL + buch.cover; // Greift auf "cover" im Objekt zu
                img.alt = buch.title;           // Nutzt den Titel als Alt-Text
                img.loading = "lazy";
                img.classList.add("sub-bild");
                
                // Optional: Titel als Tooltip beim Drüberfahren
                img.title = `${buch.title} von ${buch.author}`;
                
                container.appendChild(img);
            }
        });
    } catch (error) {
        console.error("Fehler beim Laden der Bilder:", error);
        container.textContent = "Bilder konnten nicht geladen werden.";
    }
});