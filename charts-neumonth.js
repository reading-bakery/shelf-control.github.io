Chart.register(ChartDataLabels);

let chartneumonth = null;
let activeIndexNeuzugaenge = null; 

document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=501012815&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row =>
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );
      const header = rows[0];  // <--- hier korrigiert

      const monthIndex = header.indexOf('Monat');
      const neumonthIndex = header.indexOf('Neuzugänge');

      const labels = [];
      const neumonthData = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        labels.push(row[monthIndex]);
        const neumonth = parseFloat(row[neumonthIndex]) || 0;
        neumonthData.push(neumonth);
      }

      const optionsSeiten = {
        responsive: true,
        interaction: false,
        onHover: (event) => {
          const points = chartneumonth.getElementsAtEventForMode(event.native, 'nearest', { intersect: true }, false);
          if (points.length) {
            activeIndexNeuzugaenge = points[0].index;
          } else {
            activeIndexNeuzugaenge = null;
          }
          chartneumonth.update('none');
        },
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            color: 'white',
            font: ctx => ({
              family: "'Dosis', sans-serif",
              weight: ctx.dataIndex === activeIndexNeuzugaenge ? 'bold' : 'normal',
              size: 13
            }),
            anchor: 'end',
            align: 'top',
            formatter: value => value,
            display: ctx => activeIndexNeuzugaenge === null || ctx.dataIndex === activeIndexNeuzugaenge
          }
        },
        scales: {
          y: {
            display: false,
            min: 0,
            max: 10,
            grid: { display: true },
            ticks: {
              display: true,
              font: { family: "'Dosis', sans-serif" }
            }
          },
          x: {
            ticks: {
              color: ctx => {
                if (activeIndexNeuzugaenge === null) return 'white';
                if (ctx.index === activeIndexNeuzugaenge) {
                  return '#9370DB';
                }
                return 'white';
              },
              maxRotation: 0,
              minRotation: 0,
              font: ctx => ({
                family: "'Dosis', sans-serif",
                size: 16,
                weight: ctx.index === activeIndexNeuzugaenge ? 'bold' : 'normal'
              })
            },
            grid: { display: false }
          }
        }
      };

      renderNeumonthChart('neumonthChart', '', labels, neumonthData, '#9370DB', optionsSeiten);
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

function renderNeumonthChart(canvasId, label, labels, data, color, options) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  if (chartneumonth) {
    chartneumonth.destroy();
  }

  chartneumonth = new Chart(ctx, {
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
        pointRadius: ctx => (ctx.dataIndex === activeIndexNeuzugaenge ? 8 : 5),
        pointHoverRadius: 10,
        hoverRadius: 9,
        hoverBackgroundColor: color
      }]
    },
    options: options,
    plugins: [ChartDataLabels]
  });
}
