 document.addEventListener('DOMContentLoaded', () => {
      const canvas = document.getElementById('umfangChart');
      const ctx = canvas.getContext('2d');

      // Farbverläufe für jedes Segment erzeugen (horizontaler Verlauf)
      const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient1.addColorStop(0, '#ff7256');
      gradient1.addColorStop(1, '#ff4500');

      const gradient2 = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient2.addColorStop(0, '#3CB371');
      gradient2.addColorStop(1, '#294e29ff');

      const gradient3 = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient3.addColorStop(0, '#63b8ff');
      gradient3.addColorStop(1, '#5e30f5ff');

      // CSV-Daten laden und verarbeiten
      fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=944857737&single=true&output=csv')
        .then(response => response.text())
        .then(csvText => {
          const parsedData = Papa.parse(csvText, { header: true }).data;

          // Labels und Daten extrahieren
          const labels = parsedData.map(row => row['Umfang']);
          const data = parsedData.map(row => parseFloat(row['Anzahl']));

          // Donut-Diagramm konfigurieren
          const config = {
            type: 'doughnut',
            data: {
              labels: labels,
              datasets: [{
                label: 'Seitenumfang',
                data: data,
                backgroundColor: [gradient1, gradient2, gradient3],
                borderColor: '#1f1f1f',
                borderWidth: 5,
                hoverOffset: 15,
                borderRadius: 15,
              }]
            },
            options: {
              cutout: '55%',
              responsive: true,
              plugins: {
                legend: {
                  display: false // Legende ausblenden
                },
                tooltip: {
                  enabled: false // Tooltip komplett aus
                },
                datalabels: {
                  display: false // keine Standard-Datalabels auf Segmenten
                }
              },
              hover: {
                onHover: (event, elements, chart) => {
                  if (elements.length) {
                    const idx = elements[0].index;
                    chart.options.plugins.datalabels.display = ctx => ctx.dataIndex === idx;
                    chart.data.datasets[0].datalabels = chart.data.datasets[0].datalabels || {};
                    chart.update();
                  } else {
                    chart.options.plugins.datalabels.display = false;
                    chart.update();
                  }
                }
              }
            },
            plugins: [{
              id: 'centerLabel',
              afterDraw(chart) {
                const ctx = chart.ctx;
                const centerX = chart.width / 2;
                const centerY = chart.height / 2;
                const active = chart.tooltip?._active || [];

                if (active && active.length) {
                  const idx = active[0].index;
                  const value = chart.data.datasets[0].data[idx];
                  const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1) + '%';
                  const label = chart.data.labels[idx];

                  ctx.save();
                  ctx.font = '16px Dosis, sans-serif';
                  ctx.fillStyle = 'white';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  // Kategorie (Label) oben, leicht nach oben verschoben
                  ctx.fillText(label, centerX, centerY - 12);

                  // Prozentwert darunter, größer und etwas nach unten verschoben
                  ctx.font = '22px Dosis, sans-serif';
                  ctx.fillText(percentage, centerX, centerY + 14);

                  ctx.restore();
                }
              }
            }]
          };

          // Diagramm erstellen
          new Chart(ctx, config);
        })
        .catch(error => console.error('Fehler beim Laden der CSV-Daten:', error));
    });