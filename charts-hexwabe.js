document.addEventListener("DOMContentLoaded", () => {
  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv";
  const canvas = document.getElementById("hexwabeChart");
  const tooltip = document.getElementById("tooltip");
  const legend = document.getElementById("legend");
  const ctx = canvas.getContext("2d");

  const size = 20;
  const spacing = 10;           // Vertikaler Abstand zwischen Reihen (größer)
  const horizontalSpacing = 8;  // Neuer horizontaler Abstand zwischen Waben
  let hexData = [];

  canvas.style.display = "block";
  canvas.style.margin = "30px auto";
  canvas.style.borderRadius = "16px";
  canvas.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  canvas.style.imageRendering = "pixelated";

  const colorScale = [
    { max: 30, color: "#ff7256", label: "≤30 Seiten" },
    { max: 50, color: "#FFB90F", label: "≤50 Seiten" },
    { max: 70, color: "#63b8ff", label: "≤70 Seiten" },
    { max: 100, color: "#3CB371", label: "≤100 Seiten" },
    { max: 300, color: "#9370DB", label: "≤300 Seiten" },
    { max: Infinity, color: "#20B2AA", label: ">300 Seiten" }
  ];

  // Legende erzeugen (horizontal)
  legend.style.display = "flex";
  legend.style.flexWrap = "wrap";
  legend.style.justifyContent = "center";
  legend.style.gap = "2px";
  legend.style.margin = "0 20px 20px 20px";

  colorScale.forEach(entry => {
    const box = document.createElement("div");
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.fontSize = "14px";
    box.style.whiteSpace = "nowrap";
    box.style.minWidth = "120px";

    box.innerHTML = `<span style="display:inline-block;width:14px;height:14px;background:${entry.color};margin-right:6px;border-radius:3px;"></span>${entry.label}`;
    legend.appendChild(box);
  });

  fetch(CSV_URL)
    .then(res => res.text())
    .then(csv => {
      const data = sumByDate(parseCSV(csv));
      drawHexGrid(data);
    });

  function parseCSV(csv) {
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes("zeitstempel"));
    const pagesIndex = headers.findIndex(h => h.toLowerCase().includes("seiten"));
    return lines.slice(1).map(line => {
      const cols = line.split(",");
      const rawDate = cols[dateIndex].trim().split(" ")[0];
      return {
        date: rawDate,
        pages: parseInt(cols[pagesIndex]) || 0
      };
    }).filter(r => r.date && r.pages > 0);
  }

  function sumByDate(entries) {
    const result = {};
    for (const entry of entries) {
      if (!result[entry.date]) result[entry.date] = 0;
      result[entry.date] += entry.pages;
    }
    return Object.entries(result).map(([date, pages]) => ({ date, pages }));
  }

  function getColor(pages) {
    return colorScale.find(entry => pages <= entry.max).color;
  }

  function drawHexGrid(data) {
    const hexHeight = Math.sqrt(3) * size;
    const cols = Math.floor(window.innerWidth / (size * 1.5 + horizontalSpacing));
    const rows = Math.ceil(data.length / cols);

    canvas.width = window.innerWidth;
    canvas.height = rows * (hexHeight + spacing) + size;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hexData = [];

    data.forEach((entry, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = size + col * (size * 1.5 + horizontalSpacing);
      const y = size + row * (hexHeight + spacing) + (col % 2 ? hexHeight / 2 : 0);
      const color = getColor(entry.pages);
      drawHexagon(ctx, x, y, size, color, 4); // Radius 4 für Abrundung
      hexData.push({ x, y, size, entry });
    });
  }

  // Neue Funktion: Hexagon mit abgerundeten Ecken zeichnen
  function drawHexagon(ctx, x, y, size, color, radius = 4) {
    const sides = 6;
    const angleStep = Math.PI / 3;
    const points = [];

    for (let i = 0; i < sides; i++) {
      const angle = angleStep * i;
      points.push({
        x: x + size * Math.cos(angle),
        y: y + size * Math.sin(angle)
      });
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < sides; i++) {
      const current = points[i];
      const next = points[(i + 1) % sides];
      const nextNext = points[(i + 2) % sides];

      const vx = next.x - current.x;
      const vy = next.y - current.y;
      const vLen = Math.sqrt(vx * vx + vy * vy);
      const ux = vx / vLen;
      const uy = vy / vLen;

      const px = next.x - ux * radius;
      const py = next.y - uy * radius;

      ctx.lineTo(px, py);
      ctx.quadraticCurveTo(next.x, next.y, nextNext.x - ux * radius, nextNext.y - uy * radius);
    }

    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#9999";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let found = false;

    for (let hex of hexData) {
      const dx = mouseX - hex.x;
      const dy = mouseY - hex.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hex.size) {
        tooltip.style.left = e.pageX + 10 + "px";
        tooltip.style.top = e.pageY + 10 + "px";
        tooltip.innerText = `${hex.entry.date}\n${hex.entry.pages} Seiten`;
        tooltip.style.opacity = 1;
        found = true;
        break;
      }
    }

    if (!found) tooltip.style.opacity = 0;
  });

  canvas.addEventListener("mouseleave", () => {
    tooltip.style.opacity = 0;
  });
});
