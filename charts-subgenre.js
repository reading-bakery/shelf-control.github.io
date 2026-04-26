document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('subgenreChart');
  const ctx = canvas.getContext('2d');

  // Farbverläufe vorbereiten
  const gradients = [];
  const inactiveColor = '#333333';

  // Hilfsfunktion zum Hinzufügen der Gradients (erhöht die Übersichtlichkeit)
  const addGradient = (c1, c2) => {
    const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    gradients.push(g);
  };

  addGradient('#ff7256', '#ff4500');
  addGradient('#3CB371', '#294e29ff');
  addGradient('#f663d6ff', '#560746ff');
  addGradient('#FFB90F', '#a87806ff');
  addGradient('#9370DB', '#d7cbefff');
  addGradient('#20B2AA', '#8bacabff');
  addGradient('#da0d1aff', '#c6757aff');
  addGradient('#160537ff', '#b49be5ff');
  addGradient('#63b8ff', '#7c9c7fff');
  addGradient('#5ea237ff', '#d8ebdaff');
  addGradient('#d43e91ff', '#dba9cdff');
  addGradient('#071eccff', '#bdb9dbff');

  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=999478679&single=true&output=csv')
    .then(response => response.text())
    .then(csvText => {
      const parsedData = Papa.parse(csvText, { header: true }).data;
      const filtered = parsedData.filter(row => parseFloat(row['Anzahl']) > 0);

      const labels = filtered.map(row => row['Sub-Genre']);
      const data = filtered.map(row => parseFloat(row['Anzahl']));

      if (data.length === 0) {
        canvas.style.display = 'none';
        return;
      }

      const chartColors = gradients.slice(0, labels.length);

      const config = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Sub-Genre',
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
    .catch(error => console.error('Fehler beim Laden der CSV-Daten:', error));
});