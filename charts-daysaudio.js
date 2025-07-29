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
    const squaresPerRow = 15;

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

    if (hoverIndex !== -1 && hoverData) {
      const padding = 6;
      const textLines = [
        `${hoverData.date}`,
        `${hoverData.pages} Minuten`
      ];

      ctx.font = "13px Dosis";
      ctx.textBaseline = "top";

      let maxWidth = 0;
      textLines.forEach(line => {
        const w = ctx.measureText(line).width;
        if (w > maxWidth) maxWidth = w;
      });
      const lineHeight = 20;
      const tooltipWidth = maxWidth + padding * 2;
      const tooltipHeight = lineHeight * textLines.length + padding * 2;

      let tooltipX = hoverPos.x;
      let tooltipY = hoverPos.y - tooltipHeight - 10;

      if (tooltipY < 0) {
        tooltipY = hoverPos.y + 10;
      }

      let tooltip = document.getElementById("tooltip");
      if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.background = "rgba(0, 0, 0, 0.8)";
        tooltip.style.color = "#fff";
        tooltip.style.padding = "6px 8px";
        tooltip.style.borderRadius = "5px";
        tooltip.style.pointerEvents = "none";
        tooltip.style.fontSize = "13px";
        tooltip.style.fontFamily = "Dosis, sans-serif";
        tooltip.style.zIndex = "10";
        document.body.appendChild(tooltip);
      }

      // Hier Datum fett machen:
      tooltip.innerHTML = textLines.map((line, i) => 
        i === 0 
          ? `<div style="font-weight:bold;">${line}</div>` 
          : `<div>${line}</div>`
      ).join('');

      const canvasRect = canvas.getBoundingClientRect();
      tooltip.style.left = (canvasRect.left + tooltipX) + "px";
      tooltip.style.top = (canvasRect.top + tooltipY) + "px";
      tooltip.style.display = "block";
    } else {
      const tooltip = document.getElementById("tooltip");
      if (tooltip) {
        tooltip.style.display = "none";
      }
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
    const squaresPerRow = 15;

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
        hoverPos = {
          x: gap + (col) * (squareSize + gap),
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
    const legend = document.getElementById("legendaudiodays");
    if (!legend) return;

    legend.innerHTML = "";
    legend.style.marginTop = "auto";
    legend.style.paddingTop = "5px";
    legend.style.display = "flex";
    legend.style.flexWrap = "wrap";
    legend.style.justifyContent = "center";
    legend.style.gap = "5px";
    legend.style.fontFamily = "Dosis, sans-serif";
    legend.style.fontSize = "13px";
    legend.style.alignItems = "center";
    legendItems.forEach(({ color, label }) => {
      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.alignItems = "center";
      item.style.gap = "6px";

      const colorBox = document.createElement("div");
      colorBox.style.width = "18px";
      colorBox.style.height = "18px";
      colorBox.style.borderRadius = "4px";
      colorBox.style.backgroundColor = color;
      colorBox.style.border = "1px solid #555";
      colorBox.style.borderColor = "#1f1f1f";

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
      if (!response.ok) throw new Error("Netzwerkfehler beim Laden der CSV");

      const text = await response.text();
      const data = parseCSV(text);

      drawSquares(data);
      setupHover(data);
    } catch (error) {
      console.error("Fehler beim Laden oder Verarbeiten der Daten:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", main);
})();
