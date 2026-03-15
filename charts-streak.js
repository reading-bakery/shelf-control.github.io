/**
 * Lädt Streak-Daten aus Google Sheets und aktualisiert das UI
 */
async function updateStreakDisplay() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv';

    try {
        const response = await fetch(csvUrl);
        const csvData = await response.text();
        
        // CSV parsen (einfache Zeilentrennung)
        const rows = csvData.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) return; // Falls keine Daten vorhanden sind

        // Annahme: Letzte Zeile enthält aktuellen Status
        // Spalte 0 = Streak-Zahl, Spalte 1 = Delta-Wert
        const lastRow = rows[rows.length - 1].split(',');
        const streakValue = parseInt(lastRow[0]) || 0;
        const delta = parseInt(lastRow[1]) || 0;

        // Deine vordefinierte Logik für Text und Farbe
        const deltaText = delta === 0 ? "Tage in Folge" : delta > 0 ? `+${delta} Vorsprung` : `-${Math.abs(delta)} Rückstand`;
        const deltaColor = delta === 0 ? "white" : delta > 0 ? "#13c913" : "#FF4500";

        // DOM Elemente ansprechen
        const numberElement = document.getElementById('streak-number');
        const unitElement = document.getElementById('streak-unit');

        if (numberElement) {
            numberElement.textContent = streakValue;
        }

        if (unitElement) {
            // Text setzen und Farbe direkt auf das Element anwenden
            unitElement.textContent = deltaText;
            unitElement.style.color = deltaColor;
        }

    } catch (error) {
        console.error('Fehler beim Abrufen der Streak-Daten:', error);
    }
}

// Sofort ausführen
updateStreakDisplay();