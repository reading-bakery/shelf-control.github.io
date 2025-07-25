Chart.register(ChartDataLabels);

const lineColor = '#63b8ff';
let chartAusgaben = null;
let activeIndexAusgabe = null;

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
        interaction: false,
        onHover: (event) => {
          if (!chartAusgaben) return;
          const xAxis = chartAusgaben.scales.x;
          const yAxis = chartAusgaben.scales.y;
          const x = event.offsetX;
          const y = event.offsetY;

          const index = Math.round(xAxis.getValueForPixel(x));
          if (
            index >= 0 && index < labels.length &&
            y > yAxis.bottom && y < yAxis.bottom + 30
          ) {
            activeIndexAusgabe = index;
          } else {
            const elements = chartAusgaben.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            if (elements.length > 0) {
              activeIndexAusgabe = elements[0].index;
            } else {
              activeIndexAusgabe = null;
            }
          }
          chartAusgaben.update('none');
        },
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            color: 'white',
            font: ctx => ({
              family: "'Dosis', sans-serif",
              weight: ctx.dataIndex === activeIndexAusgabe ? 'bold' : 'normal',
              size: 13
            }),
            anchor: 'end',
            align: 'top',
            formatter: value => value,
            display: ctx => activeIndexAusgabe === null || ctx.dataIndex === activeIndexAusgabe
          }
        },
        scales: {
          y: {
            display: false,
            min: 0,
            max: 130,
            grid: { display: true },
            ticks: {
              display: true,
              font: { family: "'Dosis', sans-serif" }
            }
          },
          x: {
            ticks: {
              color: ctx => (ctx.index === activeIndexAusgabe ? lineColor : 'white'),
              maxRotation: 0,
              minRotation: 0,
              font: ctx => ({
                family: "'Dosis', sans-serif",
                size: 16,
                weight: ctx.index === activeIndexAusgabe ? 'bold' : 'normal'
              })
            },
            grid: { display: false }
          }
        }
      };

      renderAusgabenChart('ausgabenChart', '', labels, ausgabenData, lineColor, optionsAusgaben);
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

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
        pointRadius: ctx => (ctx.dataIndex === activeIndexAusgabe ? 8 : 5),
        pointHoverRadius: 10
      }]
    },
    options: options,
    plugins: [ChartDataLabels]
  });
}
