const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=486311532&single=true&output=csv';

async function loadAndDrawChart() {
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        const rows = csvText.trim().split('\n').map(row => row.split(','));

        const months = rows.slice(1).map(row => row[0]);
        const allYears = rows[0].slice(1);

        const wantedYears = ['2025', '2026', '2027'];

        const farben = {
            '2025': '#ff7256',
            '2026': '#FFB90F',
            '2027': '#63b8ff'
        };

        const yearIndices = wantedYears.map(year => allYears.indexOf(year)).filter(idx => idx !== -1);

        const datasets = yearIndices.map(colIndex => {
            const year = allYears[colIndex];
            const data = rows.slice(1).map(row => {
                const val = parseInt(row[colIndex + 1]);
                return isNaN(val) ? null : val;
            });
            const color = farben[year];
            return {
                label: year,
                data,
                borderColor: color,
                backgroundColor: color,
                fill: false,
                tension: 0.4,
                pointRadius: 5,        // kleiner Punkt normal
                pointHoverRadius: 10,  // größer beim Hover
                hoverRadius: 9,        // bessere Erkennung beim Hover
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
                    mode: 'nearest',
                    intersect: true
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                plugins: {
                    datalabels: {
                        display: true,
                        color: 'white',
                        font: {
                            family: 'Dosis, sans-serif',
                            size: 13
                        },
                        align: 'top',
                        anchor: 'end'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'white',
                            font: {
                                family: 'Dosis, sans-serif',
                                size: 12,
                                weight: 'bold'
                            },
                            boxWidth: 0,              // Kein Kästchen neben Text
                            padding: 12,              // Platz um den Text (macht die Box sichtbar)
                            usePointStyle: true,      // kleine Punkte als Marker (optional)
                            // Text in einer farbigen Box mit runden Ecken - mit Plugin weiter unten
                        }
                    },

                    tooltip: {
                        enabled: false
                    },
                    annotation: {
                        annotations: {
                            ziel: {
                                type: 'line',
                                yMin: 120,
                                yMax: 120,
                                borderColor: 'white',
                                borderWidth: 1,
                                borderDash: [5, 5],
                                label: {
                                    content: 'SuB-Ziel = 120',
                                    enabled: true,
                                    position: 'end',
                                    yAdjust: -10,
                                    color: 'white',
                                    font: {
                                        family: 'Dosis, sans-serif',
                                        size: 15,
                                        weight: 'normal'
                                    },
                                    padding: 0,
                                    cornerRadius: 0,
                                    backgroundColor: 'transparent'
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#fff',
                            font: {
                                family: 'Dosis, sans-serif',
                                size: 16
                            },
                            maxRotation: 0,
                            minRotation: 0
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: false,
                        min: 115,
                        max: 155,
                        ticks: {
                            color: '#fff',
                            font: {
                                family: 'Dosis, sans-serif',
                                size: 16
                            }
                        },
                        grid: {
                            display: false
                        }
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
