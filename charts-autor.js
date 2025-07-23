// charts-autor.js

const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2zZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=57210249&single=true&output=csv';

async function fetchTopAuthors(limit = 3) {
  const response = await fetch(csvUrl);
  const data = await response.text();

  const rows = data.trim().split('\n').slice(1); // Kopfzeile entfernen
  const entries = rows.map(row => {
    const [author, count] = row.split(',');
    return {
      author: author.trim(),
      count: parseInt(count.trim(), 10)
    };
  });

  // Nach Anzahl absteigend sortieren und auf Top N beschränken
  const topEntries = entries
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const authors = topEntries.map(entry => entry.author);
  const counts = topEntries.map(entry => entry.count);

  return { authors, counts };
}

async function createAuthorChart() {
  const { authors, counts } = await fetchTopAuthors();

  const ctx = document.getElementById('autorChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: authors,
      datasets: [{
        label: 'Anzahl gelesener Bücher',
        data: counts,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 5,
      }]
    },
    options: {
      indexAxis: 'y', // <- Das macht die Balken horizontal
      responsive: true,
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'right',
          color: '#333',
          font: {
            weight: 'bold'
          },
          formatter: Math.round
        },
        legend: { display: false },
        title: {
          display: true,
          text: 'Top 3 Autor:innen (gelesene Bücher)',
          font: {
            size: 18
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

createAuthorChart();
