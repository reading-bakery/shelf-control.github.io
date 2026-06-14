const csvUrl =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=486311532&single=true&output=csv';

async function loadAndDrawChart() {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();

    const rows = csvText
      .trim()
      .split('\n')
      .map(row => row.split(','));

    const months = rows.slice(1).map(row => row[0]);
    const allYears = rows[0].slice(1);

    const wantedYears = ['2025', '2026', '2027'];

    const colors = {
      2025: '#ff7256',
      2026: '#FFB90F',
      2027: '#63b8ff'
    };

    const yearIndices = wantedYears
      .map(year => allYears.indexOf(year))
      .filter(index => index !== -1);

    let activeIndex = null;
    let clickedIndex = null;

    const datasets = yearIndices.map(colIndex => {
      const year = allYears[colIndex];

      return {
        label: year,
        data: rows.slice(1).map(row => {
          const value = parseInt(row[colIndex + 1]);
          return isNaN(value) ? null : value;
        }),

        borderColor: colors[year],
        backgroundColor: colors[year],

        fill: false,
        tension: 0.4,
        hidden: year !== '2026',

        pointRadius: ctx => {
          const i = ctx.dataIndex;
          return i === activeIndex || i === clickedIndex ? 7 : 5;
        },

        pointHoverRadius: 10,
        hoverRadius: 9,
        hoverBackgroundColor: colors[year]
      };
    });

    const ctx = document.getElementById('subChart').getContext('2d');

    const chart = new Chart(ctx, {
      type: 'line',

      data: {
        labels: months,
        datasets
      },

      options: {
        responsive: false,
        maintainAspectRatio: false,

        interaction: {
          mode: 'nearest',
          intersect: true
        },

        layout: {
          padding: {
            top: 10,
            bottom: 0,
          }
        },

        onClick(event) {
          const index = Math.round(
            chart.scales.x.getValueForPixel(event.offsetX)
          );

          if (index >= 0 && index < months.length) {
            clickedIndex =
              clickedIndex === index ? null : index;

            chart.update('none');
          }
        },

        onHover(event) {
          const xAxis = chart.scales.x;
          const yAxis = chart.scales.y;

          const index = Math.round(
            xAxis.getValueForPixel(event.offsetX)
          );

          const overXAxis =
            index >= 0 &&
            index < months.length &&
            event.offsetY > yAxis.bottom &&
            event.offsetY < yAxis.bottom + 30;

          if (overXAxis) {
            activeIndex = index;
          } else {
            const elements =
              chart.getElementsAtEventForMode(
                event,
                'nearest',
                { intersect: true },
                false
              );

            activeIndex =
              elements.length > 0
                ? elements[0].index
                : null;
          }

          chart.update('none');
        },

        plugins: {
          datalabels: {
            display: ctx =>
              activeIndex === null ||
              ctx.dataIndex === activeIndex,

            color: 'white',

            font: ctx => ({
              family: 'Dosis, sans-serif',
              size: 12,
              weight:
                ctx.dataIndex === activeIndex
                  ? 'bold'
                  : 'normal'
            }),

            align: 'top',
            anchor: 'end'
          },

          legend: {
            position: 'top',

            labels: {
              color: 'white',
              boxWidth: 50,
              padding: 10,
              usePointStyle: true,

              font: {
                family: 'Dosis, sans-serif',
                size: 12,
                weight: 'normal'
              }
            }
          },

          tooltip: {
            enabled: false
          },

          annotation: {
            annotations: {
              ziel: {
                type: 'line',
                yMin: 120,
                yMax: 120,

                borderColor: 'white',
                borderWidth: 1,
                borderDash: [5, 5],

                label: {
                  enabled: true,
                  content: 'SuB-Ziel = 120',
                  position: 'end',
                  yAdjust: -10,

                  color: 'white',
                  backgroundColor: 'transparent',

                  font: {
                    family: 'Dosis, sans-serif',
                    size: 12
                  }
                }
              }
            }
          }
        },

        scales: {
          x: {
            grid: {
              display: false
            },

            ticks: {
              color: ctx => {
                if (activeIndex === null) return '#fff';

                if (ctx.index === activeIndex) {
                  const dataset = datasets.find(
                    ds => ds.data[ctx.index] != null
                  );

                  return dataset
                    ? dataset.borderColor
                    : '#fff';
                }

                return '#fff';
              },

              font: ctx => ({
                family: 'Dosis, sans-serif',
                size: 13,
                weight:
                  ctx.index === activeIndex
                    ? 'bold'
                    : 'normal'
              }),

              minRotation: 0,
              maxRotation: 0
            }
          },

          y: {
            display: false,
            min: 100,
            max: 145,

            grid: {
              display: false
            },

            ticks: {
              color: 'white',

              font: {
                family: 'Dosis, sans-serif',
                size: 12
              }
            }
          }
        }
      },

      plugins: [ChartDataLabels]
    });
  } catch (error) {
    console.error(
      'Fehler beim Laden des Sub-Charts:',
      error
    );
  }
}

document.addEventListener(
  'DOMContentLoaded',
  loadAndDrawChart
);