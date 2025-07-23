const sheetID = '1Y6q--ao9QaY13fZSiIqNjPiOkYQiaQHdggKl0b_VaHE';
const gid = '1702643479';
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?gid=${gid}&tq=SELECT%20A,B`;

fetch(sheetURL)
  .then(res => res.text())
  .then(rep => {
    const data = JSON.parse(rep.substr(47).slice(0, -2));
    const labels = [];
    const values = [];

    data.table.rows.forEach(row => {
      labels.push(row.c[0].v); // Monat
      values.push(row.c[1].v); // Sub-Zahl
    });

    const ctx = document.getElementById('subChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'SuB-Entwicklung',
          data: values,
          borderColor: '#3e95cd',
          backgroundColor: 'rgba(62,149,205,0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          },
          title: {
            display: true,
            text: 'SuB im Zeitverlauf'
          },
          annotation: {
            annotations: {
              zielLinie: {
                type: 'line',
                yMin: 120,
                yMax: 120,
                borderColor: 'red',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  content: 'Sub-Ziel = 120',
                  enabled: true,
                  position: 'end',
                  backgroundColor: 'rgba(255, 99, 132, 0.8)',
                  color: 'white',
                  font: {
                    weight: 'bold'
                  }
                }
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 150
          }
        }
      }
    });
  });
