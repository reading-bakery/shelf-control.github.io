const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=486311532&single=true&output=csv';

async function loadAndDrawChart() {
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        const rows = csvText.trim().split('\n').map(row => row.split(','));

        const months = rows.slice(1).map(row => row[0]);
        const allYears = rows[0].slice(1);

        // 🎨 Nur diese drei Jahre anzeigen, in genau dieser Reihenfolge
        const wantedYears = ['2025', '2026', '2027'];

        const farben = {
            '2025': '	#ff7256', 
            '2026': '#FFB90F', 
            '2027': '	#63b8ff'  
        };

        // Filtere nur die Spalten der gewünschten Jahre raus
        const yearIndices = wantedYears.map(year => allYears.indexOf(year)).filter(idx => idx !== -1);

        const datasets = yearIndices.map(colIndex => {
            const year = allYears[colIndex];
            const data = rows.slice(1).map(row => {
                const val = parseInt(row[colIndex + 1]);
                return isNaN(val) ? null : val;
            });
            const color = farben[year]; // Kein fallback mehr
            return {
                label: year,
                data,
                borderColor: color,
                backgroundColor: color,
                fill: false,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 0,
                hoverRadius: 0,
                hoverBackgroundColor: color
            };
        });

        const ctx = document.getElementById('subChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: datasets
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                interaction: {
                    mode: null
                },
                hover: {
                    mode: null
                },
                plugins: {
                    datalabels: {
                        display: true,
                        color: '#fff',
                        font: {
                            family: 'Dosis, sans-serif',
                            size: 8
                        },
                        align: 'top',
                        anchor: 'end'
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            font: {
                                family: 'Dosis, sans-serif',
                                size: 12,
                                weight: 'normal'
                            }
                        }
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#fff',
                            font: {
                                family: 'Dosis, sans-serif',
                                size: 12
                            },
                            maxRotation: 0,
                            minRotation: 0
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: false
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    } catch (err) {
        console.error('Fehler beim Laden des Sub-Charts:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadAndDrawChart);
