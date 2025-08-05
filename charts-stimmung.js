document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('stimmungChart');
  const ctx = canvas.getContext('2d');

  const gradients = [];

  const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient1.addColorStop(0, '#ff7256');
  gradient1.addColorStop(1, '#ff4500');
  gradients.push(gradient1);

  const gradient2 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient2.addColorStop(0, '#3CB371');
  gradient2.addColorStop(1, '#294e29ff');
  gradients.push(gradient2);

  const gradient3 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient3.addColorStop(0, '#f663d6ff');
  gradient3.addColorStop(1, '#560746ff');
  gradients.push(gradient3);

  const gradient4 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient4.addColorStop(0, '#FFB90F');
  gradient4.addColorStop(1, '#a87806ff');
  gradients.push(gradient4);

  const gradient5 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient5.addColorStop(0, '#9370DB');
  gradient5.addColorStop(1, '#d7cbefff');
  gradients.push(gradient5);

  const gradient6 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient6.addColorStop(0, '#20B2AA');
  gradient6.addColorStop(1, '#8bacabff');
  gradients.push(gradient6);

  const gradient7 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient7.addColorStop(0, '#da0d1aff');
  gradient7.addColorStop(1, '#c6757aff');
  gradients.push(gradient7);

  const gradient8 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient8.addColorStop(0, '#160537ff');
  gradient8.addColorStop(1, '#b49be5ff');
  gradients.push(gradient8);

  const gradient9 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient9.addColorStop(0, '#63b8ff');
  gradient9.addColorStop(1, '#7c9c7fff');
  gradients.push(gradient9);

  const gradient10 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient10.addColorStop(0, '#ecebe3ff');
  gradient10.addColorStop(1, '#ada777ff');
  gradients.push(gradient10);

  const gradient11 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient11.addColorStop(0, '#21afd7ff');
  gradient11.addColorStop(1, '#abb2b4ff');
  gradients.push(gradient11);

  const gradient12 = ctx.createLinearGradient(0, 0, canvas.width, 0); 
  gradient12.addColorStop(0, '#ac7975ff');
  gradient12.addColorStop(1, '#430b07ff');
  gradients.push(gradient12);

  // CSV-Daten laden
  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=282362445&single=true&output=csv')
    .then(response => response.text())
    .then(csvText => {
      const parsedData = Papa.parse(csvText, { header: true }).data;

      // Nur Werte mit Anzahl > 0 berücksichtigen
      const filtered = parsedData.filter(row => parseFloat(row['Anzahl']) > 0);

      const labels = filtered.map(row => row['Stimmung']);
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
            label: 'Stimmung',
            data: data,
            backgroundColor: gradients.slice(0, labels.length),
            borderColor: '#1f1f1f',
            borderWidth: 10,
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
            const active = chart.tooltip._active;

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

              ctx.fillText(label, centerX, centerY - 12);
              ctx.font = '22px Dosis, sans-serif';
              ctx.fillText(percentage, centerX, centerY + 14);

              ctx.restore();
            }
          }
        }]
      };

      new Chart(ctx, config);
    })
    .catch(error => console.error('Fehler beim Laden der CSV-Daten:', error));
});
