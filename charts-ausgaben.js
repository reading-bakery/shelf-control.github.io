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

      renderChart('ausgabenChart', '', labels, ausgabenData, '#FFB90F');
    })
    .catch(err => console.error('Fehler beim Laden der CSV:', err));
});

function renderChart(canvasId, label, labels, data, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  const options = {
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
      tooltip: {
        enabled: false
      },
      legend: {
        position: 'bottom',
        display: false,
        labels: {
          color: 'white',
          font: {
            family: "'Dosis', sans-serif",
            size: 13,
            weight: 'normal'
          }
        }
      },
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
        grid: { display: true },
        ticks: {
          display: true,
          font: { family: "'Dosis', sans-serif" }
        },
        beginAtZero: false,
        min: 0,
        max: 130
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

  new Chart(ctx, {
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
        pointRadius: 5,        // kleiner Punkt normal
        pointHoverRadius: 10,  // größer beim Hover
        hoverRadius: 9,        // bessere Erkennung beim Hover
        hoverBackgroundColor: color
      }]
    },
    options: options,
    plugins: [ChartDataLabels]
  });
}
