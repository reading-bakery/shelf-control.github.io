Chart.register(ChartDataLabels);

document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1600444641&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row =>
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );
      const header = rows[0];

      const monthIndex = header.indexOf('Monat');
      const seitenmonthIndex = header.indexOf('Anzahl');

      const labels = [];
      const seitenmonthData = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        labels.push(row[monthIndex]);
        const seitenmonth = parseFloat(row[seitenmonthIndex]) || 0;
        seitenmonthData.push(seitenmonth);
      }

      const optionsSeiten = {
        responsive: true,
        interaction: { mode: 'nearest', intersect: true },
        hover: { mode: 'nearest', intersect: true },
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
            anchor: 'end',
            align: 'top',
            formatter: value => value
          }
        },
        scales: {
          y: {
            display: false,
            min: 0,
            max: 3500,
            grid: { display: true },
            ticks: {
              display: true,
              font: { family: "'Dosis', sans-serif" }
            }
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

      renderSeitenmonthChart('seitenmonthChart', '', labels, seitenmonthData, '#9370DB', optionsSeiten);
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

let chartSeitenmonth = null;

function renderSeitenmonthChart(canvasId, label, labels, data, color, options) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  if (chartSeitenmonth) {
    chartSeitenmonth.destroy();
  }

  chartSeitenmonth = new Chart(ctx, {
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
