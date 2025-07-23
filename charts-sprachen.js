document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1635103848&single=true&output=csv';

  const labelMap = {
    'Deutsch': 'DEU',
    'Spanisch': 'SPA',
    'Englisch Original': 'EN O',
    'Französisch': 'FRA',
    'Italienisch': 'ITA',
    'Chinesisch': 'CHI',
    'Russisch': 'RUS',
    'Koreanisch': 'KOR',
    'Japanisch': 'JAP',
    'Portugiesisch': 'POR',
    'Türkisch': 'TÜR',
    'Spanisch Original': 'SPA O',
    'Französisch Original': 'FRA O',
    'Englisch': 'ENG'
  };

  fetch(csvUrl)
    .then(response => response.text())
    .then(csv => {
      const rows = csv.trim().split('\n').slice(1);
      const sprachen = [];
      const anzahl = [];

      rows.forEach(row => {
        let [sprache, count] = row.split(',');
        if (sprache && count) {
          sprache = sprache.trim();
          const label = labelMap[sprache] || sprache;
          sprachen.push(label);
          anzahl.push(Number(count));
        }
      });

      const ctx = document.getElementById('sprachenChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sprachen,
          datasets: [{
            label: 'Anzahl',
            data: anzahl,
            backgroundColor: [
              '#F03274', 
              '#4CC5D2', 
              '#E67E22', 
              '#2ECC71', 
              'rgba(153, 102, 255, 0.7)'
            ],
            borderColor: [
              '#1f1f1f', 
              '#1f1f1f', 
              '#1f1f1f', 
              '#1f1f1f', 
              '#1f1f1f'
            ],
            borderWidth: 10,
            borderRadius: 15,
            barThickness: 50
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: { enabled: false },
            datalabels: {
              anchor: 'end',    
              align: 'end',      
              color: '#fff',
              font: { weight: 'bold' },
              formatter: Math.round,
              padding: { left: 10 }, 
              clamp: true
            }
          },
          scales: {
            y: {
              ticks: { color: '#fff' },
              grid: { display: false }
            },
            x: {
              display: false,
              beginAtZero: true,
              min: 0,
              // Optional: etwas mehr Platz nach rechts, je nach max Wert
              suggestedMax: Math.max(...anzahl) * 1.1 
            }
          },
          interaction: {
            mode: null
          }
        },
        plugins: [ChartDataLabels]
      });
    })
    .catch(error => {
      console.error('Fehler beim Laden der Sprachdaten:', error);
    });
});
