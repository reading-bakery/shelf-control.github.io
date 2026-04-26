document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('statusChart');
  const ctx = canvas.getContext('2d');

  // Farbverläufe vorbereiten
  const gradients = [];
  const inactiveColor = '#333333'; // Farbe für inaktive Segmente

  const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient1.addColorStop(0, '#ff7256');
  gradient1.addColorStop(1, '#ff4500');
  gradients.push(gradient1);

  const gradient2 = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient2.addColorStop(0, '#3CB371');
  gradient2.addColorStop(1, '#294e29ff');
  gradients.push(gradient2);

  const gradient3 = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient3.addColorStop(0, '#63b8ff');
  gradient3.addColorStop(1, '#5e30f5ff');
  gradients.push(gradient3);

  const gradient4 = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient4.addColorStop(0, '#FFB90F');
  gradient4.addColorStop(1, '#a87806ff');
  gradients.push(gradient4);

  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1828484313&single=true&output=csv')
    .then(response => response.text())
    .then(csvText => {
      const parsedData = Papa.parse(csvText, { header: true }).data;
      const filtered = parsedData.filter(row => parseFloat(row['Anzahl']) > 0);

      const labels = filtered.map(row => row['Status']);
      const data = filtered.map(row => parseFloat(row['Anzahl']));

      if (data.length === 0) {
        canvas.style.display = 'none';
        return;
      }

      // Aktuelle Farben basierend auf gefilterten Labels
      const chartColors = gradients.slice(0, labels.length);

      const config = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Status',
            data: data,
            backgroundColor: [...chartColors],
            borderColor: '#1f1f1f',
            borderWidth: 5,
            hoverOffset: 15,
            borderRadius: 15,
          }]
        },
        options: {
          cutout: '55%',
          responsive: true,
          // Hover-Logik für Graustufen
          onHover: (event, elements, chart) => {
            const dataset = chart.data.datasets[0];
            if (elements.length > 0) {
              const activeIdx = elements[0].index;
              dataset.backgroundColor = chartColors.map((color, i) =>
                i === activeIdx ? color : inactiveColor
              );
            } else {
              dataset.backgroundColor = [...chartColors];
            }
            chart.update('none');
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: { display: false }
          }
        },
        plugins: [{
          id: 'centerLabel',
          afterDraw(chart) {
            const ctx = chart.ctx;
            const active = chart.getActiveElements(); // Konsistente Methode zum Abrufen aktiver Elemente

            if (active && active.length) {
              const idx = active[0].index;
              const value = chart.data.datasets[0].data[idx];
              const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1) + '%';
              const label = chart.data.labels[idx];
              const centerX = chart.width / 2;
              const centerY = chart.height / 2;

              ctx.save();
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              // 1. Label
              ctx.font = '18px "Dosis", sans-serif';
              ctx.fillStyle = '#a2bba3';
              ctx.fillText(label, centerX, centerY - 25);

              // 2. Prozentwert
              ctx.font = 'bold 38px "Bebas Neue", sans-serif';
              ctx.fillStyle = 'white';
              ctx.fillText(percentage, centerX, centerY + 5);

              // 3. Total Wert
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