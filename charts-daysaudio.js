(() => {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv";

  const legendItems = [
    { color: "#ff7256", label: "≤ 60" },
    { color: "#FFB90F", label: "≤ 120" },
    { color: "#3CB371", label: "≤ 180" },
    { color: "#63b8ff", label: "≤ 240" },
    { color: "#9370DB", label: "≥ 241" }
  ];

  function getColor(value) {
    if (value <= 60) return "#ff7256";
    if (value <= 120) return "#FFB90F";
    if (value <= 180) return "#3CB371";
    if (value <= 240) return "#63b8ff";
    return "#9370DB";
  }

  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const minutesPerDate = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.includes(';') ? line.split(';') : line.split(',');
      if (parts.length < 4) continue;

      const dateRaw = parts[0].trim();
      const date = dateRaw.split(' ')[0];
      const minutes = parseInt(parts[3].trim().replace(/\D/g, ''));
      if (isNaN(minutes) || minutes <= 0) continue;

      if (!minutesPerDate[date]) minutesPerDate[date] = 0;
      minutesPerDate[date] += minutes;
    }

    return Object.entries(minutesPerDate)
      .map(([date, minutes]) => ({ date, pages: minutes }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function roundRect(ctx, x, y, width, height, radius = 5) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  let hoverIndex = -1;
  let hoverPos = { x: 0, y: 0 };
  let hoverData = null;

  function drawSquares(data) {
    const canvas = document.getElementById("daysaudioChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const squareSize = 20;
    const gap = 4;
    const squaresPerRow = 20;

    const rows = Math.ceil(data.length / squaresPerRow);

    const widthCSS = squaresPerRow * (squareSize + gap) + gap;
    const heightCSS = rows * (squareSize + gap) + gap;

    canvas.width = widthCSS * dpr;
    canvas.height = heightCSS * dpr;
    canvas.style.width = widthCSS + "px";
    canvas.style.height = heightCSS + "px";

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, widthCSS, heightCSS);

    if (data.length === 0) {
      ctx.fillStyle = "#000";
      ctx.font = "16px Arial";
      ctx.fillText("Keine Daten zum Anzeigen", 10, 50);
      return;
    }

    data.forEach((item, index) => {
      const x = gap + (index % squaresPerRow) * (squareSize + gap);
      const y = gap + Math.floor(index / squaresPerRow) * (squareSize + gap);

      ctx.fillStyle = getColor(item.pages);
      roundRect(ctx, x, y, squareSize, squareSize, 5);
      ctx.fill();

      if (index === hoverIndex) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = "#1f1f1f";
        ctx.lineWidth = 1;
      }
      roundRect(ctx, x, y, squareSize, squareSize, 5);
      ctx.stroke();
    });

    // Tooltip im Canvas zeichnen
    if (hoverIndex !== -1 && hoverData) {
      const padding = 8;
      const lineHeight = 18;
      const textLines = [
        `${hoverData.date}`,
        `${hoverData.pages} Minuten`
      ];

      ctx.font = "13px Dosis, sans-serif";
      ctx.textBaseline = "top";

      // Max Textbreite ermitteln
      let maxWidth = 0;
      textLines.forEach(line => {
        const w = ctx.measureText(line).width;
        if (w > maxWidth) maxWidth = w;
      });

      const tooltipWidth = maxWidth + padding * 2;
      const tooltipHeight = lineHeight * textLines.length + padding * 2;

      const squareCenterX = hoverPos.x + squareSize / 2;
      const squareTopY = hoverPos.y;

      // Tooltip über Quadrat positionieren
      let tooltipX = squareCenterX - tooltipWidth / 2;
      let tooltipY = squareTopY - tooltipHeight - 6; // 6px Abstand

      // Begrenzungen prüfen, damit Tooltip nicht aus Canvas raus geht
      if (tooltipX < gap) tooltipX = gap;
      if (tooltipX + tooltipWidth > canvas.width / dpr - gap) {
        tooltipX = canvas.width / dpr - tooltipWidth - gap;
      }

      // Wenn oben kein Platz, Tooltip unter das Quadrat setzen
      if (tooltipY < gap) {
        tooltipY = squareTopY + squareSize + 6;
      }

      // Hintergrund Tooltip
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      roundRect(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, 5);
      ctx.fill();

      // Text Tooltip
      ctx.fillStyle = "white";
      textLines.forEach((line, i) => {
        ctx.fillText(line, tooltipX + padding, tooltipY + padding + i * lineHeight);
      });
    }
  }

  function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (evt.clientX - rect.left) * (canvas.width / rect.width) / dpr,
      y: (evt.clientY - rect.top) * (canvas.height / rect.height) / dpr
    };
  }

  function setupHover(data) {
    const canvas = document.getElementById("daysaudioChart");
    if (!canvas) return;

    const squareSize = 20;
    const gap = 4;
    const squaresPerRow = 20;

    canvas.addEventListener("mousemove", (evt) => {
      const pos = getMousePos(canvas, evt);

      const col = Math.floor((pos.x - gap) / (squareSize + gap));
      const row = Math.floor((pos.y - gap) / (squareSize + gap));
      const index = row * squaresPerRow + col;

      if (
        col < 0 || col >= squaresPerRow ||
        row < 0 || index >= data.length ||
        pos.x < gap || pos.y < gap ||
        pos.x > gap + squaresPerRow * (squareSize + gap) ||
        pos.y > gap + Math.ceil(data.length / squaresPerRow) * (squareSize + gap)
      ) {
        if (hoverIndex !== -1) {
          hoverIndex = -1;
          hoverData = null;
          drawSquares(data);
        }
        return;
      }

      if (hoverIndex !== index) {
        hoverIndex = index;
        hoverData = data[index];
        hoverPos.x = gap + col * (squareSize + gap);
        hoverPos.y = gap + row * (squareSize + gap);
        drawSquares(data);
      }
    });

    canvas.addEventListener("mouseleave", () => {
      hoverIndex = -1;
      hoverData = null;
      drawSquares(data);
    });
  }

  fetch(csvUrl)
    .then(res => res.text())
    .then(text => {
      const data = parseCSV(text);
      drawSquares(data);
      setupHover(data);
    })
    .catch(err => {
      console.error("Fehler beim Laden der CSV-Daten:", err);
    });
})();
