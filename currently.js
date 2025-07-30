document.addEventListener('DOMContentLoaded', () => {
    // Die URL zu deiner öffentlich zugänglichen Google Sheets CSV-Datei
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?output=csv';
    
    // Das HTML-Element, in das die Bilder eingefügt werden sollen
    const imageContainer = document.getElementById('currentlyImages'); 

    // Wichtige Spaltenindizes basierend auf deiner Liste der Überschriften:
    // "Cover" ist die 2. Spalte, daher Index 1
    const imageUrlColumnIndex = 1; 
    // "Ende" ist die 16. Spalte, daher Index 15
    const endDateColumnIndex = 15; 

    // Überprüfen, ob der Container in der HTML-Seite existiert
    if (!imageContainer) {
        console.error('HTML element with ID "currentlyImages" not found. Please add <div id="currentlyImages"></div> to your HTML.');
        return; // Skript beenden, wenn das Element nicht gefunden wurde
    }

    // Daten von der CSV-URL abrufen
    fetch(CSV_URL)
        .then(response => {
            // Überprüfen, ob der HTTP-Status erfolgreich ist (200 OK)
            if (!response.ok) {
                // Wenn nicht, einen Fehler werfen, der im .catch-Block abgefangen wird
                throw new Error(`HTTP error! Status: ${response.status} - Could not fetch CSV data.`);
            }
            // Die Antwort als Text zurückgeben (CSV-Inhalt)
            return response.text();
        })
        .then(csvText => {
            // Wenn der CSV-Text erfolgreich abgerufen wurde, die Funktion zum Parsen und Anzeigen aufrufen
            parseCSVAndDisplayImages(csvText);
        })
        .catch(error => {
            // Fehler beim Abrufen der Daten in der Konsole loggen und eine Fehlermeldung auf der Seite anzeigen
            console.error('Error fetching the CSV data:', error);
            imageContainer.innerHTML = '<p>Fehler beim Laden der Bilder. Bitte versuchen Sie es später erneut.</p>';
        });

    /**
     * Parst den CSV-Text und fügt die entsprechenden Bilder in den Container ein.
     * @param {string} csv - Der gesamte CSV-Inhalt als String.
     */
    function parseCSVAndDisplayImages(csv) {
        // Teilen des CSV-Textes in einzelne Zeilen
        const lines = csv.split('\n');
        let imagesFound = 0; // Zähler für die Anzahl der erfolgreich gefundenen und angezeigten Bilder

        // Iteration durch jede Zeile, beginnend ab der zweiten Zeile (Index 1),
        // da die erste Zeile (Index 0) die Header enthält
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim(); // Zeile trimmen, um Leerzeichen am Anfang/Ende zu entfernen
            if (!line) continue; // Leere Zeilen überspringen

            // Die Zeile in einzelne Spalten (Felder) parsen
            const columns = parseCSVLine(line); 

            // Sicherstellen, dass die Zeile genügend Spalten für Bild-URL und Enddatum hat
            if (columns.length > imageUrlColumnIndex && columns.length > endDateColumnIndex) {
                let imageUrl = columns[imageUrlColumnIndex].trim(); // Den Wert aus der "Cover"-Spalte extrahieren und trimmen
                let endDate = columns[endDateColumnIndex].trim();   // Den Wert aus der "Ende"-Spalte extrahieren und trimmen

                // Bedingung: Nur Bilder laden, wenn das Enddatum leer ist
                // Hier wird auch ein potenzieller #NUM!-Fehler als "leer" interpretiert, falls er in der Ende-Spalte auftritt
                if (!endDate || endDate === '#NUM!') { 
                    // Entferne Anführungszeichen von der URL, falls diese durch den CSV-Export hinzugefügt wurden
                    if (imageUrl.startsWith('"') && imageUrl.endsWith('"')) {
                        imageUrl = imageUrl.substring(1, imageUrl.length - 1);
                    }

                    // Überprüfen, ob die extrahierte URL ein gültiger Link ist, bevor versucht wird, das Bild zu erstellen
                    try {
                        new URL(imageUrl); // Versucht, ein URL-Objekt zu erstellen; wirft Fehler bei ungültiger URL
                        createAndAppendImage(imageUrl); // Funktion zum Erstellen und Hinzufügen des Bildes aufrufen
                        imagesFound++; // Zähler erhöhen
                    } catch (e) {
                        // Warnung in der Konsole, wenn eine ungültige URL gefunden wird
                        console.warn(`Invalid URL found in row ${i + 1}, column "Cover" (Index ${imageUrlColumnIndex}): ${imageUrl}. Skipping. Error: ${e.message}`);
                    }
                }
            } else {
                // Warnung, wenn eine Zeile nicht die erwartete Anzahl von Spalten hat
                console.warn(`Row ${i + 1} does not have enough columns for "Cover" or "Ende". Skipping.`);
            }
        }

        // Wenn nach dem Durchlaufen aller Zeilen keine passenden Bilder gefunden wurden, eine Meldung anzeigen
        if (imagesFound === 0) {
            imageContainer.innerHTML = '<p>Derzeit werden keine Bücher gelesen oder es wurden keine passenden Bilder gefunden.</p>';
        }
    }

    /**
     * Eine Hilfsfunktion zum robusteren Parsen einer einzelnen CSV-Zeile.
     * Behandelt Kommas innerhalb von Anführungszeichen.
     * @param {string} line - Die einzelne CSV-Zeile als String.
     * @returns {string[]} Ein Array von Strings, die die Spaltenwerte darstellen.
     */
    function parseCSVLine(line) {
        const result = [];
        let inQuote = false; // Flag, um zu verfolgen, ob wir uns innerhalb von Anführungszeichen befinden
        let currentField = ''; // Akkumuliert den Inhalt des aktuellen Feldes

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuote = !inQuote; // Anführungszeichen schalten den inQuote-Status um
            } else if (char === ',' && !inQuote) {
                // Wenn ein Komma außerhalb von Anführungszeichen gefunden wird, ist es ein Trennzeichen
                result.push(currentField); // Feld zum Ergebnis hinzufügen
                currentField = ''; // Aktuelles Feld zurücksetzen
            } else {
                currentField += char; // Zeichen zum aktuellen Feld hinzufügen
            }
        }
        result.push(currentField); // Das letzte Feld hinzufügen, nachdem die Zeile beendet ist
        return result;
    }

    /**
     * Erstellt ein <img>-Element und fügt es dem Bildcontainer hinzu.
     * @param {string} url - Die URL des anzuzeigenden Bildes.
     */
    function createAndAppendImage(url) {
        const img = document.createElement('img');
        img.src = url; // Setzt die Bildquelle
        img.alt = 'Aktuell gelesenes Buch'; // Alternativtext für Barrierefreiheit
        
        // Grundlegendes Styling, um das Bild responsiv und visuell ansprechend zu machen
        img.style.maxWidth = '100%'; 
        img.style.height = 'auto'; 
        img.style.margin = '10px'; 
        img.style.border = '2px solid rgb(90, 165, 142)'; 
        img.style.borderRadius = '8px'; 
        img.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'; 
        
        // Event-Handler für den Fall, dass ein Bild nicht geladen werden kann
        img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
            // Fallback zu einem Platzhalterbild, falls das Bild nicht geladen werden kann
            img.src = 'placeholder.png'; // Stelle sicher, dass du eine "placeholder.png"-Datei hast oder ändere den Pfad
            img.alt = 'Bild konnte nicht geladen werden (Fehler)';
        };

        // Das erstellte Bild dem HTML-Container hinzufügen
        imageContainer.appendChild(img);
    }
});