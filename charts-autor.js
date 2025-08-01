document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=57210249&single=true&output=csv';

  let autorChartInstance = null;
  let activeIndex = null; // Index des gerade gehhoverten Balkens

  function generateColors(count) {
    const palette = ['#ff7256', '#FFB90F', '#63b8ff', '#3CB371', '#9370DB', '#20B2AA'];
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }

  function renderAutorChart(labels, data, barThickness, maxValue) {
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
          borderRadius: [30, 30, 30, 30],
          borderWidth: 7,
          barThickness: barThickness
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        interaction: {
          mode: 'nearest',
          intersect: true
        },
        onHover: (event, elements) => {
          if (elements.length) {
            activeIndex = elements[0].index;
          } else {
            activeIndex = null;
          }
          autorChartInstance.update('none');
        },
        scales: {
          x: {
            display: false,
            min: 0,
            max: maxValue,
            grid: { display: false }
          },
          y: {
            ticks: {
              color: ctx => (ctx.index === activeIndex ? 'white' : 'white'),
              font: ctx => ({
                family: "'Dosis', sans-serif",
                size: 16,
                weight: ctx.index === activeIndex ? 'bold' : 'normal'
              }),
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
            offset: -2,
            clamp: true,
            font: ctx => ({
              family: "'Dosis', sans-serif",
              size: 15,
              weight: ctx.dataIndex === activeIndex ? 'bold' : 'normal'
            })
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

      const maxValue = Math.max(...data) + 1;
      const mediaQuery = window.matchMedia('(max-width: 740px)');

      function updateChart() {
        const barThickness = mediaQuery.matches ? 30 : 35;
        renderAutorChart(labels, data, barThickness, maxValue);
      }

      mediaQuery.addEventListener('change', updateChart);
      updateChart();
    })
    .catch(error => {
      console.error('Fehler beim Laden der CSV:', error);
    });
});