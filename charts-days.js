(() => {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv";

  const legendItems = [
    { color: "#FFB90F", label: "< 30" },
    { color: "#FF4500", label: "31–50" },
    { color: "#3CB371", label: "51–70" },
    { color: "#A9A9A9", label: "71–100" },
    { color: "#800080", label: "101–150" },
    { color: "#40E0D0", label: "> 150" }
  ];

  function getColor(pages) {
    if (pages < 30) return "#FFB90F";
    if (pages <= 50) return "#FF4500";
    if (pages <= 70) return "#3CB371";
    if (pages <= 100) return "#A9A9A9";
    if (pages <= 150) return "#800080";
    return "#40E0D0";
  }

  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const pagesPerDate = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.includes(';') ? line.split(';') : line.split(',');
      if (parts.length < 3) continue;

      const dateRaw = parts[0].trim();
      const date = dateRaw.split(' ')[0];
      const pages = parseInt(parts[2].trim().replace(/\D/g, ''));
      if (isNaN(pages) || pages <= 0) continue;

      if (!pagesPerDate[date]) pagesPerDate[date] = 0;
      pagesPerDate[date] += pages;
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

      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, squareSize, squareSize, 5);
      ctx.stroke();
    });
  }

  function createLegend() {
    const legend = document.getElementById("legenddays");
    if (!legend) return;

    legend.innerHTML = "";
    legend.style.marginTop = "12px";
    legend.style.display = "flex";
    legend.style.flexWrap = "wrap";
    legend.style.justifyContent = "center";
    legend.style.gap = "10px";
    legend.style.fontFamily = "Arial, sans-serif";
    legend.style.fontSize = "14px";
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

      const text = document.createElement("span");
      text.textContent = label;

      item.appendChild(colorBox);
      item.appendChild(text);
      legend.appendChild(item);
    });
  }

  async function fetchAndDraw() {
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error("CSV konnte nicht geladen werden");
      const csvText = await response.text();
      const data = parseCSV(csvText);
      drawSquares(data);
      createLegend();
    } catch (e) {
      console.error("Fehler beim Laden oder Zeichnen:", e);
    }
  }

  window.addEventListener("load", fetchAndDraw);
})();
