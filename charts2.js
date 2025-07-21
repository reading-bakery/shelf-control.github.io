async function drawGenderChart() {
  const sheetID = '1Y6q--ao9QaY13fZSiIqNjPiOkYQiaQHdggKl0b_VaHE';
  const gid = '1702643479';
  const query = encodeURIComponent('SELECT D WHERE D IS NOT NULL'); 
  const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?gid=${gid}&tq=${query}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const counts = {
      weiblich: 0,
      männlich: 0,
      mix: 0,
      divers: 0
    };

    rows.forEach(row => {
      const value = row.c[0]?.v?.toLowerCase();
      if (value && counts.hasOwnProperty(value)) {
        counts[value]++;
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const labels = Object.keys(counts);
    const data = Object.values(counts);

    const tooltips = {
      callbacks: {
        label: function (context) {
          const count = context.raw;
          const percent = ((count / total) * 100).toFixed(1);
          return `${context.label}: ${count} (${percent}%)`;
        }
      }
    };

    const ctx = document.getElementById('genderChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#FF6B6B', 
            '#4D96FF',  
            '#FFD93D',  
            '#6BCB77'   
          ],
          borderColor: '#1f1f1f',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: tooltips,
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgb(90,165,142)',
              font: {
                family: 'Bebas Neue',
                size: 18
              }
            }
          }
        }
      }
    });

  } catch (error) {
    console.error('Fehler beim Laden der Geschlechterdaten:', error);
  }
}

drawGenderChart();
