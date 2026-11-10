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

      let totalBooks2026 = 0;
      let totalStars2026 = 0;
      let starCount2026 = 0;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 20) continue;

        const fazitRaw = row[19]?.trim();
        const fazit = fazitRaw ? fazitRaw.toLowerCase() : '';
        const monatRaw = row[16]?.trim();
        const coverUrl = row[1]?.trim();
        if (!coverUrl) continue;

        let monatName = null;
        let isValid = false;

        if (fazit === 'abgebrochen') {
          monatName = 'Abgebrochen';
          isValid = true;
        } else {
          const monatNum = parseInt(monatRaw, 10);
          if (!isNaN(monatNum) && monatNum >= 1 && monatNum <= 12) {
            monatName = monthNames[monatNum.toString()];
            isValid = true;
          }
        }

        if (isValid) {
          monate[monatName].push(coverUrl);
          totalBooks2026++;

          const sterneRaw = row[18]?.trim();
          if (sterneRaw) {
            const sterne = parseFloat(sterneRaw.replace(',', '.'));
            if (!isNaN(sterne) && sterne > 0) {
              totalStars2026 += sterne;
              starCount2026++;
            }
          }
        }
      }

      // Statistiken für 2026 in den HTML-Header einfügen
      const avgStars2026 = starCount2026 > 0 ? (totalStars2026 / starCount2026).toFixed(2).replace('.', ',') : '–';
      const container2026 = document.getElementById('jahr-2026-container');
      if (container2026) {
        const statsDiv = document.createElement('div');
        statsDiv.classList.add('jahr-stats');
        statsDiv.innerHTML = `
          <span class="stat-badge">📚 ${totalBooks2026} ${totalBooks2026 === 1 ? 'Buch' : 'Bücher'}</span>
          <span class="stat-badge">⭐ ${avgStars2026}</span>
        `;
        container2026.appendChild(statsDiv);
      }

      // Bilder vorladen
      Object.values(monate)
        .flat()
        .forEach(url => {
          const img = new Image();
          img.src = url;
        });

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const monat = button.textContent.trim();
          const collapseDiv = document.getElementById(monat);
          if (!collapseDiv) return;

          const isOpen =
            collapseDiv.style.maxHeight &&
            collapseDiv.style.maxHeight !== '0px';

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
            const coverUrls = monate[monat] || [];

            coverUrls.forEach(url => {
              const img = document.createElement('img');
              img.className = 'cover-img';
              img.src = url;
              img.alt = 'Buchcover';
              img.loading = 'lazy';

              const row = data.find(r => r[1]?.trim() === url);
              let sterne = 0;
              if (row && row[18]) {
                sterne = parseFloat(row[18].replace(',', '.'));
              }

              const rounded = Math.round(sterne * 2) / 2;

              const sterneDiv = document.createElement('div');
              sterneDiv.className = 'sterne-bewertung';
              let sterneHtml = '';

              const volle = Math.floor(rounded);
              for (let s = 0; s < volle; s++) {
                sterneHtml += `<svg width="14" height="14" viewBox="0 0 24 24" fill="gold" style="vertical-align:middle;"><polygon points="12,2 15,8.5 22,9.3 17,14.1 18.5,21 12,17.8 5.5,21 7,14.1 2,9.3 9,8.5"/></svg>`;
              }

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

              const display = Number.isFinite(rounded)
                ? rounded.toString().replace('.', ',')
                : '–';
              sterneHtml += `<span style="margin-left:1px;font-size:0.0rem;color:#ee;">${display}</span>`;

              sterneDiv.innerHTML = sterneHtml;

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

              const coverContainer = document.createElement('div');
              coverContainer.className = 'cover-container';
              coverContainer.appendChild(img);
              coverContainer.appendChild(sterneDiv);
              coverContainer.appendChild(tageDiv);

              collapseDiv.appendChild(coverContainer);
            });

            collapseDiv.style.padding = '10px';
            collapseDiv.style.maxHeight = collapseDiv.scrollHeight + 'px';
            button.classList.add('active');
          }
        });
      });
    })
    .catch(error => {
      console.error('Fehler beim Laden der CSV:', error);
    });
});