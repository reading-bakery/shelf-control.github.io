document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1635103848&single=true&output=csv';

  let sprachenChartInstance = null;
  const inactiveColor = '#333333';
  let activeIndex = null;

  const languageMap = {
    "Englisch": "Englisch",
    "Deutsch": "Deutsch",
    "Englisch Original": "Englisch O",
    "Chinesisch": "Chinesisch",
    "Französisch": "Französisch",
    "Französisch Original": "Französisch",
    "Japanisch": "Japanisch",
    "Koreanisch": "Koreanisch",
    "Russisch": "Russisch"
  };

  function generateColors(count) {
    const palette = ['#ff7256', '#FFB90F', '#63b8ff', '#3CB371', '#9370DB', '#20B2AA'];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }

  function renderSprachenChart(labels, data, barThickness, maxValue) {
    const canvas = document.getElementById('sprachenChart');
    const ctx = canvas.getContext('2d');
    const originalColors = generateColors(data.length);

    if (sprachenChartInstance) {
      sprachenChartInstance.destroy();
    }

    sprachenChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Anzahl Bücher',
          data: data,
          backgroundColor: [...originalColors],
          borderRadius: 30,
          borderWidth: 3,
          barThickness: barThickness
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        onHover: (event, elements) => {
          const dataset = sprachenChartInstance.data.datasets[0];
          if (elements.length > 0) {
            activeIndex = elements[0].index;
            dataset.backgroundColor = originalColors.map((color, i) =>
              i === activeIndex ? color : inactiveColor
            );
          } else {
            activeIndex = null;
            dataset.backgroundColor = [...originalColors];
          }
          sprachenChartInstance.update('none');
        },
        scales: {
          x: {
            display: false,
            min: 0,
            max: maxValue
          },
          y: {
            ticks: {
              color: 'white',
              font: (context) => ({
                family: "'Dosis', sans-serif",
                size: 16,
                // Fettung nur für das gehoverte Element an der Achse
                weight: context.index === activeIndex ? 'bold' : 'normal'
              })
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
            offset: 10,
            font: (context) => ({
              family: "'Dosis', sans-serif",
              size: 15,
              // Fettung nur für den gehoverten Datenwert am Balkenende
              weight: context.dataIndex === activeIndex ? 'bold' : 'normal'
            }),
            formatter: (value) => value
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
            const shortName = languageMap[name.trim()] || name.trim();
            labels.push(shortName);
            data.push(parsedCount);
          }
        }
      });

      const mediaQuery = window.matchMedia('(max-width: 740px)');

      function updateChart() {
        const barThickness = mediaQuery.matches ? 25 : 30;
        // Puffer für Datalabels rechts (1.2 multiplier für Platz)
        const maxValue = Math.max(...data) * 1.2;
        renderSprachenChart(labels, data, barThickness, maxValue);
      }

      mediaQuery.addEventListener('change', updateChart);
      updateChart();
    })
    .catch(error => console.error('Fehler:', error));
});