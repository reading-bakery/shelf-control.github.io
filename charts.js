Chart.register(window['chartjs-plugin-annotation']);

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

      let summeAusgaben = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        labels.push(row[monthIndex]);
        const ausgabe = parseFloat(row[ausgabenIndex]) || 0;
        ausgabenData.push(ausgabe);
        summeAusgaben += ausgabe;
        subData.push(parseFloat(row[subIndex]) || 0);
      }

      // Summe formatieren und ins HTML einfügen
      const summeContainer = document.getElementById('ausgaben-summe');
      if (summeContainer) {
        summeContainer.textContent = summeAusgaben.toFixed(2) + ' €';
      }

      renderChart('ausgabenChart', 'Ausgaben (€)', labels, ausgabenData, 'rgba(255, 206, 86, 0.7)');
      renderChart('subChart', '2025', labels, subData, 'rgba(54, 162, 235, 0.7)');
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

function renderChart(canvasId, label, labels, data, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
        min: canvasId === 'subChart' ? 90 : 0,
        max: canvasId === 'subChart' ? 150 : undefined,
        ticks: {
          stepSize: 10,
          color: 'white'
        }
      },
      x: {
        ticks: {
          color: 'white',
          maxRotation: 0,   // verhindert schrägstellen der Labels
          minRotation: 0
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white'
        }
      },
      annotation: canvasId === 'subChart' ? {
        annotations: {
          line1: {
            type: 'line',
            yMin: 100,
            yMax: 100,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              content: 'SuB-Ziel = 100',
              enabled: true,
              position: 'start',
              color: 'red',
              font: {
                size: 12,
                weight: 'normal'
              },
              xAdjust: -10,
              yAdjust: 0
            }
          }
        }
      } : {}
    }
  };

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        backgroundColor: color,
        borderColor: color.replace('0.7', '1'),
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }]
    },
    options: options
  });
}
