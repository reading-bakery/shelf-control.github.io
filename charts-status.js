document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('statusChart');
  const ctx = canvas.getContext('2d');

  // Farbverläufe für die 4 Kategorien vorbereiten
  const gradients = [];

  const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, 0); // Weiblich
  gradient1.addColorStop(0, '#ff7256');
  gradient1.addColorStop(1, '#ff4500');
  gradients.push(gradient1);

  const gradient2 = ctx.createLinearGradient(0, 0, canvas.width, 0); // Männlich
  gradient2.addColorStop(0, '#3CB371');
  gradient2.addColorStop(1, '#294e29ff');
  gradients.push(gradient2);

  const gradient3 = ctx.createLinearGradient(0, 0, canvas.width, 0); // Mix
  gradient3.addColorStop(0, '#63b8ff');
  gradient3.addColorStop(1, '#5e30f5ff');
  gradients.push(gradient3);

  const gradient4 = ctx.createLinearGradient(0, 0, canvas.width, 0); // Divers
  gradient4.addColorStop(0, '#FFB90F');
  gradient4.addColorStop(1, '#a87806ff');
  gradients.push(gradient4);

  // CSV-Daten laden
  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1828484313&single=true&output=csv')
    .then(response => response.text())
    .then(csvText => {
      const parsedData = Papa.parse(csvText, { header: true }).data;

      // Nur Werte mit Anzahl > 0 berücksichtigen
      const filtered = parsedData.filter(row => parseFloat(row['Anzahl']) > 0);

      const labels = filtered.map(row => row['Status']);
      const data = filtered.map(row => parseFloat(row['Anzahl']));

      if (data.length === 0) {
        canvas.style.display = 'none'; // Diagramm ausblenden, wenn keine Daten vorhanden
        return;
      }

      // Donut-Diagramm erstellen
      const config = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Status',
            data: data,
            backgroundColor: gradients.slice(0, labels.length),
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
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: { display: false }
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

                      // 1. Label (z.B. "bis 300")
              ctx.font = '18px "Dosis", sans-serif';
              ctx.fillStyle = '#a2bba3';
              ctx.fillText(label, centerX, centerY - 25);

              // 2. Prozentwert (Groß in Bebas Neue)
              ctx.font = 'bold 38px "Bebas Neue", sans-serif';
              ctx.fillStyle = 'white';
              ctx.fillText(percentage, centerX, centerY + 5);

              // 3. Total Wert (wieder eingebaut)
              ctx.font = '16px "Dosis", sans-serif';
              ctx.fillStyle = 'white';
              ctx.fillText('Total: ' + value, centerX, centerY + 32);

              ctx.restore();
                    }
                  }
                }]
              };

      new Chart(ctx, config);
    })
    .catch(error => console.error('Fehler beim Laden der CSV-Daten:', error));
});
