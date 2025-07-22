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
      const subIndex = header.indexOf('SuB');

      const labels = [];
      const subData = [];

      for (let i = 1; i < rows.length; i++) {
        labels.push(rows[i][monthIndex]);
        const subValue = parseFloat(rows[i][subIndex]) || 0;
        subData.push(subValue);
      }

      renderSubChart('subChart', 'Sub-Abbau', labels, subData, 'rgba(54, 162, 235, 0.7)');
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

function renderSubChart(canvasId, label, labels, data, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
        min: 110,
        max: 150,
        ticks: {
          stepSize: 10,
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
        formatter: value => value
      },
      annotation: {
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
      }
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
        borderColor: color,
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }]
    },
    options: options,
    plugins: [ChartDataLabels]
  });
}
