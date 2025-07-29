(() => {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv";

  const legendItems = [
    { color: "#ff7256", label: "≤ 50" },
    { color: "#FFB90F", label: "≤ 70" },
    { color: "#3CB371", label: "≤ 100" },
    { color: "#63b8ff", label: "≤ 150" },
    { color: "#9370DB", label: "≥ 151" }
  ];

  function getColor(pages) {
    if (pages < 50) return "#ff7256";
    if (pages <= 70) return "#FFB90F";
    if (pages <= 100) return "#3CB371";
    if (pages <= 150) return "#63b8ff";
    if (pages <= 300) return "#9370DB";
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
    const squaresPerRow = 25;
    const rows = Math.ceil(data.length / squaresPerRow);

    const widthCSS = squaresPerRow * (squareSize + gap) + gap;
    const heightCSS = rows * (squareSize + gap) + gap;

    canvas.width = widthCSS * dpr;
    canvas.height = heightCSS * dpr;
    canvas.style.width = widthCSS + "px";
    canvas.style.height = heightCSS + "px";

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const squareData = [];

    function render(highlightIndex = -1) {
      ctx.clearRect(0, 0, widthCSS, heightCSS);

      data.forEach((item, index) => {
        const x = gap + (index % squaresPerRow) * (squareSize + gap);
        const y = gap + Math.floor(index / squaresPerRow) * (squareSize + gap);

        ctx.fillStyle = getColor(item.pages);
        roundRect(ctx, x, y, squareSize, squareSize, 5);
        ctx.fill();

        ctx.strokeStyle = "#1f1f1f";
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, squareSize, squareSize, 5);
        ctx.stroke();

        if (index === highlightIndex) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 3;
          roundRect(ctx, x, y, squareSize, squareSize, 5);
          ctx.stroke();
        }

        squareData[index] = { x, y, width: squareSize, height: squareSize, ...item };
      });
    }

    render();

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
      tooltip.style.display = "none";
      tooltip.style.zIndex = "10";
      document.body.appendChild(tooltip);
    }

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hoveredIndex = squareData.findIndex(s =>
        mouseX >= s.x && mouseX <= s.x + s.width &&
        mouseY >= s.y && mouseY <= s.y + s.height
      );

      if (hoveredIndex !== -1) {
        const hovered = squareData[hoveredIndex];
        tooltip.innerHTML = `<strong>${hovered.date}</strong><br>${hovered.pages} Seiten`;
        tooltip.style.left = `${e.pageX + 0}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
        tooltip.style.display = "block";
        render(hoveredIndex);
      } else {
        tooltip.style.display = "none";
        render();
      }
    });

    canvas.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
      render();
    });
  }

  function createLegend() {
    const legend = document.getElementById("legenddays");
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
