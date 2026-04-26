document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('stimmungChart');
  const ctx = canvas.getContext('2d');

  const gradients = [];
  const inactiveColor = '#333333';

  const createGradient = (start, end) => {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    gradients.push(gradient);
  };

  // Definition der 13 verfügbaren Farbverläufe
  createGradient('#ff7256', '#ff4500');
  createGradient('#3CB371', '#294e29ff');
  createGradient('#f663d6ff', '#560746ff');
  createGradient('#FFB90F', '#a87806ff');
  createGradient('#9370DB', '#d7cbefff');
  createGradient('#20B2AA', '#8bacabff');
  createGradient('#da0d1aff', '#c6757aff');
  createGradient('#160537ff', '#b49be5ff');
  createGradient('#63b8ff', '#7c9c7fff');
  createGradient('#ecebe3ff', '#ada777ff');
  createGradient('#21afd7ff', '#abb2b4ff');
  createGradient('#ac7975ff', '#430b07ff');
  createGradient('#bbddff', '#005577');

  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=282362445&single=true&output=csv')
    .then(response => response.text())
    .then(csvText => {
      const parsedData = Papa.parse(csvText, { header: true }).data;

      const filtered = parsedData
        .filter(row => parseFloat(row['Anzahl']) > 0)
        .sort((a, b) => parseFloat(b['Anzahl']) - parseFloat(a['Anzahl']))
        .slice(0, 10); // Nur Top 10 anzeigen

      const labels = filtered.map(row => row['Stimmung']);
      const data = filtered.map(row => parseFloat(row['Anzahl']));

      if (data.length === 0) {
        canvas.style.display = 'none';
        return;
      }

      // Farben passend zu den gefilterten Labels extrahieren
      const chartColors = gradients.slice(0, labels.length);

      const config = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Stimmung',
            data: data,
            backgroundColor: [...chartColors],
            borderColor: '#1f1f1f',
            borderWidth: 6,
            hoverOffset: 12,
            borderRadius: 12
          }]
        },
        options: {
          cutout: '55%',
          responsive: true,
          // Hover-Effekt: Inaktive Segmente werden grau
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
            const centerX = chart.width / 2;
            const centerY = chart.height / 2;
            const active = chart.getActiveElements();

            if (active && active.length > 0) {
              const idx = active[0].index;
              const value = chart.data.datasets[0].data[idx];
              const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1) + '%';
              const label = chart.data.labels[idx];

              ctx.save();
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              // 1. Kategorie Label
              ctx.font = '18px "Dosis", sans-serif';
              ctx.fillStyle = '#a2bba3';
              ctx.fillText(label, centerX, centerY - 25);

              // 2. Großer Prozentwert
              ctx.font = 'bold 38px "Bebas Neue", sans-serif';
              ctx.fillStyle = 'white';
              ctx.fillText(percentage, centerX, centerY + 5);

              // 3. Absolute Anzahl
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