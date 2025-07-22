Chart.register(window['chartjs-plugin-annotation']);
Chart.register(ChartDataLabels);

document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=501012815&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row =>
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );
      const header = rows[0];

      const monthIndex = header.indexOf('Monat');
      const ausgabenIndex = header.indexOf('Ausgaben');
      const subIndex = header.indexOf('SuB');
      const neuzugaengeIndex = header.indexOf('Neuzugänge');

      const labels = [];
      const ausgabenData = [];
      const subData = [];

      let summeAusgaben = 0;
      let summeNeuzugaenge = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        labels.push(row[monthIndex]);

        const ausgabe = parseFloat(row[ausgabenIndex]) || 0;
        ausgabenData.push(ausgabe);
        summeAusgaben += ausgabe;

        const sub = parseFloat(row[subIndex]) || 0;
        subData.push(sub);

        const neuzugang = parseInt(row[neuzugaengeIndex], 10);
        if (!isNaN(neuzugang)) {
          summeNeuzugaenge += neuzugang;
        }
      }

      const summeContainer = document.getElementById('ausgaben-summe');
      if (summeContainer) {
        summeContainer.textContent = summeAusgaben.toFixed(2) + ' €';
      }

      const neuzugaengeContainer = document.getElementById('neuzugaenge-summe');
      if (neuzugaengeContainer) {
        neuzugaengeContainer.textContent = summeNeuzugaenge;
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
        min: canvasId === 'subChart' ? 110 : 0,
        max: canvasId === 'subChart' ? 150 : undefined,
        ticks: {
          stepSize: 50,
          color: 'white'
        }
      },
      x: {
        ticks: {
          color: 'white',
          maxRotation: 0,
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
      datalabels: {
        color: 'white',
        font: {
          weight: 'normal',
          size: 8
        },
        anchor: 'end',
        align: 'top',
        formatter: function(value) {
          return value;
        }
      },
      annotation: canvasId === 'subChart' ? {
        annotations: {
          line1: {
            type: 'line',
            yMin: 120,
            yMax: 120,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              content: 'SuB-Ziel = 120',
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
    options: options,
    plugins: [ChartDataLabels]
  });
}
