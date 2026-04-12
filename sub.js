document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".sub");
    const searchInput = document.getElementById("sub-search");

    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";

    let alleBuecher = []; 

    const renderBooks = (buecherListe) => {
        container.innerHTML = ""; 

        buecherListe.forEach(buch => {
            if (buch.cover) {
                const img = document.createElement("img");
                img.src = baseURL + buch.cover;
                img.alt = buch.title;
                img.loading = "lazy";
                img.classList.add("sub-bild");
                
                // Wir speichern ISBN und Genre in den Tooltip (beim Drüberfahren sichtbar)
                // und als Daten-Attribute im HTML (gut für Debugging/Styles)
                img.title = `${buch.title} - ${buch.author}\nGenre: ${buch.genre}\nISBN: ${buch.isbn}`;
                img.dataset.isbn = buch.isbn;
                img.dataset.genre = buch.genre;
                
                container.appendChild(img);
            }
        });

        if (buecherListe.length === 0) {
            container.innerHTML = "<p>Keine passenden Bücher gefunden.</p>";
        }
    };

    try {
        const response = await fetch(jsonURL);
        if (!response.ok) throw new Error("sub.json konnte nicht geladen werden.");

        const daten = await response.json();
        alleBuecher = daten.books; 

        renderBooks(alleBuecher);

    } catch (error) {
        console.error("Fehler beim Laden:", error);
        container.textContent = "Bilder konnten nicht geladen werden.";
    }

    // Erweiterte Suche
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();

        const gefilterteBuecher = alleBuecher.filter(buch => {
            // Wir ziehen alle relevanten Felder für den Filter zusammen
            const titel = (buch.title || "").toLowerCase();
            const autor = (buch.author || "").toLowerCase();
            const genre = (buch.genre || "").toLowerCase();
            const isbn = (buch.isbn || "").toLowerCase();

            // Prüfen, ob der Suchbegriff in IRGENDEINEM dieser Felder vorkommt
            return titel.includes(searchTerm) || 
                   autor.includes(searchTerm) || 
                   genre.includes(searchTerm) || 
                   isbn.includes(searchTerm);
        });

        renderBooks(gefilterteBuecher);
    });
});