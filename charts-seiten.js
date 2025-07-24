document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1600444641&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').slice(1); // Erste Zeile ist Header
      let summe = 0;

      rows.forEach(row => {
        const columns = row.split(',');
        const value = parseInt(columns[1], 10);
        if (!isNaN(value)) {
          summe += value;
        }
      });

      const container = document.getElementById('seiten-summe');
      container.textContent = `${summe.toLocaleString()}`;
    })
    .catch(error => {
      console.error('Fehler beim Laden der CSV:', error);
    });
});
