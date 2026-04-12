document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("wishlistContainer");
    const zufallBtn = document.getElementById("luckyZufall");

    // --- KONFIGURATION ---
    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/wishlist/";
    const jsonURL = baseURL + "wishlist.json";

    let bilder = [];

    // 1. JSON laden
    try {
        const response = await fetch(jsonURL);
        if (!response.ok) throw new Error("wishlist.json konnte nicht geladen werden.");
        bilder = await response.json();
        console.log("Wunschliste-Zufall: Daten erfolgreich geladen.");
    } catch (error) {
        console.error("Fehler beim Laden der Bildliste:", error);
        return;
    }

    // 2. Der Würfel-Event
    zufallBtn.addEventListener("click", () => {
        // Container leeren (entfernt das alte Ergebnis)
        container.innerHTML = ""; 

        if (!bilder || bilder.length === 0) {
            container.innerHTML = "<p style='color:white;'>Keine Bilder in der Wunschliste gefunden.</p>";
            return;
        }

        // Zufälliges Bild auswählen
        const zufallsIndex = Math.floor(Math.random() * bilder.length);
        const dateiname = bilder[zufallsIndex];

        // Wir erstellen ein Bild-Element
        const img = document.createElement("img");
        img.src = baseURL + dateiname;
        img.alt = "Zufälliges Wunschlisten-Buch: " + dateiname;
        img.loading = "lazy";

        // WICHTIG: Die Klasse für die festen Maße (200x300px)
        img.classList.add("wishlist-bild-large"); 

        // Zentrierung erzwingen, falls das CSS es noch nicht macht
        img.style.display = "block";
        img.style.margin = "0 auto";

        // Bild in den Container einfügen
        container.appendChild(img);
    });
});