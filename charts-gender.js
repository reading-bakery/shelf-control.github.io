Chart.register(ChartDataLabels);

let excludedCategories = [];
let myGenderChartInstance = null;

async function drawGenderChart() {
  const sheetID = '1Y6q--ao9QaY13fZSiIqNjPiOkYQiaQHdggKl0b_VaHE';
  const gid = '1702643479';
  const query = encodeURIComponent("SELECT E WHERE E IS NOT NULL AND E != ''");
  const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?gid=${gid}&tq=${query}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    let rows = json.table.rows;

    rows = rows.filter(row => {
      const val = row.c[0]?.v;
      return val !== null && val !== undefined && val.toString().trim() !== '';
    });

    const rawCounts = {
      weiblich: 0,
      männlich: 0,
      mix: 0,
      divers: 0
    };

    rows.forEach(row => {
      const value = row.c[0]?.v?.toLowerCase();
      if (value && rawCounts.hasOwnProperty(value)) {
        rawCounts[value]++;
      }
    });

    const filteredCounts = {};
    Object.keys(rawCounts).forEach(key => {
      if (!excludedCategories.includes(key) && rawCounts[key] > 0) {
        filteredCounts[key] = rawCounts[key];
      }
    });

    const total = Object.values(filteredCounts).reduce((a, b) => a + b, 0);
    const labels = Object.keys(filteredCounts).map(label => label.charAt(0).toUpperCase() + label.slice(1));
    const data = Object.values(filteredCounts);

    const canvas = document.getElementById('genderChart');
    const ctx = canvas.getContext('2d');

    if (myGenderChartInstance) {
      myGenderChartInstance.destroy();
      myGenderChartInstance = null;
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

    // Media Query: Schriftgröße, Padding & Höhe
    let fontSize = 14;
    let paddingTop = 45;
    let paddingBottom = 100;

    if (window.matchMedia("(max-width: 740px)").matches) {
      fontSize = 10;
      paddingTop = 35;
      paddingBottom = 5;
      canvas.height = 200;
    } else if (window.matchMedia("(max-width: 940px)").matches) {
      fontSize = 12;
      paddingTop = 30;
      paddingBottom = 70;
      canvas.height = 280;
    } else {
      canvas.height = 360;
    }

    myGenderChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#F03274', '#4CC5D2', '#E67E22', '#2ECC71'],
          borderColor: '#1f1f1f',
          borderWidth: 5,
          borderRadius: 10
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        layout: {
          padding: {
            top: paddingTop,
            bottom: paddingBottom
          }
        },
        plugins: {
          datalabels: {
            display: true,
            color: '#ffffff',
            font: {
              family: 'Dosis',
              size: fontSize,
              weight: 'bold',
            },
            formatter: function (value, context) {
              const label = context.chart.data.labels[context.dataIndex];
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1) + '%';
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
        },
        animation: {
          onComplete: function () {
            // ggf. benutzerdefinierte Aktionen
          }
        }
      }
    });

  } catch (error) {
    console.error('Fehler beim Laden oder Zeichnen des Geschlechterdiagramms:', error);
  }
}

function toggleCategory(category) {
  const index = excludedCategories.indexOf(category);
  if (index > -1) {
    excludedCategories.splice(index, 1);
  } else {
    excludedCategories.push(category);
  }
  drawGenderChart();
  if (typeof updateButtonStyles === 'function') {
    updateButtonStyles();
  }
}

drawGenderChart();
