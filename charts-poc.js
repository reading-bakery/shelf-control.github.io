// charts-poc.js
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('pocChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Farbverläufe für PoC (Index 0 = Grün/Ja, Index 1 = Orange/Nein)
  const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, 0); // Ja (Grün)
  gradient1.addColorStop(0, '#3CB371');
  gradient1.addColorStop(1, '#294e29ff');

  const gradient2 = ctx.createLinearGradient(0, 0, canvas.width, 0); // Nein (Orange)
  gradient2.addColorStop(0, '#ff7256');
  gradient2.addColorStop(1, '#ff4500');

  const originalColors = [gradient1, gradient2];
  const inactiveColor = '#333333'; 

  // URL zu deiner Google Sheets CSV
  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1234038788&single=true&output=csv')
    .then(response => response.text())
    .then(csvText => {
      const parsedData = Papa.parse(csvText, { header: true }).data;
      
      // Filtere die Auswertungstabelle heraus
      const validRows = parsedData.filter(row => row['PoC'] && row['Anzahl'] !== undefined && row['Anzahl'] !== '');

      const labels = validRows.map(row => row['PoC'].trim()); // ["Ja", "Nein"]
      const data = validRows.map(row => parseFloat(row['Anzahl'])); // [12, 89]

      if (data.length === 0) {
        canvas.style.display = 'none';
        return;
      }

      const chartColors = originalColors.slice(0, labels.length);

      const config = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Person of Color',
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
            const active = chart.getActiveElements();

            // Aktiven Index ermitteln (Standard ist 0 = das grüne "Ja"-Segment)
            let idx = 0;
            if (active && active.length > 0) {
              idx = active[0].index;
            }

            const value = chart.data.datasets[0].data[idx];
            const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1) + '%';
            
            // Feste Zuweisung basierend auf der Position/Farbe:
            // Index 0 = Grün = "Ja", Index 1 = Orange = "Nein"
            const label = idx === 0 ? 'Ja' : 'Nein';

            const centerX = chart.width / 2;
            const centerY = chart.height / 2;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.font = '18px "Dosis", sans-serif';
            ctx.fillStyle = '#a2bba3';
            ctx.fillText(label, centerX, centerY - 25);

            ctx.font = 'bold 38px "Bebas Neue", sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText(percentage, centerX, centerY + 5);

            ctx.font = '16px "Dosis", sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText('Total: ' + value, centerX, centerY + 32);

            ctx.restore();
          }
        }]
      };

      new Chart(ctx, config);
    })
    .catch(error => console.error('Fehler beim Laden der PoC-Daten:', error));
});