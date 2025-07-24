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

      const labels = [];
      const ausgabenData = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        labels.push(row[monthIndex]);

        const ausgabe = parseFloat(row[ausgabenIndex]) || 0;
        ausgabenData.push(ausgabe);
      }

      const optionsAusgaben = {
        responsive: true,
        interaction: {
          mode: 'nearest',
          intersect: true
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            color: 'white',
            font: {
              family: "'Dosis', sans-serif",
              weight: 'normal',
              size: 13
            },
            anchor: 'center',
            align: 'top',
            padding: { top: 6 },
            formatter: value => value
          }
        },
        scales: {
          y: {
            min: 0,
            max: 130,
            beginAtZero: true,
            ticks: {
              stepSize: 10,
              display: true,
              font: { family: "'Dosis', sans-serif" },
              color: 'white'
            },
            grid: { display: true }
          },
          x: {
            ticks: {
              color: 'white',
              maxRotation: 0,
              minRotation: 0,
              font: { family: "'Dosis', sans-serif", size: 16 }
            },
            grid: { display: false }
          }
        }
      };

      renderAusgabenChart('ausgabenChart', '', labels, ausgabenData, '#63b8ff', optionsAusgaben);
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

let chartAusgaben = null;

function renderAusgabenChart(canvasId, label, labels, data, color, options) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  if (chartAusgaben) {
    chartAusgaben.destroy();
  }

  chartAusgaben = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 10,
        hoverRadius: 9,
        hoverBackgroundColor: color
      }]
    },
    options: options,
    plugins: [ChartDataLabels]
  });
}
