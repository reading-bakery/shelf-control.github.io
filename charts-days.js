(() => {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv";

  const legendItems = [
    { color: "#ff7256", label: "≤ 50" },
    { color: "#FFB90F", label: "≤ 70" },
    { color: "#3CB371", label: "≤ 100" },
    { color: "#63b8ff", label: "≤ 150" },
    { color: "#9370DB", label: "≥ 151" }
  ];

  function getColor(value) {
    if (value <= 50) return "#ff7256";
    if (value <= 70) return "#FFB90F";
    if (value <= 100) return "#3CB371";
    if (value <= 150) return "#63b8ff";
    return "#9370DB";
  }

  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const pagesPerDate = {};

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].includes(';') ? lines[i].split(';') : lines[i].split(',');
      if (parts.length < 4) continue;
      const date = parts[0].split(' ')[0].trim();
      const pages = parseInt(parts[2].trim().replace(/\D/g, ''));
      if (!isNaN(pages) && pages > 0) {
        pagesPerDate[date] = (pagesPerDate[date] || 0) + pages;
      }
    }

    return Object.entries(pagesPerDate)
      .map(([date, pages]) => ({ date, pages }))
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
    const canvas = document.getElementById("daysChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const squareSize = 20;
    const gap = 4;
    const squaresPerRow = 30;

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

      ctx.strokeStyle = index === hoverIndex ? "#fff" : "#1f1f1f";
      ctx.lineWidth = index === hoverIndex ? 3 : 1;
      roundRect(ctx, x, y, squareSize, squareSize, 5);
      ctx.stroke();
    });

    if (hoverIndex !== -1 && hoverData) {
      const padding = 8;
      const lineSpacing = 6;

      ctx.font = "bold 14px Dosis, sans-serif";
      const dateWidth = ctx.measureText(hoverData.date).width;
      const dateHeight = 22;

      ctx.font = "14px Dosis, sans-serif";
      const pagesText = `${hoverData.pages} Seiten`;
      const pagesWidth = ctx.measureText(pagesText).width;
      const pagesHeight = 22;

      const tooltipWidth = Math.max(dateWidth, pagesWidth) + 2 * padding;
      const tooltipHeight = dateHeight + pagesHeight + 3 * lineSpacing;

      let x = hoverPos.x + 10;
      let y = hoverPos.y - tooltipHeight - 10;

      const canvasWidth = canvas.width / dpr;
      const canvasHeight = canvas.height / dpr;

      if (x + tooltipWidth > canvasWidth) x = canvasWidth - tooltipWidth - 10;
      if (x < 0) x = 10;
      if (y < 0) y = hoverPos.y + 10;

      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      roundRect(ctx, x, y, tooltipWidth, tooltipHeight, 10);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px Dosis, sans-serif";
      ctx.fillText(hoverData.date, x + padding, y + padding + dateHeight);

      ctx.font = "14px Dosis, sans-serif";
      ctx.fillText(pagesText, x + padding, y + padding + dateHeight + pagesHeight + lineSpacing);
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
    const canvas = document.getElementById("daysChart");
    if (!canvas) return;

    const squareSize = 20;
    const gap = 4;
    const squaresPerRow = 30;

    canvas.addEventListener("mousemove", (evt) => {
      const pos = getMousePos(canvas, evt);
      const col = Math.floor((pos.x - gap) / (squareSize + gap));
      const row = Math.floor((pos.y - gap) / (squareSize + gap));
      const index = row * squaresPerRow + col;

      if (col < 0 || col >= squaresPerRow || row < 0 || index >= data.length) {
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
        hoverPos = {
          x: gap + col * (squareSize + gap),
          y: gap + row * (squareSize + gap)
        };
        drawSquares(data);
      }
    });

    canvas.addEventListener("mouseleave", () => {
      if (hoverIndex !== -1) {
        hoverIndex = -1;
        hoverData = null;
        drawSquares(data);
      }
    });
  }

  function createLegend() {
    const legend = document.getElementById("legenddays");
    if (!legend) return;

    legend.innerHTML = "";
    legend.style.display = "flex";
    legend.style.flexWrap = "wrap";
    legend.style.justifyContent = "center";
    legend.style.gap = "10px";
    legend.style.fontFamily = "Dosis, sans-serif";

    legendItems.forEach(({ color, label }) => {
      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.alignItems = "center";
      item.style.gap = "6px";

      const colorBox = document.createElement("div");
      colorBox.style.width = "16px";
      colorBox.style.height = "16px";
      colorBox.style.backgroundColor = color;
      colorBox.style.border = "1px solid #1f1f1f";
      colorBox.style.borderRadius = "3px";

      const text = document.createElement("span");
      text.textContent = label;

      item.appendChild(colorBox);
      item.appendChild(text);
      legend.appendChild(item);
    });
  }

  async function main() {
    createLegend();
    try {
      const response = await fetch(csvUrl);
      const text = await response.text();
      const data = parseCSV(text);
      drawSquares(data);
      setupHover(data);
    } catch (e) {
      console.error("Fehler beim Laden der CSV:", e);
    }
  }

  document.addEventListener("DOMContentLoaded", main);
})();
