/**
 * Lädt Streak-Daten aus Google Sheets und aktualisiert das UI
 */
async function updateStreakDisplay() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv';

    try {
        const response = await fetch(csvUrl);
        const csvData = await response.text();
        
        // CSV in Zeilen zerlegen
        const rows = csvData.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) return; 

        // 1. Höchste Streak (All-Time High) ermitteln
        let maxStreak = 0;
        // Wir starten bei Index 1, um einen eventuellen Tabellen-Header zu ignorieren
        for (let i = 1; i < rows.length; i++) {
            const currentVal = parseInt(rows[i].split(',')[0]) || 0;
            if (currentVal > maxStreak) {
                maxStreak = currentVal;
            }
        }

        // 2. Aktuellen Status (letzte Zeile) auslesen
        const lastRow = rows[rows.length - 1].split(',');
        const streakValue = parseInt(lastRow[0]) || 0;
        const delta = parseInt(lastRow[1]) || 0;

        // Logik für Text und Farbe (basierend auf deinen Vorgaben)
        const deltaText = delta === 0 ? "in Folge" : delta > 0 ? `+${delta} Vorsprung` : `-${Math.abs(delta)} Rückstand`;
        const deltaColor = delta === 0 ? "white" : delta > 0 ? "#13c913" : "#FF4500";

        // DOM Elemente befüllen
        const numberElement = document.getElementById('streak-number');
        const unitElement = document.getElementById('streak-unit');
        const totalElement = document.getElementById('streak-total');
        const totalUnitElement = document.getElementById('streak-total-unit');

        // Aktuelle Daten
        if (numberElement) numberElement.textContent = streakValue;
        if (unitElement) {
            unitElement.textContent = deltaText;
            unitElement.style.color = deltaColor;
        }

        // Höchstwert Daten
        if (totalElement) totalElement.textContent = maxStreak;
        if (totalUnitElement) totalUnitElement.textContent = "Bester Streak";

    } catch (error) {
        console.error('Fehler beim Abrufen der Streak-Daten:', error);
    }
}

updateStreakDisplay();