document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".sub");

    // Basis-URL für Bilder + JSON
    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json"; // <- JSON-Datei mit Bildnamen

    try {
        const response = await fetch(jsonURL);
        if (!response.ok) throw new Error("sub.json konnte nicht geladen werden.");

        const bilder = await response.json();

        bilder.forEach(dateiname => {
            const img = document.createElement("img");
            img.src = baseURL + dateiname;
            img.alt = dateiname;
            img.loading = "lazy";
            img.classList.add("sub-bild");
            container.appendChild(img);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Bilder:", error);
        container.textContent = "Bilder konnten nicht geladen werden.";
    }
});
