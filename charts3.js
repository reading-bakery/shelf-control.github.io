Chart.register(ChartDataLabels);

let excludedUmfangCategories = [];
let myUmfangChartInstance = null;

async function drawUmfangChart() {
  const sheetID = '1Y6q--ao9QaY13fZSiIqNjPiOkYQiaQHdggKl0b_VaHE';
  const gid = '1702643479';
  const query = encodeURIComponent("SELECT F WHERE F IS NOT NULL AND F != ''");
  const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?gid=${gid}&tq=${query}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    let rows = json.table.rows;

    // Filtere leere Werte raus
    rows = rows.filter(row => {
      const val = row.c[0]?.v;
      return val !== null && val !== undefined && val.toString().trim() !== '';
    });

    // Rohzählung aller Kategorien
    const rawCounts = {};
    rows.forEach(row => {
      const value = row.c[0]?.v.toString().trim();
      if (!rawCounts[value]) {
        rawCounts[value] = 0;
      }
      rawCounts[value]++;
    });

    // Entferne ausgeschlossene Kategorien
    Object.keys(rawCounts).forEach(key => {
      if (excludedUmfangCategories.includes(key)) {
        delete rawCounts[key];
      }
    });

    // Nimm nur die drei häufigsten Kategorien
    const sortedCategories = Object.entries(rawCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Baue gefilterte Counts mit genau 3 Labels (auch 0, falls Kategorie nicht da)
    const filteredCounts = {};
    sortedCategories.forEach(([cat, count]) => {
      filteredCounts[cat] = count;
    });

    // Falls weniger als 3 Kategorien, fülle mit 0 auf
    while (Object.keys(filteredCounts).length < 3) {
      const fillerKey = `Keine Daten ${Object.keys(filteredCounts).length + 1}`;
      filteredCounts[fillerKey] = 0;
    }

    const total = Object.values(filteredCounts).reduce((a, b) => a + b, 0);
    const labels = Object.keys(filteredCounts);
    const data = Object.values(filteredCounts);

    const ctx = document.getElementById('umfangChart').getContext('2d');

    if (myUmfangChartInstance) {
      myUmfangChartInstance.destroy();
      myUmfangChartInstance = null;
    }

    if (total === 0 || labels.length === 0) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Dosis';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Keine Daten verfügbar', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    myUmfangChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#F03274', '#4CC5D2', '#E67E22'
          ],
          borderColor: '#1f1f1f',
          borderWidth: 5,
          borderRadius: 10
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          datalabels: {
            display: true,
            color: '#ffffff',
            font: {
              family: 'Dosis',
              size: 14,
              weight: 'bold',
            },
            formatter: function(value, context) {
              const label = context.chart.data.labels[context.dataIndex];
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
              return percentage + '\n' + label;
            },
            align: 'end',
            anchor: 'end',
          },
          tooltip: {
            enabled: false
          },
          legend: {
            display: false
          }
        }
      }
    });

  } catch (error) {
    console.error('Fehler beim Laden oder Zeichnen des Umfang-Diagramms:', error);
  }
}

function toggleUmfangCategory(category) {
  const index = excludedUmfangCategories.indexOf(category);
  if (index > -1) {
    excludedUmfangCategories.splice(index, 1);
  } else {
    excludedUmfangCategories.push(category);
  }
  drawUmfangChart();
  if (typeof updateButtonStyles === 'function') {
    updateButtonStyles();
  }
}

drawUmfangChart();
