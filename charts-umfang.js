Chart.register(ChartDataLabels);

async function drawUmfangChart() {
  const sheetID = '1Y6q--ao9QaY13fZSiIqNjPiOkYQiaQHdggKl0b_VaHE';
  const gid = '1702643479';
  const query = encodeURIComponent("SELECT F WHERE F IS NOT NULL AND F != ''");
  const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?gid=${gid}&tq=${query}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const counts = {};
    rows.forEach(row => {
      if (row.c[0] && row.c[0].v) {
        const val = row.c[0].v.toString().trim();
        counts[val] = (counts[val] || 0) + 1;
      }
    });

    const expectedLabels = ['bis 300', '301-500', 'ab 501'];
    expectedLabels.forEach(label => {
      if (!counts.hasOwnProperty(label)) {
        counts[label] = 0;
      }
    });

    const labels = expectedLabels;
    const data = labels.map(label => counts[label]);

    const ctx = document.getElementById('umfangChart').getContext('2d');
    if (window.umfangChartInstance) {
      window.umfangChartInstance.destroy();
    }

    window.umfangChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#F03274', '#4CC5D2', '#E67E22'],
          borderColor: '#1f1f1f',
          borderWidth: 5,
          borderRadius: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        layout: {
          padding: {
            top: 70,
            bottom: 70
          }
        },
        plugins: {
          datalabels: {
            display: true,
            color: '#ffffff',
            font: {
              family: 'Dosis',
              size: 14,
              weight: 'bold'
            },
            formatter: (value, ctx) => {
              const label = ctx.chart.data.labels[ctx.dataIndex];
              const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percent = ((value / total) * 100).toFixed(1) + '%';
              return `${percent}\n${label}`;
            },
            align: 'end',
            anchor: 'end'
          },
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      }
    });

  } catch (error) {
    console.error('Fehler beim Laden oder Zeichnen des Umfang-Diagramms:', error);
  }
}

drawUmfangChart();
