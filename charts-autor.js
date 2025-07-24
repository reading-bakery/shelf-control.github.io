document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=57210249&single=true&output=csv';

  let autorChartInstance = null;

  function generateColors(count) {
    const palette = ['#ff7256', '#FFB90F', '#63b8ff', '#3CB371', '#9370DB', '#20B2AA'];
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }

  function renderAutorChart(labels, data, barThickness) {
    const ctx = document.getElementById('autorChart').getContext('2d');

    if (autorChartInstance) {
      autorChartInstance.destroy();
    }

    autorChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Anzahl Bücher',
          data: data,
          backgroundColor: generateColors(data.length),
          borderRadius: [0, 10, 10, 0],
          borderWidth: 10,
          barThickness: barThickness
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            display: false,
            min: 0,
            grid: { display: false }
          },
          y: {
            ticks: {
              color: 'white',
              font: { family: "'Dosis', sans-serif", size: 16 },
              callback: function(value) {
                return this.getLabelForValue(value);
              }
            },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            color: 'white',
            anchor: 'end',
            align: 'right',
            font: { weight: 'normal', size: 12 }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').slice(1);
      const labels = [];
      const data = [];

      rows.forEach(row => {
        const [name, count] = row.split(',');
        if (name && count) {
          const parsedCount = parseInt(count.trim(), 10);
          if (!isNaN(parsedCount)) {
            labels.push(name.trim());
            data.push(parsedCount);
          }
        }
      });

      const mediaQuery = window.matchMedia('(max-width: 740px)');

      function updateChart() {
        if (mediaQuery.matches) {
          renderAutorChart(labels, data, 30);  // dickere Balken auf kleinen Bildschirmen
        } else {
          renderAutorChart(labels, data, 35);  // dünnere Balken auf großen Bildschirmen
        }
      }

      mediaQuery.addEventListener('change', updateChart);

      updateChart();  // Initiale Anzeige
    })
    .catch(error => {
      console.error('Fehler beim Laden der CSV:', error);
    });
});
