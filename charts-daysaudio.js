document.addEventListener('DOMContentLoaded', () => {
    const DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv';
    const PIXELS_PER_ROW = 25;
    const PIXEL_SIZE = 20; // Example size, adjust as needed
    const GAP = 6; // Gap between pixels

    const canvas = document.getElementById('daysaudioChart');
    const legendDiv = document.getElementById('legendaudiodays');
    if (!canvas || !legendDiv) {
        console.error('Canvas or legend element not found for daysaudioChart.');
        return;
    }
    const ctx = canvas.getContext('2d');

    let aggregatedData = {}; // To store aggregated minutes per day
    let pixelPositions = []; // To store position and data for hover

    function fetchData() {
        fetch(DATA_URL)
            .then(response => response.text())
            .then(csv => {
                parseCSV(csv);
                drawChart();
                drawLegend();
            })
            .catch(error => console.error('Error fetching data for daysaudioChart:', error));
    }

    function parseCSV(csv) {
        const lines = csv.split('\n');
        // Assuming first line is header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const columns = line.split(',');
            if (columns.length >= 4) {
                const timestampStr = columns[0].trim();
                const minutes = parseInt(columns[3].trim(), 10); // Column 'Minuten'

                // Extract date part (YYYY-MM-DD)
                const datePart = timestampStr.split(' ')[0];

                if (!isNaN(minutes)) {
                    if (!aggregatedData[datePart]) {
                        aggregatedData[datePart] = 0;
                    }
                    aggregatedData[datePart] += minutes;
                }
            }
        }
    }

    function getColorForMinutes(minutes) {
        if (minutes >= 0 && minutes <= 60) return '#ff7256'; // Grün
        if (minutes >= 61 && minutes <= 120) return '#FFB90F '; // Gelb
        if (minutes >= 121 && minutes <= 180) return '#63b8ff'; // Blau
        if (minutes >= 181 && minutes <= 240) return '#3CB371'; // Rot
        if (minutes >= 241) return '#9370DB '; // Lila
        return '#CCCCCC'; // Default or unknown
    }

    function drawChart() {
        const dates = Object.keys(aggregatedData).sort();
        const totalPixels = dates.length;
        const totalRows = Math.ceil(totalPixels / PIXELS_PER_ROW);

        canvas.width = (PIXEL_SIZE + GAP) * PIXELS_PER_ROW - GAP;
        canvas.height = (PIXEL_SIZE + GAP) * totalRows - GAP;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pixelPositions = [];

        dates.forEach((date, index) => {
            const minutes = aggregatedData[date];
            const color = getColorForMinutes(minutes);

            const row = Math.floor(index / PIXELS_PER_ROW);
            const col = index % PIXELS_PER_ROW;

            const x = col * (PIXEL_SIZE + GAP);
            const y = row * (PIXEL_SIZE + GAP);

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x, y, PIXEL_SIZE, PIXEL_SIZE, 5); // Rounded corners
            ctx.fill();

            pixelPositions.push({
                x: x,
                y: y,
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                date: date,
                value: minutes
            });
        });
    }

    function drawLegend() {
        const legendItems = [{
            label: '≤ 60',
            color: '#ff7256'
        }, {
            label: '≤ 120',
            color: '#FFB90F'
        }, {
            label: '≤ 180',
            color: '#63b8ff'
        }, {
            label: '≤ 240',
            color: '#3CB371'
        }, {
            label: '≥ 241',
            color: '#9370DB'
        }, ];

        legendDiv.style.display = 'flex';
        legendDiv.style.flexWrap = 'wrap';
        legendDiv.style.justifyContent = 'center';
        legendDiv.style.marginTop = '10px';
        legendDiv.style.fontFamily = 'Dosis, sans-serif';
        legendDiv.style.fontSize = '13px';

        legendDiv.innerHTML = ''; // Clear existing legend

        legendItems.forEach(item => {
            const span = document.createElement('span');
            span.style.display = 'flex';
            span.style.alignItems = 'center';
            span.style.marginRight = '15px';
            span.style.marginBottom = '5px'; // For wrapping

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

    // Tooltip functionality
    let tooltip = null;

    function showTooltip(x, y, date, value) {
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.style.position = 'absolute';
            tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '8px 12px';
            tooltip.style.borderRadius = '5px';
            tooltip.style.pointerEvents = 'none'; // So it doesn't block mouse events on canvas
            tooltip.style.zIndex = '1000';
            tooltip.style.fontFamily = 'Dosis, sans-serif'; // Default
            tooltip.style.fontSize = '14px';
            document.body.appendChild(tooltip);
        }

        tooltip.innerHTML = `<b>${date}</b><br>${value} Minuten`;

        // Position tooltip relative to the canvas
        const canvasRect = canvas.getBoundingClientRect();
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;

        let tooltipX = canvasRect.left + x + PIXEL_SIZE / 2 - tooltipWidth / 2;
        let tooltipY = canvasRect.top + y - tooltipHeight - 10; // Above the pixel

        // Keep tooltip within canvas bounds
        if (tooltipX < canvasRect.left) tooltipX = canvasRect.left;
        if (tooltipX + tooltipWidth > canvasRect.right) tooltipX = canvasRect.right - tooltipWidth;
        if (tooltipY < canvasRect.top) tooltipY = canvasRect.top + y + PIXEL_SIZE + 10; // Below if no space above

        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
        tooltip.style.display = 'block';
    }

    function hideTooltip() {
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    let hoveredPixel = null; // Store the currently hovered pixel data

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
                // Redraw chart to clear previous hover effect
                drawChart();
                // Draw new hover effect
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.roundRect(foundPixel.x, foundPixel.y, foundPixel.width, foundPixel.height, 5);
                ctx.stroke();

                showTooltip(foundPixel.x, foundPixel.y, foundPixel.date, foundPixel.value);
                hoveredPixel = foundPixel;
            }
        } else {
            if (hoveredPixel) {
                drawChart(); // Redraw to remove border
                hideTooltip();
                hoveredPixel = null;
            }
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (hoveredPixel) {
            drawChart(); // Redraw to remove border
            hideTooltip();
            hoveredPixel = null;
        }
    });

    fetchData();
});