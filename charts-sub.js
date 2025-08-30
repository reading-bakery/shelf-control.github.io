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

        let activeIndex = null;  // Hover (auch für Achsenhover)
        let clickedIndex = null; // Klick auf Monatsname

        // Datasets vorbereiten
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
                pointRadius: ctx => {
                    const i = ctx.dataIndex;
                    return (i === activeIndex || i === clickedIndex) ? 7 : 5;
                },
                pointHoverRadius: 10,
                hoverRadius: 9,
                hoverBackgroundColor: color
            };
        });

        const ctx = document.getElementById('subChart').getContext('2d');

        const chart = new Chart(ctx, {
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
                onClick: (event) => {
                    const xAxis = chart.scales.x;
                    const x = event.offsetX;
                    const index = Math.round(xAxis.getValueForPixel(x));
                    if (index >= 0 && index < months.length) {
                        clickedIndex = (clickedIndex === index) ? null : index;
                        chart.update('none');
                    }
                },
                onHover: (event) => {
                    const xAxis = chart.scales.x;
                    const yAxis = chart.scales.y;
                    const x = event.offsetX;
                    const y = event.offsetY;

                    const index = Math.round(xAxis.getValueForPixel(x));
                    if (
                        index >= 0 && index < months.length &&
                        y > yAxis.bottom && y < yAxis.bottom + 30 // grob unter X-Achse
                    ) {
                        activeIndex = index;
                    } else {
                        // prüfe normalen Hover auf Punkte
                        const elements = chart.getElementsAtEventForMode(event, 'nearest', {intersect: true}, false);
                        if (elements.length > 0) {
                            activeIndex = elements[0].index;
                        } else {
                            activeIndex = null;
                        }
                    }
                    chart.update('none');
                },
                plugins: {
                    datalabels: {
                        display: ctx => activeIndex === null || ctx.dataIndex === activeIndex,
                        color: 'white',
                        font: ctx => ({
                            family: 'Dosis, sans-serif',
                            size: 13,
                            weight: ctx.dataIndex === activeIndex ? 'bold' : 'normal'
                        }),
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
                                weight: 'normal'
                            },
                            boxWidth: 50,
                            padding: 10,
                            usePointStyle: true
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
                                        size: 15
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
                            // Hier: Farbe dynamisch setzen je nach Hover-Index und Linienfarbe
                            color: ctx => {
                                // Wenn Hover auf diesem Tick
                                if (activeIndex === null) return '#fff'; // kein Hover, weiß

                                if (ctx.index === activeIndex) {
                                    // Suche im datasets-Array nach der ersten Linie, die für diesen Monat einen Wert hat
                                    for (let ds of datasets) {
                                        if (ds.data[ctx.index] !== null && ds.data[ctx.index] !== undefined) {
                                            return ds.borderColor; // Linienfarbe als Tickfarbe
                                        }
                                    }
                                    return '#fff'; // fallback weiß, falls keine Daten
                                }
                                return '#fff'; // andere Ticks bleiben weiß
                            },
                            font: ctx => ({
                                family: 'Dosis, sans-serif',
                                size: 16,
                                weight: ctx.index === activeIndex ? 'bold' : 'normal'
                            }),
                            maxRotation: 0,
                            minRotation: 0
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: false,
                        min: 118,
                        max: 155,
                        ticks: {
                            color: 'white',
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