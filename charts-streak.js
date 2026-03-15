async function updateStreak() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv';

    try {
        const response = await fetch(csvUrl);
        const data = await response.text();
        const rows = data.split('\n').filter(row => row.trim() !== '');
        
        // Annahme: Die Daten stehen in der letzten Zeile (aktuellster Eintrag)
        // Wir nehmen Spalte 0 für den Streak und Spalte 1 für das Delta
        const lastRow = rows[rows.length - 1].split(',');
        const streakValue = parseInt(lastRow[0]) || 0;
        const delta = parseInt(lastRow[1]) || 0;

        // Deine Logik für Text und Farbe
        const deltaText = delta === 0 ? "Genau im Plan!" : delta > 0 ? `+${delta} Vorsprung` : `-${Math.abs(delta)} Rückstand`;
        const deltaColor = delta === 0 ? "white" : delta > 0 ? "#13c913" : "#FF4500";

        // DOM-Elemente befüllen
        const container = document.querySelector('.pie-streak');
        
        // Bestehendes h3 erhalten und Visualisierung hinzufügen
        container.innerHTML = `
            <h3>Streak</h3>
            <div style="font-size: 3.5rem; font-weight: bold; margin: 10px 0;">${streakValue}</div>
            <div style="font-size: 1.1rem; color: ${deltaColor}; font-weight: 500;">
                ${deltaText}
            </div>
        `;

    } catch (error) {
        console.error('Fehler beim Laden der Streak-Daten:', error);
        document.querySelector('.piesub').innerHTML += '<p>Daten nicht verfügbar</p>';
    }
}

// Initialisierung
updateStreak();