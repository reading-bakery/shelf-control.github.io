document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1606522008&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row =>
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );
      const header = rows[0];
      const neuzugaengeIndex = header.indexOf('Monate');

      let summeMinuten = 0;
      for (let i = 1; i < rows.length; i++) {
        const minute = parseInt(rows[i][minutenIndex], 10);
        if (!isNaN(minute)) {
          summeMinuten += minute;
        }
      }

      const minutenContainer = document.getElementById('minuten-summe');
      if (minutenContainer) {
        minutenContainer.textContent = summeMinuten;
      }
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});
