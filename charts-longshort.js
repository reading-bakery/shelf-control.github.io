(() => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv';

  async function fetchAndRenderLongShort() {
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error('Netzwerkfehler beim Laden der CSV');
      const csvText = await response.text();

      const rows = csvText.trim().split('\n').map(line => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
      const header = rows[0];
      const dataRows = rows.slice(1);

      const coverIdx = header.indexOf('Cover');
      const titelIdx = header.indexOf('Titel');
      const seitenIdx = header.indexOf('Seitenzahl total');

      const validBooks = dataRows
        .map(row => ({
          cover: row[coverIdx]?.trim(),
          titel: row[titelIdx]?.trim(),
          seiten: Number(row[seitenIdx]?.replace(',', '.'))
        }))
        .filter(book =>
          book.cover && book.cover !== '' &&
          book.titel && book.titel !== '' &&
          !isNaN(book.seiten) && book.seiten > 0
        );

      const container = document.querySelector('#longshort-container-unique');
      if (!container) {
        console.error('Container #longshort-container-unique nicht gefunden');
        return;
      }

      if (validBooks.length < 2) {
        container.innerHTML = `<p class="longshort-error-unique">Nicht genügend Bücher mit gültigem Cover und Seitenzahl.</p>`;
        return;
      }

      const shortest = validBooks.reduce((min, b) => b.seiten < min.seiten ? b : min, validBooks[0]);
      const longest = validBooks.reduce((max, b) => b.seiten > max.seiten ? b : max, validBooks[0]);

      container.innerHTML = `
        <h3 style="font-family: Dosis, sans-serif; color: white;">Kürzestes vs. Längstes Buch</h3>
        <div class="longshort-wrapper-unique">
          <div class="longshort-book-unique">
            <img class="longshort-cover-unique" src="${shortest.cover}" alt="Cover ${shortest.titel}" />
            <p class="longshort-title-unique" style="font-family: Dosis, sans-serif; color: white; font-size: 1rem;">
              ${shortest.titel}<br>${shortest.seiten} Seiten
            </p>
          </div>
          <div class="longshort-book-unique">
            <img class="longshort-cover-unique" src="${longest.cover}" alt="Cover ${longest.titel}" />
            <p class="longshort-title-unique" style="font-family: Dosis, sans-serif; color: white; font-size: 1rem;">
              ${longest.titel}<br>${longest.seiten} Seiten
            </p>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Fehler beim Laden oder Verarbeiten:', error);
    }
  }

  document.addEventListener('DOMContentLoaded', fetchAndRenderLongShort);
})();
