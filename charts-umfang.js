document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('umfangChart');
  const ctx = canvas.getContext('2d');

  // Farbverläufe erzeugen
  const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient1.addColorStop(0, '#ff7256');
  gradient1.addColorStop(1, '#ff4500');

  const gradient2 = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient2.addColorStop(0, '#3CB371');
  gradient2.addColorStop(1, '#294e29ff');

  const gradient3 = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient3.addColorStop(0, '#63b8ff');
  gradient3.addColorStop(1, '#5e30f5ff');

  const originalGradients = [gradient1, gradient2, gradient3];
  const inactiveColor = '#333333'; 

  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=944857737&single=true&output=csv')
    .then(response => response.text())
    .then(csvText => {
      const parsedData = Papa.parse(csvText, { header: true }).data;
      const labels = parsedData.map(row => row['Umfang']);
      const data = parsedData.map(row => parseFloat(row['Anzahl']));

      const config = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Seitenumfang',
            data: data,
            backgroundColor: [...originalGradients],
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
          onHover: (event, elements, chart) => {
            const dataset = chart.data.datasets[0];
            
            if (elements.length > 0) {
              const activeIdx = elements[0].index;
              // Erzeuge neues Array für die Farben
              dataset.backgroundColor = originalGradients.map((color, i) => 
                i === activeIdx ? color : inactiveColor
              );
            } else {
              // Zurücksetzen auf Original
              dataset.backgroundColor = [...originalGradients];
            }
            
            // WICHTIG: Update triggern, damit die Farben neu gerendert werden
            chart.update(); 
          }
        },
        plugins: [{
          id: 'centerLabel',
          afterDraw(chart) {
            const ctx = chart.ctx;
            const active = chart.getActiveElements();

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
          }
        }]
      };

      new Chart(ctx, config);
    })
    .catch(error => console.error('Fehler:', error));
});