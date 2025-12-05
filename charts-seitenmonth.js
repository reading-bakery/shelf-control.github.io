Chart.register(ChartDataLabels);

let chartSeitenmonth = null;
let activeIndexSeiten = null; // Hover-Index für Seitenmonat-Chart

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
        interaction: false, // komplett custom Hover
        onHover: (event) => {
          const xAxis = chartSeitenmonth.scales.x;
          const yAxis = chartSeitenmonth.scales.y;
          const x = event.offsetX;
          const y = event.offsetY;

          const index = Math.round(xAxis.getValueForPixel(x));
            if (
            index >= 0 && index < labels.length &&
            x > xAxis.left && x < xAxis.right &&
            y > xAxis.top && y < xAxis.bottom + 40
          ){
            activeIndexSeiten = index;
          } else {
            const elements = chartSeitenmonth.getElementsAtEventForMode(event, 'nearest', {intersect: true}, false);
            if (elements.length > 0) {
              activeIndexSeiten = elements[0].index;
            } else {
              activeIndexSeiten = null;
            }
          }
          chartSeitenmonth.update('none');
        },
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            color: 'white',
            font: ctx => ({
              family: "'Dosis', sans-serif",
              weight: ctx.dataIndex === activeIndexSeiten ? 'bold' : 'normal',
              size: 13
            }),
            anchor: 'end',
            align: 'top',
            formatter: value => value,
            display: ctx => activeIndexSeiten === null || ctx.dataIndex === activeIndexSeiten
          }
        },
        scales: {
          y: {
            display: false,
            min: 0,
            max: 3700,
            grid: { display: true },
            ticks: {
              display: true,
              font: { family: "'Dosis', sans-serif" }
            }
          },
          x: {
            ticks: {
              color: ctx => {
                if (activeIndexSeiten === null) return 'white';
                if (ctx.index === activeIndexSeiten) {
                  return '#63b8ff'; // Linienfarbe
                }
                return 'white';
              },
              maxRotation: 0,
              minRotation: 0,
              font: ctx => ({
                family: "'Dosis', sans-serif",
                size: 16,
                weight: ctx.index === activeIndexSeiten ? 'bold' : 'normal'
              })
            },
            grid: { display: false }
          }
        }
      };

      renderSeitenmonthChart('seitenmonthChart', '', labels, seitenmonthData, '#63b8ff', optionsSeiten);
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

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
        pointRadius: ctx => (ctx.dataIndex === activeIndexSeiten ? 8 : 5),
        pointHoverRadius: 10,
        hoverRadius: 9,
        hoverBackgroundColor: color
      }]
    },
    options: options,
    plugins: [ChartDataLabels]
  });
}
