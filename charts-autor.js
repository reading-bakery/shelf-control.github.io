document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=57210249&single=true&output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').slice(1); // Header entfernen
      const labels = [];
      const data = [];

      rows.forEach(row => {
        const [name, count] = row.split(',');
        if (name && count) {
          const parsedCount = parseInt(count.trim(), 10);
          if (!isNaN(parsedCount)) {
            labels.push(name.trim()); // kein \n mehr nötig
            data.push(parsedCount);
          }
        }
      });

      renderAutorChart(labels, data);
    })
    .catch(error => {
      console.error('Fehler beim Laden der CSV:', error);
    });
});

function renderAutorChart(labels, data) {
  const ctx = document.getElementById('autorChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Anzahl Bücher',
        data: data,
        backgroundColor: generateColors(data.length)
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      scales: {
        x: {
          display: false,
          min: 0
        },
        y: {
          ticks: {
            color: 'white',
            callback: function(value, index) {
              // Zeilenumbruch bei Leerzeichen
              const label = this.getLabelForValue(value);
              return label.split(' ');
            }
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        },
        datalabels: {
          color: 'white',
          anchor: 'end',
          align: 'right',
          font: {
            weight: 'bold'
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function generateColors(count) {
  const palette = ['#ff7256', '#FFB90F', '#63b8ff', '#3CB371', '#9370DB', '#20B2AA'];
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
}
