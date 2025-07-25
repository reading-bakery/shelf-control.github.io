document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1931149788&single=true&output=csv';

  let verlagChartInstance = null;

  // Verlag-Mapping: lange Namen → kurze Namen
  const languageMap = {
    "ATB/Aufbau/RL/Blumenbar": "Aufbau/ATB",
    "Sonstiges": "Sonst"
    // hier kannst du weitere Einträge hinzufügen
  };

  function generateColors(count) {
    const palette = ['#ff7256', '#FFB90F', '#63b8ff', '#3CB371', '#9370DB', '#20B2AA'];
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }

  function renderVerlagChart(labels, data, barThickness, maxValue) {
    const ctx = document.getElementById('verlagChart').getContext('2d');

    if (verlagChartInstance) {
      verlagChartInstance.destroy();
    }

    verlagChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Anzahl Bücher',
          data: data,
          backgroundColor: generateColors(data.length),
          borderRadius: [30, 30, 30, 30],
          borderWidth: 7,
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
            max: maxValue,
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
            offset: -7,
            clamp: true,
            font: { family: "'Dosis', sans-serif", weight: 'normal', size: 15 }
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
            // Hier das Mapping anwenden:
            labels.push(languageMap[name.trim()] || name.trim());
            data.push(parsedCount);
          }
        }
      });

      const maxValue = Math.max(...data) + 1; // +1 für Luft am rechten Rand
      const mediaQuery = window.matchMedia('(max-width: 740px)');

      function updateChart() {
        const barThickness = mediaQuery.matches ? 30 : 35;
        renderVerlagChart(labels, data, barThickness, maxValue);
      }

      mediaQuery.addEventListener('change', updateChart);
      updateChart();
    })
    .catch(error => {
      console.error('Fehler beim Laden der CSV:', error);
    });
});
