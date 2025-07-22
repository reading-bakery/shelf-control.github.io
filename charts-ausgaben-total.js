document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=501012815&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row =>
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );
      const header = rows[0];
      const ausgabenIndex = header.indexOf('Ausgaben');

      let summeAusgaben = 0;
      for (let i = 1; i < rows.length; i++) {
        const ausgabe = parseFloat(rows[i][ausgabenIndex]) || 0;
        summeAusgaben += ausgabe;
      }

      const summeContainer = document.getElementById('ausgaben-summe');
      if (summeContainer) {
        summeContainer.textContent = Math.round(summeAusgaben) + ' €';
      }
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});
