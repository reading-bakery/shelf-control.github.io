(() => {
  const canvas = document.getElementById('daysaudioChart');
  const ctx = canvas.getContext('2d');
  const legendDiv = document.getElementById('legendaudiodays');

  const PIXELS_PER_ROW = 30;
  const PIXEL_SIZE = 20;
  const PIXEL_GAP = 4;
  const RADIUS = 5;

  // Cluster Minuten
  const clusterColors = [
    { max: 60, color: '#4CAF50' },     // grün
    { max: 120, color: '#FFEB3B' },    // gelb
    { max: 180, color: '#2196F3' },    // blau
    { max: 240, color: '#F44336' },    // rot
    { max: Infinity, color: '#9C27B0' } // lila
  ];

  const FONT_FAMILY = "'Dosis', sans-serif";
  const FONT_SIZE = 13;
  let tooltip = null;

  function getColor(value) {
    for (const cluster of clusterColors) {
      if (value <= cluster.max) return cluster.color;
    }
    return '#000';
  }

  async function loadData() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv';
    const res = await fetch(url);
    const text = await res.text();
    return parseCSV(text);
  }

  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const cols = line.split(',');
      let obj = {};
      headers.forEach((h, i) => obj[h] = cols[i]);
      return obj;
    });
  }

  // Gruppieren Minuten pro Tag
  function groupByDay(data) {
    const grouped = {};
    data.forEach(row => {
      if (!row['Zeitstempel'] || !row['Minuten']) return;
      const day = row['Zeitstempel'].slice(0,10);
      const min = Number(row['Minuten']);
      if (isNaN(min)) return;
      grouped[day] = (grouped[day] || 0) + min;
    });
    const sortedDays = Object.keys(grouped).sort();
    return sortedDays.map(day => ({ day, value: grouped[day] }));
  }

  function setCanvasSize(count) {
    const rows = Math.ceil(count / PIXELS_PER_ROW);
    canvas.width = PIXELS_PER_ROW * (PIXEL_SIZE + PIXEL_GAP) + PIXEL_GAP;
    canvas.height = rows * (PIXEL_SIZE + PIXEL_GAP) + PIXEL_GAP + 40;
  }

  function drawPixel(x, y, color, isHovered) {
    ctx.fillStyle = color;
    const px = x * (PIXEL_SIZE + PIXEL_GAP) + PIXEL_GAP;
    const py = y * (PIXEL_SIZE + PIXEL_GAP) + PIXEL_GAP;
    ctx.beginPath();
    ctx.moveTo(px + RADIUS, py);
    ctx.lineTo(px + PIXEL_SIZE - RADIUS, py);
    ctx.quadraticCurveTo(px + PIXEL_SIZE, py, px + PIXEL_SIZE, py + RADIUS);
    ctx.lineTo(px + PIXEL_SIZE, py + PIXEL_SIZE - RADIUS);
    ctx.quadraticCurveTo(px + PIXEL_SIZE, py + PIXEL_SIZE, px + PIXEL_SIZE - RADIUS, py + PIXEL_SIZE);
    ctx.lineTo(px + RADIUS, py + PIXEL_SIZE);
    ctx.quadraticCurveTo(px, py + PIXEL_SIZE, px, py + PIXEL_SIZE - RADIUS);
    ctx.lineTo(px, py + RADIUS);
    ctx.quadraticCurveTo(px, py, px + RADIUS, py);
    ctx.closePath();
    ctx.fill();

    if (isHovered) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  function drawLegend() {
    legendDiv.innerHTML = '';
    const legendItems = [
      { color: '#4CAF50', label: '0-60' },
      { color: '#FFEB3B', label: '61-120' },
      { color: '#2196F3', label: '121-180' },
      { color: '#F44336', label: '181-240' },
      { color: '#9C27B0', label: '241+' }
    ];
    legendDiv.style.fontFamily = FONT_FAMILY;
    legendDiv.style.fontSize = FONT_SIZE + 'px';
    legendDiv.style.display = 'flex';
    legendDiv.style.justifyContent = 'center';
    legendDiv.style.gap = '15px';
    legendDiv.style.marginTop = '10px';

    legendItems.forEach(item => {
      const span = document.createElement('span');
      span.style.display = 'flex';
      span.style.alignItems = 'center';
      span.style.gap = '6px';

      const box = document.createElement('div');
      box.style.width = '20px';
      box.style.height = '20px';
      box.style.backgroundColor = item.color;
      box.style.borderRadius = '5px';
      span.appendChild(box);

      const label = document.createElement('span');
      label.textContent = item.label;
      span.appendChild(label);

      legendDiv.appendChild(span);
    });
  }

  function drawTooltip(text, x, y) {
    if (!text) return;
    ctx.save();
    ctx.font = `bold ${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textBaseline = 'top';

    const padding = 6;
    const metrics = ctx.measureText(text);
    const w = metrics.width + padding * 2;
    const h = FONT_SIZE + padding * 2;

    let tx = x;
    let ty = y - h - 10;
    if (tx + w > canvas.width) tx = canvas.width - w - 5;
    if (ty < 0) ty = y + 10;

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(tx, ty, w, h);

    ctx.fillStyle = 'white';
    ctx.fillText(text, tx + padding, ty + padding);

    ctx.restore();
  }

  function render(data, hoverIndex = -1) {
    setCanvasSize(data.length);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.forEach(({ value }, i) => {
      const x = i % PIXELS_PER_ROW;
      const y = Math.floor(i / PIXELS_PER_ROW);
      const color = getColor(value);
      drawPixel(x, y, color, i === hoverIndex);
    });

    drawLegend();

    if (hoverIndex >= 0 && data[hoverIndex]) {
      const x = (hoverIndex % PIXELS_PER_ROW) * (PIXEL_SIZE + PIXEL_GAP) + PIXEL_GAP;
      const y = Math.floor(hoverIndex / PIXELS_PER_ROW) * (PIXEL_SIZE + PIXEL_GAP) + PIXEL_GAP;
      const { day, value } = data[hoverIndex];
      drawTooltip(`${day}\nMinuten: ${value}`, x, y);
    }
  }

  function onMouseMove(e, data) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

// Pixel Position bestimmen
    for (let i = 0; i < data.length; i++) {
      const x = i % PIXELS_PER_ROW;
      const y = Math.floor(i / PIXELS_PER_ROW);
      const px = x * (PIXEL_SIZE + PIXEL_GAP) + PIXEL_GAP;
      const py = y * (PIXEL_SIZE + PIXEL_GAP) + PIXEL_GAP;
      if (mx >= px && mx <= px + PIXEL_SIZE && my >= py && my <= py + PIXEL_SIZE) {
        if (hoverIndex !== i) {
          hoverIndex = i;
          render(data, hoverIndex);
        }
        return;
      }
    }
    if (hoverIndex !== -1) {
      hoverIndex = -1;
      render(data);
    }
  }

  // Initialisierung
  let hoverIndex = -1;
  loadData()
    .then(rawData => {
      const grouped = groupByDay(rawData);
      render(grouped);
      canvas.addEventListener('mousemove', e => onMouseMove(e, grouped));
      canvas.addEventListener('mouseleave', () => {
        hoverIndex = -1;
        render(grouped);
      });
    });
})();

