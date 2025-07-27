Chart.register(ChartDataLabels);

let chartAveragemonth = null;
let activeIndexAverage = null; // Hover-Index für Averagemonth-Chart

document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1697607939&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row =>
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );
      const header = rows[0];

      const monthIndex = header.indexOf('Monat');
      const averagemonthIndex = header.indexOf('Schnitt');

      const labels = [];
      const averagemonthData = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        labels.push(row[monthIndex]);
        const averagemonth = parseFloat(row[averagemonthIndex]) || 0;
        averagemonthData.push(averagemonth);
      }

      const optionsAverage = {
        responsive: true,
        interaction: false, // eigenes Hover-Handling
        onHover: (event) => {
          const xAxis = chartAveragemonth.scales.x;
          const yAxis = chartAveragemonth.scales.y;
          const x = event.offsetX;
          const y = event.offsetY;

          const index = Math.round(xAxis.getValueForPixel(x));
          if (
            index >= 0 && index < labels.length &&
            y > yAxis.bottom && y < yAxis.bottom + 30 // grob unter X-Achse
          ) {
            activeIndexAverage = index;
          } else {
            const elements = chartAveragemonth.getElementsAtEventForMode(event, 'nearest', {intersect: true}, false);
            if (elements.length > 0) {
              activeIndexAverage = elements[0].index;
            } else {
              activeIndexAverage = null;
            }
          }
          chartAveragemonth.update('none');
        },
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            color: 'white',
            font: ctx => ({
              family: "'Dosis', sans-serif",
              weight: ctx.dataIndex === activeIndexAverage ? 'bold' : 'normal',
              size: 13
            }),
            anchor: 'end',
            align: 'top',
            formatter: value => value,
            display: ctx => activeIndexAverage === null || ctx.dataIndex === activeIndexAverage
          }
        },
        scales: {
          y: {
            display: false,
            min: 0,
            max: 18,
            grid: { display: true },
            ticks: {
              display: true,
              font: { family: "'Dosis', sans-serif" }
            }
          },
          x: {
            ticks: {
              color: ctx => ctx.index === activeIndexAverage ? '#3CB371' : 'white',
              maxRotation: 0,
              minRotation: 0,
              font: ctx => ({
                family: "'Dosis', sans-serif",
                size: 16,
                weight: ctx.index === activeIndexAverage ? 'bold' : 'normal'
              })
            },
            grid: { display: false }
          }
        }
      };

      renderAveragemonthChart('averagemonthChart', '', labels, averagemonthData, '#3CB371', optionsAverage);
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

function renderAveragemonthChart(canvasId, label, labels, data, color, options) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  if (chartAveragemonth) {
    chartAveragemonth.destroy();
  }

  chartAveragemonth = new Chart(ctx, {
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
        pointRadius: ctx => (ctx.dataIndex === activeIndexAverage ? 8 : 5),
        pointHoverRadius: 10,
        hoverRadius: 9,
        hoverBackgroundColor: color
      }]
    },
    options: options,
    plugins: [ChartDataLabels]
  });
}
