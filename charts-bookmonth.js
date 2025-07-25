Chart.register(ChartDataLabels);

let chartBookmonth = null;
let activeIndexBook = null; // Hover-Index für Bookmonth-Chart
const lineColor = '#3CB371'; // Linienfarbe

document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=583035260&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row =>
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );
      const header = rows[0];

      const monthIndex = header.indexOf('Monat');
      const bookmonthIndex = header.indexOf('Anzahl');

      const labels = [];
      const bookmonthData = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        labels.push(row[monthIndex]);
        const bookmonth = parseFloat(row[bookmonthIndex]) || 0;
        bookmonthData.push(bookmonth);
      }

      const optionsBook = {
        responsive: true,
        interaction: false, // eigenes Hover-Handling
        onHover: (event) => {
          if (!chartBookmonth) return;
          const xAxis = chartBookmonth.scales.x;
          const yAxis = chartBookmonth.scales.y;
          const x = event.offsetX;
          const y = event.offsetY;

          const index = Math.round(xAxis.getValueForPixel(x));
          if (
            index >= 0 && index < labels.length &&
            y > yAxis.bottom && y < yAxis.bottom + 30 // grob unter X-Achse
          ) {
            activeIndexBook = index;
          } else {
            const elements = chartBookmonth.getElementsAtEventForMode(event, 'nearest', {intersect: true}, false);
            if (elements.length > 0) {
              activeIndexBook = elements[0].index;
            } else {
              activeIndexBook = null;
            }
          }
          chartBookmonth.update('none');
        },
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            color: 'white',
            font: ctx => ({
              family: "'Dosis', sans-serif",
              weight: ctx.dataIndex === activeIndexBook ? 'bold' : 'normal',
              size: 13
            }),
            anchor: 'end',
            align: 'top',
            formatter: value => value,
            display: ctx => activeIndexBook === null || ctx.dataIndex === activeIndexBook
          }
        },
        scales: {
          y: {
            display: false,
            min: 0,
            max: 13,
            grid: { display: true },
            ticks: {
              display: true,
              font: { family: "'Dosis', sans-serif" }
            }
          },
          x: {
            ticks: {
              color: ctx => (ctx.index === activeIndexBook ? lineColor : 'white'),
              maxRotation: 0,
              minRotation: 0,
              font: ctx => ({
                family: "'Dosis', sans-serif",
                size: 16,
                weight: ctx.index === activeIndexBook ? 'bold' : 'normal'
              })
            },
            grid: { display: false }
          }
        }
      };

      renderBookmonthChart('bookmonthChart', '', labels, bookmonthData, lineColor, optionsBook);
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

function renderBookmonthChart(canvasId, label, labels, data, color, options) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  if (chartBookmonth) {
    chartBookmonth.destroy();
  }

  chartBookmonth = new Chart(ctx, {
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
        pointRadius: ctx => (ctx.dataIndex === activeIndexBook ? 8 : 5),
        pointHoverRadius: 10,
        hoverRadius: 9,
        hoverBackgroundColor: color
      }]
    },
    options: options,
    plugins: [ChartDataLabels]
  });
}
