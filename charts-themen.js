document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('themenChart');
  const ctx = canvas.getContext('2d');

  const gradients = [];

  const createGradient = (start, end) => {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    gradients.push(gradient);
  };

  // 13 Farbverläufe
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

  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=498241349&single=true&output=csv')
    .then(response => response.text())
    .then(csvText => {
      const parsedData = Papa.parse(csvText, { header: true }).data;

      const filtered = parsedData
        .filter(row => parseFloat(row['Anzahl']) > 0)
        .sort((a, b) => parseFloat(b['Anzahl']) - parseFloat(a['Anzahl']))
        .slice(0, 10); // Top 10

      const labels = filtered.map(row => row['Thema']);
      const data = filtered.map(row => parseFloat(row['Anzahl']));

      if (data.length === 0) {
        canvas.style.display = 'none';
        return;
      }

      const config = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Thema',
            data: data,
            backgroundColor: gradients.slice(0, labels.length),
            borderColor: '#1f1f1f',
            borderWidth: 6,
            hoverOffset: 12,
            borderRadius: 12
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
