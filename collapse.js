document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.monat-btn');

  const monthNames = {
    '1': 'Januar',
    '2': 'Februar',
    '3': 'März',
    '4': 'April',
    '5': 'Mai',
    '6': 'Juni',
    '7': 'Juli',
    '8': 'August',
    '9': 'September',
    '10': 'Oktober',
    '11': 'November',
    '12': 'Dezember'
  };

  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv';

  // Objekt für alle Monate plus Abgebrochen
  let monate = {
    Januar: [],
    Februar: [],
    März: [],
    April: [],
    Mai: [],
    Juni: [],
    Juli: [],
    August: [],
    September: [],
    Oktober: [],
    November: [],
    Dezember: [],
    Abgebrochen: []
  };

  fetch(csvUrl)
    .then(response => {
      if (!response.ok) throw new Error('Netzwerkantwort war nicht OK');
      return response.text();
    })
    .then(csvText => {
      const results = Papa.parse(csvText, { header: false });
      const data = results.data;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 20) continue;

        const fazitRaw = row[19]?.trim();
        const fazit = fazitRaw ? fazitRaw.toLowerCase() : '';
        const monatRaw = row[16]?.trim();

        let monatName = null;

        if (fazit === 'abgebrochen') {
          monatName = 'Abgebrochen'; // Nur hier speichern
        } else {
          const monatNum = parseInt(monatRaw, 10);
          if (!isNaN(monatNum) && monatNum >= 1 && monatNum <= 12) {
            monatName = monthNames[monatNum.toString()];
          } else {
            continue; // Kein gültiger Monat → überspringen
          }
        }

        const coverUrl = row[1]?.trim();
        if (!coverUrl) continue;

        monate[monatName].push(coverUrl);
      }
    })
    .catch(error => {
      console.error('Fehler beim Laden der CSV:', error);
    });

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const monat = button.textContent.trim();
      const collapseDiv = document.getElementById(monat);
      if (!collapseDiv) return;

      const isOpen = collapseDiv.style.maxHeight && collapseDiv.style.maxHeight !== "0px";

      // Alle Collapses schließen und Buttons deaktivieren
      buttons.forEach(btn => {
        const id = btn.textContent.trim();
        const div = document.getElementById(id);
        if (div) {
          div.style.maxHeight = null;
          div.style.padding = null;
          div.innerHTML = ''; // Inhalt entfernen, damit Cover nur geladen sind wenn offen
        }
        btn.classList.remove('active');
      });

      if (!isOpen) {
        // Collapse öffnen und Button aktivieren
        // Bilder für den Monat laden und anzeigen
        const coverUrls = monate[monat] || [];
        coverUrls.forEach(url => {
          const img = document.createElement('img');
          img.className = 'cover-img';
          img.src = url;
          img.alt = 'Buchcover';
          img.loading = 'lazy';
          collapseDiv.appendChild(img);
        });

        // Padding setzen
        collapseDiv.style.padding = "10px";

        // maxHeight nach Rendering anpassen
        requestAnimationFrame(() => {
          collapseDiv.style.maxHeight = collapseDiv.scrollHeight + "px";
        });

        button.classList.add('active');
      }
    });
  });
});
