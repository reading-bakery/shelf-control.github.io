document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=501012815&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row => row.split(','));
      const header = rows[0];
      const monthIndex = header.indexOf('Monat');
      const ausgabenIndex = header.indexOf('Ausgaben');
      const subIndex = header.indexOf('SuB');

      const labels = [];
      const ausgabenData = [];
      const subData = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        labels.push(row[monthIndex]);
        ausgabenData.push(parseFloat(row[ausgabenIndex]) || 0);
        subData.push(parseFloat(row[subIndex]) || 0);
      }

      renderChart('ausgabenChart', 'Ausgaben (€)', labels, ausgabenData, 'rgba(255, 206, 86, 0.7)');
      renderChart('subChart', 'SuB-Höhe', labels, subData, 'rgba(54, 162, 235, 0.7)');
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

function renderChart(canvasId, label, labels, data, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        backgroundColor: color,
        borderColor: color.replace('0.7', '1'),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'white'
          }
        },
        x: {
          ticks: {
            color: 'white'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'white'
          }
        }
      }
    }
  });
}
