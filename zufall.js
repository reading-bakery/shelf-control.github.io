document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("subContainer");
    const zufallBtn = document.getElementById("luckyZufall");

    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";

    let bilder = [];

    try {
        const response = await fetch(jsonURL);
        if (!response.ok) throw new Error("sub.json konnte nicht geladen werden.");
        bilder = await response.json();
    } catch (error) {
        console.error("Fehler beim Laden der Bildliste:", error);
        return;
    }

    zufallBtn.addEventListener("click", () => {
        // Alle vorhandenen Bilder in .sub ausblenden
        document.querySelectorAll(".sub-bild").forEach(img => img.remove());

        if (!bilder || bilder.length === 0) {
            container.textContent = "Keine Bilder vorhanden.";
            return;
        }

        // Zufälliges Bild auswählen
        const zufallsIndex = Math.floor(Math.random() * bilder.length);
        const dateiname = bilder[zufallsIndex];

        const img = document.createElement("img");
        img.src = baseURL + dateiname;
        img.alt = "Zufälliges Buchcover: " + dateiname;
        img.loading = "lazy";
        img.classList.add("sub-bild", "sub-bild-large");  // große Klasse nur für Zufallsbild

        container.appendChild(img);
    });
});
