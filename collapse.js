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

  const csvUrl =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv';

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
          monatName = 'Abgebrochen';
        } else {
          const monatNum = parseInt(monatRaw, 10);
          if (!isNaN(monatNum) && monatNum >= 1 && monatNum <= 12) {
            monatName = monthNames[monatNum.toString()];
          } else {
            continue;
          }
        }

        const coverUrl = row[1]?.trim();
        if (!coverUrl) continue;

        monate[monatName].push(coverUrl);
      }

      // Bilder vorladen für schnellere Anzeige
      Object.values(monate)
        .flat()
        .forEach(url => {
          const img = new Image();
          img.src = url;
        });

      // --- Event-Listener nur einmal ---
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const monat = button.textContent.trim();
          const collapseDiv = document.getElementById(monat);
          if (!collapseDiv) return;

          const isOpen =
            collapseDiv.style.maxHeight &&
            collapseDiv.style.maxHeight !== '0px';

          // Alle Collapses schließen und Buttons deaktivieren
          buttons.forEach(btn => {
            const id = btn.textContent.trim();
            const div = document.getElementById(id);
            if (div) {
              div.style.maxHeight = null;
              div.style.padding = null;
              div.innerHTML = '';
            }
            btn.classList.remove('active');
          });

          if (!isOpen) {
            // Collapse öffnen und Button aktivieren
            const coverUrls = monate[monat] || [];

            coverUrls.forEach(url => {
              const img = document.createElement('img');
              img.className = 'cover-img';
              img.src = url;
              img.alt = 'Buchcover';
              img.loading = 'lazy';

              // Finde die passende Zeile im CSV für das Cover
              const row = data.find(r => r[1]?.trim() === url);
              let sterne = 0;
              if (row && row[18]) {
                // Spalte S = Index 18
                sterne = parseFloat(row[18].replace(',', '.'));
              }

              // Rundung auf halbe Schritte
              const rounded = Math.round(sterne * 2) / 2;

              // SVG-Sterne generieren (nur volle + evtl. halber)
              const sterneDiv = document.createElement('div');
              sterneDiv.className = 'sterne-bewertung';
              let sterneHtml = '';

              // Volle Sterne
              const volle = Math.floor(rounded);
              for (let s = 0; s < volle; s++) {
                sterneHtml += `<svg width="14" height="14" viewBox="0 0 24 24" fill="gold" style="vertical-align:middle;"><polygon points="12,2 15,8.5 22,9.3 17,14.1 18.5,21 12,17.8 5.5,21 7,14.1 2,9.3 9,8.5"/></svg>`;
              }

              // Halber Stern
              if (rounded % 1 !== 0) {
                sterneHtml += `<svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle;">
                  <defs>
                    <linearGradient id="half-grad-${url.replace(/\W/g, '')}" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="50%" stop-color="gold"/>
                      <stop offset="50%" stop-color="#353434ff"/>
                    </linearGradient>
                  </defs>
                  <polygon points="12,2 15,8.5 22,9.3 17,14.1 18.5,21 12,17.8 5.5,21 7,14.1 2,9.3 9,8.5"
                    fill="url(#half-grad-${url.replace(/\W/g, '')})"/>
                </svg>`;
              }

              // Bewertung als Text daneben
              const display = Number.isFinite(rounded)
                ? rounded.toString().replace('.', ',')
                : '–';
              sterneHtml += `<span style="margin-left:1px;font-size:0.0rem;color:#ee;">${display}</span>`;

              sterneDiv.innerHTML = sterneHtml;

            // --- NEU: Lesezeit in Tagen ---
            const tageDiv = document.createElement('div');
            tageDiv.className = 'lesedauer';
            tageDiv.style.fontSize = '0.8rem';
            if (row && row[15]) {
              const tage = parseInt(row[15], 10);
              if (!isNaN(tage)) {
                tageDiv.textContent = tage === 1 ? '1 Tag' : `${tage} Tage`;
              } else {
                tageDiv.textContent = '–';
              }
            } else {
              tageDiv.textContent = '–';
            }

              // Container für Bild und Bewertung
              const coverContainer = document.createElement('div');
              coverContainer.className = 'cover-container';
              coverContainer.appendChild(img);
              coverContainer.appendChild(sterneDiv);
              coverContainer.appendChild(tageDiv);

              collapseDiv.appendChild(coverContainer);
            });

            collapseDiv.style.padding = '10px';
            collapseDiv.style.maxHeight = collapseDiv.scrollHeight + 'px'; // passt sich dynamisch an
            button.classList.add('active');
          }
        });
      });
      // --- Ende ---
    })
    .catch(error => {
      console.error('Fehler beim Laden der CSV:', error);
    });
});
