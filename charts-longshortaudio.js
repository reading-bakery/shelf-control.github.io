(() => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv';

  async function fetchAndRenderLongShortAudio() {
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error('Netzwerkfehler beim Laden der CSV');
      const csvText = await response.text();

      const rows = csvText.trim().split('\n').map(line => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
      const header = rows[0];
      const dataRows = rows.slice(1);

      const coverIdx = header.indexOf('Cover');
      const titelIdx = header.indexOf('Titel');
      const minutenIdx = header.indexOf('Minuten total');

      const validBooks = dataRows
        .map(row => ({
          cover: row[coverIdx]?.trim(),
          titel: row[titelIdx]?.trim(),
          minuten: Number(row[minutenIdx]?.replace(',', '.'))
        }))
        .filter(book =>
          book.cover && book.cover !== '' &&
          book.titel && book.titel !== '' &&
          !isNaN(book.minuten) && book.minuten > 0
        );

      const container = document.querySelector('#longshort-container-audio');
      if (!container) {
        console.error('Container #longshort-container-audio nicht gefunden');
        return;
      }

      if (validBooks.length < 2) {
        container.innerHTML = `<p class="longshort-error-unique">Nicht genügend Hörbücher mit gültigem Cover und Minutenanzahl.</p>`;
        return;
      }

      const shortest = validBooks.reduce((min, b) => b.minuten < min.minuten ? b : min, validBooks[0]);
      const longest = validBooks.reduce((max, b) => b.minuten > max.minuten ? b : max, validBooks[0]);

      container.innerHTML = `
        <h3 class="longshort-heading-unique">Gehörte Bücher</h3>
        <div class="longshort-wrapper-unique">
          <div class="longshort-book-unique">
            <img class="longshort-cover-unique" src="${shortest.cover}" alt="Cover ${shortest.titel}" />
            <p class="longshort-title-unique">
              ${shortest.titel}<br>${shortest.minuten} Minuten
            </p>
          </div>
          <div class="longshort-book-unique">
            <img class="longshort-cover-unique" src="${longest.cover}" alt="Cover ${longest.titel}" />
            <p class="longshort-title-unique">
              ${longest.titel}<br>${longest.minuten} Minuten
            </p>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Fehler beim Laden oder Verarbeiten:', error);
    }
  }

  document.addEventListener('DOMContentLoaded', fetchAndRenderLongShortAudio);
})();
