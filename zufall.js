document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("subContainer");

    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";

    try {
        const response = await fetch(jsonURL);
        if (!response.ok) throw new Error("sub.json konnte nicht geladen werden.");

        const bilder = await response.json();

        if (!bilder || bilder.length === 0) {
            container.textContent = "Keine Bilder vorhanden.";
            return;
        }

        // Zufälliges Bild wählen
        const zufallsIndex = Math.floor(Math.random() * bilder.length);
        const dateiname = bilder[zufallsIndex];

        const img = document.createElement("img");
        img.src = baseURL + dateiname;
        img.alt = "Zufälliges Buchcover: " + dateiname;
        img.loading = "lazy";
        img.classList.add("sub-bild");

        container.appendChild(img);
    } catch (error) {
        console.error("Fehler beim Laden des zufälligen Bildes:", error);
        container.textContent = "Zufallsbild konnte nicht geladen werden.";
    }
});
