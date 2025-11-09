document.addEventListener('DOMContentLoaded', () => {
    const DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv';
    const PIXELS_PER_ROW = 25;
    const PIXEL_SIZE = 20;
    const GAP = 6;

    const canvas = document.getElementById('daysChart');
    const legendDiv = document.getElementById('legenddays');
    if (!canvas || !legendDiv) {
        console.error('Canvas or legend element not found for daysChart.');
        return;
    }
    const ctx = canvas.getContext('2d');

    let aggregatedData = {};
    let pixelPositions = [];

    function fetchData() {
        fetch(DATA_URL)
            .then(response => response.text())
            .then(csv => {
                parseCSV(csv);
                drawChart();
                drawLegend();
            })
            .catch(error => console.error('Error fetching data for daysChart:', error));
    }

    function parseCSV(csv) {
        const lines = csv.split('\n');
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const columns = line.split(',');
            if (columns.length >= 2) {
                const timestampStr = columns[0].trim();
                const pages = parseInt(columns[2].trim(), 10);
                const datePart = timestampStr.split(' ')[0];

                if (!isNaN(pages)) {
                    if (!aggregatedData[datePart]) {
                        aggregatedData[datePart] = 0;
                    }
                    aggregatedData[datePart] += pages;
                }
            }
        }
    }

    // 🧩 Chronologische Sortierung für deutsches Datumsformat (TT.MM.JJJJ)
    function sortDates(dates) {
        return dates.sort((a, b) => {
            const [dayA, monthA, yearA] = a.split(/[.\-/]/).map(Number);
            const [dayB, monthB, yearB] = b.split(/[.\-/]/).map(Number);
            return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        });
    }

    function getColorForPages(pages) {
        if (pages >= 0 && pages <= 50) return '#ff7256';
        if (pages >= 51 && pages <= 75) return '#FFB90F';
        if (pages >= 76 && pages <= 100) return '#63b8ff';
        if (pages >= 101 && pages <= 150) return '#3CB371';
        if (pages >= 151) return '#9370DB';
        return '#CCCCCC';
    }

    function drawChart() {
        const dates = sortDates(Object.keys(aggregatedData)); // ✅ hier wird korrekt sortiert
        const totalPixels = dates.length;
        const totalRows = Math.ceil(totalPixels / PIXELS_PER_ROW);

        canvas.width = (PIXEL_SIZE + GAP) * PIXELS_PER_ROW - GAP;
        canvas.height = (PIXEL_SIZE + GAP) * totalRows - GAP;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pixelPositions = [];

        dates.forEach((date, index) => {
            const pages = aggregatedData[date];
            const color = getColorForPages(pages);

            const row = Math.floor(index / PIXELS_PER_ROW);
            const col = index % PIXELS_PER_ROW;
            const x = col * (PIXEL_SIZE + GAP);
            const y = row * (PIXEL_SIZE + GAP);

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x, y, PIXEL_SIZE, PIXEL_SIZE, 5);
            ctx.fill();

            pixelPositions.push({
                x,
                y,
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                date,
                value: pages
            });
        });
    }

    function drawLegend() {
        const legendItems = [
            { label: '≤ 50', color: '#ff7256' },
            { label: '≤ 75', color: '#FFB90F' },
            { label: '≤ 100', color: '#63b8ff' },
            { label: '≤ 150', color: '#3CB371' },
            { label: '≥ 151', color: '#9370DB' },
        ];

        legendDiv.style.display = 'flex';
        legendDiv.style.flexWrap = 'wrap';
        legendDiv.style.justifyContent = 'center';
        legendDiv.style.marginTop = '10px';
        legendDiv.style.fontFamily = 'Dosis, sans-serif';
        legendDiv.style.fontSize = '13px';
        legendDiv.innerHTML = '';

        legendItems.forEach(item => {
            const span = document.createElement('span');
            span.style.display = 'flex';
            span.style.alignItems = 'center';
            span.style.marginRight = '15px';
            span.style.marginBottom = '5px';

            const colorBox = document.createElement('span');
            colorBox.style.display = 'inline-block';
            colorBox.style.width = '12px';
            colorBox.style.height = '12px';
            colorBox.style.backgroundColor = item.color;
            colorBox.style.marginRight = '5px';
            colorBox.style.borderRadius = '3px';

            span.appendChild(colorBox);
            span.appendChild(document.createTextNode(item.label));
            legendDiv.appendChild(span);
        });
    }

    let tooltip = null;

    function showTooltip(x, y, date, value, event, pixel) {
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.style.position = 'absolute';
            tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '8px 12px';
            tooltip.style.borderRadius = '5px';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '1000';
            tooltip.style.fontFamily = 'Dosis, sans-serif';
            tooltip.style.fontSize = '14px';
            document.body.appendChild(tooltip);
        }

        tooltip.innerHTML = `<b>${date}</b><br>${value} Seiten`;

        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        const margin = 10;
        const canvasRect = canvas.getBoundingClientRect();

        let tooltipX = canvasRect.left + pixel.x + pixel.width + margin;
        let tooltipY = canvasRect.top + pixel.y;

        if (tooltipX + tooltipWidth > canvasRect.right)
            tooltipX = canvasRect.left + pixel.x - tooltipWidth - margin;

        if (tooltipX < canvasRect.left) {
            tooltipX = canvasRect.left + pixel.x;
            tooltipY = canvasRect.top + pixel.y + pixel.height + margin;
            if (tooltipY + tooltipHeight > canvasRect.bottom)
                tooltipY = canvasRect.top + pixel.y - tooltipHeight - margin;
        }

        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
        tooltip.style.display = 'block';
    }

    function hideTooltip() {
        if (tooltip) tooltip.style.display = 'none';
    }

    let hoveredPixel = null;

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        let foundPixel = null;
        for (const pixel of pixelPositions) {
            if (mouseX >= pixel.x && mouseX <= pixel.x + pixel.width &&
                mouseY >= pixel.y && mouseY <= pixel.y + pixel.height) {
                foundPixel = pixel;
                break;
            }
        }

        if (foundPixel) {
            if (hoveredPixel !== foundPixel) {
                drawChart();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.roundRect(foundPixel.x, foundPixel.y, foundPixel.width, foundPixel.height, 5);
                ctx.stroke();

                showTooltip(foundPixel.x, foundPixel.y, foundPixel.date, foundPixel.value, event, foundPixel);
                hoveredPixel = foundPixel;
            }
        } else {
            if (hoveredPixel) {
                drawChart();
                hideTooltip();
                hoveredPixel = null;
            }
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (hoveredPixel) {
            drawChart();
            hideTooltip();
            hoveredPixel = null;
        }
    });

    fetchData();
});
