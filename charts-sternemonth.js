Chart.register(ChartDataLabels);

let chartSternemonth = null;
let activeIndexSterne = null; // Hover-Index für Sternemonth-Chart

document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=423893646&single=true&output=tsv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row =>
        row.split('\t').map(cell => cell.trim())
      );
      const header = rows[0];

      const monthIndex = header.indexOf('Monat');
      const sternemonthIndex = header.indexOf('Sterne');

      const labels = [];
      const sternemonthData = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        labels.push(row[monthIndex]);
        const sternemonth = parseFloat(row[sternemonthIndex].replace(',', '.')) || 0;
        sternemonthData.push(sternemonth);
      }

      const optionsSterne = {
        responsive: true,
        interaction: false, // eigenes Hover-Handling
        onHover: (event) => {
          const xAxis = chartSternemonth.scales.x;
          const yAxis = chartSternemonth.scales.y;
          const x = event.offsetX;
          const y = event.offsetY;

          const index = Math.round(xAxis.getValueForPixel(x));
          if (
            index >= 0 && index < labels.length &&
            y > yAxis.bottom && y < yAxis.bottom + 30 // grob unter X-Achse
          ) {
            activeIndexSterne = index;
          } else {
            const elements = chartSternemonth.getElementsAtEventForMode(event, 'nearest', {intersect: true}, false);
            if (elements.length > 0) {
              activeIndexSterne = elements[0].index;
            } else {
              activeIndexSterne = null;
            }
          }
          chartSternemonth.update('none');
        },
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            color: 'white',
            font: ctx => ({
              family: "'Dosis', sans-serif",
              weight: ctx.dataIndex === activeIndexSterne ? 'bold' : 'normal',
              size: 13
            }),
            anchor: 'end',
            align: 'top',
            formatter: value => (Math.round(value * 10) / 10).toFixed(1),
            display: ctx => activeIndexSterne === null || ctx.dataIndex === activeIndexSterne
          }
        },
        scales: {
          y: {
            display: false,
            min: 0,
            max: 7,
            grid: { display: true },
            ticks: {
              display: true,
              font: { family: "'Dosis', sans-serif" }
            }
          },
          x: {
            ticks: {
              color: ctx => ctx.index === activeIndexSterne ? '#3CB371' : 'white',
              maxRotation: 0,
              minRotation: 0,
              font: ctx => ({
                family: "'Dosis', sans-serif",
                size: 16,
                weight: ctx.index === activeIndexSterne ? 'bold' : 'normal'
              })
            },
            grid: { display: false }
          }
        }
      };

      renderSternemonthChart('sternemonthChart', '', labels, sternemonthData, '#3CB371', optionsSterne);
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

function renderSternemonthChart(canvasId, label, labels, data, color, options) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  if (chartSternemonth) {
    chartSternemonth.destroy();
  }

  chartSternemonth = new Chart(ctx, {
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
        pointRadius: ctx => (ctx.dataIndex === activeIndexSterne ? 8 : 5),
        pointHoverRadius: 10,
        hoverRadius: 9,
        hoverBackgroundColor: color
      }]
    },
    options: options,
    plugins: [ChartDataLabels]
  });
}