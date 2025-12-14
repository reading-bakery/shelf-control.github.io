document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=158437862&single=true&output=csv';

  const container = document.querySelector('body'); // Hauptcontainer, kann angepasst werden

  fetch(csvUrl)
    .then(res => res.ok ? res.text() : Promise.reject('CSV konnte nicht geladen werden'))
    .then(csvText => {
      const results = Papa.parse(csvText, { header: true });
      const data = results.data;

      const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

      // Daten nach Jahr und Monat gruppieren
      const jahre = {};
      data.forEach(row => {
        const jahr = row['Jahr']?.trim();
        const monatNum = parseInt(row['Monat'], 10);
        const cover = row['Cover']?.trim();
        const sterneRaw = row['Sterne']?.trim();
        if (!jahr || isNaN(monatNum) || !cover) return;

        const monatName = monthNames[monatNum - 1];
        if (!jahre[jahr]) jahre[jahr] = {};
        if (!jahre[jahr][monatName]) jahre[jahr][monatName] = [];

        const sterne = sterneRaw ? parseFloat(sterneRaw.replace(',', '.')) : 0;
        jahre[jahr][monatName].push({ cover, sterne });
      });

      // Vorladen der Bilder
      Object.values(jahre).forEach(monatsObj => {
        Object.values(monatsObj).flat().forEach(item => {
          const img = new Image();
          img.src = item.cover;
        });
      });

      // Jahres-Container erzeugen
      Object.keys(jahre).sort((a,b) => b-a).forEach(jahr => {
        const jahrDiv = document.createElement('div');
        jahrDiv.className = 'lesejahr-archiv';

        const h3 = document.createElement('h3');
        h3.textContent = jahr;
        jahrDiv.appendChild(h3);

        const monateObj = jahre[jahr];

        // Monate erzeugen
        Object.keys(monateObj).forEach(monat => {
          const monatBlock = document.createElement('div');
          monatBlock.className = 'monat-block';

          const monatButton = document.createElement('button');
          monatButton.textContent = monat;
          monatButton.className = 'monat-btn';
          monatBlock.appendChild(monatButton);

          const collapseDiv = document.createElement('div');
          collapseDiv.className = 'collapse';
          monatBlock.appendChild(collapseDiv);

          const coverInfos = monateObj[monat];

          // Collapse-Event
          monatButton.addEventListener('click', () => {
            const isOpen = collapseDiv.classList.contains('show');

            // Alle anderen Collapses innerhalb des Jahres schließen
            jahrDiv.querySelectorAll('.collapse').forEach(div => {
              div.classList.remove('show');
              div.innerHTML = '';
            });
            jahrDiv.querySelectorAll('.monat-btn').forEach(btn => btn.classList.remove('active'));

            if (!isOpen) {
              coverInfos.forEach(item => {
                const img = document.createElement('img');
                img.src = item.cover;
                img.alt = 'Buchcover';
                img.className = 'cover-img';
                img.loading = 'lazy';

                const sterneDiv = document.createElement('div');
                sterneDiv.className = 'sterne-bewertung';
                let sterneHtml = '';
                const rounded = Math.round(item.sterne * 2) / 2;
                const volle = Math.floor(rounded);

                for (let s = 0; s < volle; s++) {
                  sterneHtml += `<svg width="14" height="14" viewBox="0 0 24 24" fill="gold"><polygon points="12,2 15,8.5 22,9.3 17,14.1 18.5,21 12,17.8 5.5,21 7,14.1 2,9.3 9,8.5"/></svg>`;
                }

                if (rounded % 1 !== 0) {
                  sterneHtml += `<svg width="14" height="14" viewBox="0 0 24 24">
                      <defs>
                          <linearGradient id="half-grad-${item.cover.replace(/\W/g,'')}" x1="0" x2="1" y1="0" y2="0">
                              <stop offset="50%" stop-color="gold"/>
                              <stop offset="50%" stop-color="#353434ff"/>
                          </linearGradient>
                      </defs>
                      <polygon points="12,2 15,8.5 22,9.3 17,14.1 18.5,21 12,17.8 5.5,21 7,14.1 2,9.3 9,8.5"
                          fill="url(#half-grad-${item.cover.replace(/\W/g,'')})"/>
                  </svg>`;
                }

                sterneDiv.innerHTML = sterneHtml;

                const coverContainer = document.createElement('div');
                coverContainer.className = 'cover-container';
                coverContainer.appendChild(img);
                coverContainer.appendChild(sterneDiv);

                collapseDiv.appendChild(coverContainer);
              });

              collapseDiv.classList.add('show');
              monatButton.classList.add('active');
            }
          });

          jahrDiv.appendChild(monatBlock);
        });

        container.appendChild(jahrDiv);
      });
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});
