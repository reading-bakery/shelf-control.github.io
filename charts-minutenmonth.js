Chart.register(ChartDataLabels);

let chartMinutenmonth = null;
let activeIndexMinuten = null; // Hover-Index für Minutenmonth-Chart

document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1606522008&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(row =>
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );
      const header = rows[0];

      const monthIndex = header.indexOf('Monat');
      const minutenmonthIndex = header.indexOf('Anzahl');

      const labels = [];
      const minutenmonthData = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        labels.push(row[monthIndex]);
        const minutenmonth = parseFloat(row[minutenmonthIndex]) || 0;
        minutenmonthData.push(minutenmonth);
      }

      const optionsMinuten = {
        responsive: true,
        interaction: false, // eigenes Hover-Handling
        onHover: (event) => {
          const xAxis = chartMinutenmonth.scales.x;
          const yAxis = chartMinutenmonth.scales.y;
          const x = event.offsetX;
          const y = event.offsetY;

          const index = Math.round(xAxis.getValueForPixel(x));
          if (
            index >= 0 && index < labels.length &&
            y > yAxis.bottom && y < yAxis.bottom + 30 // grob unter X-Achse
          ) {
            activeIndexMinuten = index;
          } else {
            const elements = chartMinutenmonth.getElementsAtEventForMode(event, 'nearest', {intersect: true}, false);
            if (elements.length > 0) {
              activeIndexMinuten = elements[0].index;
            } else {
              activeIndexMinuten = null;
            }
          }
          chartMinutenmonth.update('none');
        },
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            color: 'white',
            font: ctx => ({
              family: "'Dosis', sans-serif",
              weight: ctx.dataIndex === activeIndexMinuten ? 'bold' : 'normal',
              size: 13
            }),
            anchor: 'end',
            align: 'top',
            formatter: value => value,
            display: ctx => activeIndexMinuten === null || ctx.dataIndex === activeIndexMinuten
          }
        },
        scales: {
          y: {
            display: false,
            min: 0,
            max: 3300,
            grid: { display: true },
            ticks: {
              display: true,
              font: { family: "'Dosis', sans-serif" }
            }
          },
          x: {
            ticks: {
              color: ctx => ctx.index === activeIndexMinuten ? '#ff7256' : 'white',
              maxRotation: 0,
              minRotation: 0,
              font: ctx => ({
                family: "'Dosis', sans-serif",
                size: 16,
                weight: ctx.index === activeIndexMinuten ? 'bold' : 'normal'
              })
            },
            grid: { display: false }
          }
        }
      };

      renderMinutenmonthChart('minutenmonthChart', '', labels, minutenmonthData, '#ff7256', optionsMinuten);
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

function renderMinutenmonthChart(canvasId, label, labels, data, color, options) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  if (chartMinutenmonth) {
    chartMinutenmonth.destroy();
  }

  chartMinutenmonth = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        backgroundColor: '#ff7256',
        borderColor: '#ff7256',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: ctx => (ctx.dataIndex === activeIndexMinuten ? 8 : 5),
        pointHoverRadius: 10,
        hoverRadius: 9,
        hoverBackgroundColor: color
      }]
    },
    options: options,
    plugins: [ChartDataLabels]
  });
}
