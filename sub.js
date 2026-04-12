document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".sub");

    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";

    try {
        const response = await fetch(jsonURL);
        if (!response.ok) throw new Error("sub.json konnte nicht geladen werden.");

        const daten = await response.json();

        // Hier liegt die Änderung: Wir greifen auf daten.books zu!
        const bücher = daten.books; 

        if (!Array.isArray(bücher)) {
            throw new Error("Das 'books'-Feld wurde im JSON nicht gefunden oder ist kein Array.");
        }

        bücher.forEach(buch => {
            if (buch.cover) {
                const img = document.createElement("img");
                img.src = baseURL + buch.cover;
                img.alt = buch.title;
                img.loading = "lazy";
                img.classList.add("sub-bild");
                
                // Optionaler Bonus: Zeige Titel/Autor beim Hovern an
                img.title = `${buch.title} - ${buch.author}`;
                
                container.appendChild(img);
            }
        });
    } catch (error) {
        console.error("Fehler beim Laden der Bilder:", error);
        container.textContent = "Bilder konnten nicht geladen werden.";
    }
});