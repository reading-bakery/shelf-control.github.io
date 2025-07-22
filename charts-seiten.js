document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row => row.split(','));
      const header = rows[0];
      const seitenIndex = header.indexOf('Seitenzahl total');
      if (seitenIndex === -1) {
        console.error('Spalte "Seitenzahl total" nicht gefunden.');
        return;
      }

      let summeSeiten = 0;
      for (let i = 1; i < rows.length; i++) {
        const wert = parseInt(rows[i][seitenIndex], 10);
        if (!isNaN(wert) && wert > 0) {
          summeSeiten += wert;
        }
      }

      const summeDiv = document.getElementById('seiten-summe');
      if (summeDiv) {
        summeDiv.textContent = `${summeSeiten}`;
      }
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});
