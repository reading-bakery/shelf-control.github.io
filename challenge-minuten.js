const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=62129941&single=true&output=csv";
const goal = 20000;

async function loadDataAndRender() {
  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();

    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const currentStr = results.data[1]?.Seiten;
    if (!currentStr) throw new Error("Spalte 'Seiten' nicht gefunden oder leer.");

    const current = parseInt(currentStr, 10);
    if (isNaN(current)) throw new Error("Wert in 'Seiten' ist keine Zahl.");

    renderProgressCircle(current, goal);
  } catch (error) {
    console.error("Fehler beim Laden oder Verarbeiten der Daten:", error);
    const container = document.getElementById("pages-circle");
    container.textContent = "Fehler beim Laden der Daten";
  }
}

function renderProgressCircle(current, goal) {
  const percent = ((current / goal) * 100).toFixed(1);

  const container = document.getElementById('pages-circle');
  container.innerHTML = "";

  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(percent, 100) / 100);

  const svgns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgns, "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.transform = "rotate(-90deg)";
  svg.style.filter = "drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4))";

  // Definiere den Verlauf
  const defs = document.createElementNS(svgns, "defs");
  const gradient = document.createElementNS(svgns, "linearGradient");
  gradient.setAttribute("id", "gradientStroke");
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("y1", "0%");
  gradient.setAttribute("x2", "100%");
  gradient.setAttribute("y2", "100%");

  const stop1 = document.createElementNS(svgns, "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#ff9a76");

  const stop2 = document.createElementNS(svgns, "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#ff5a36");

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svg.appendChild(defs);

  // Hintergrundkreis
  const bgCircle = document.createElementNS(svgns, "circle");
  bgCircle.setAttribute("cx", size / 2);
  bgCircle.setAttribute("cy", size / 2);
  bgCircle.setAttribute("r", radius);
  bgCircle.setAttribute("stroke", "#333");
  bgCircle.setAttribute("stroke-width", strokeWidth);
  bgCircle.setAttribute("fill", "none");

  // Fortschrittskreis mit Verlauf
  const progressCircle = document.createElementNS(svgns, "circle");
  progressCircle.setAttribute("cx", size / 2);
  progressCircle.setAttribute("cy", size / 2);
  progressCircle.setAttribute("r", radius);
  progressCircle.setAttribute("stroke", "url(#gradientStroke)");
  progressCircle.setAttribute("stroke-width", strokeWidth);
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("stroke-dasharray", circumference);
  progressCircle.setAttribute("stroke-dashoffset", offset);
  progressCircle.setAttribute("stroke-linecap", "round");
  progressCircle.style.transition = "stroke-dashoffset 1s ease";

  // Text
  const textGroup = document.createElementNS(svgns, "g");
  textGroup.setAttribute("transform", `translate(${size / 2}, ${size / 2}) rotate(90)`);

  const textLine1 = document.createElementNS(svgns, "text");
  textLine1.setAttribute("text-anchor", "middle");
  textLine1.setAttribute("y", "-15");
  textLine1.setAttribute("font-size", "18");
  textLine1.setAttribute("font-family", "Dosis, sans-serif");
  textLine1.setAttribute("fill", "white");
  textLine1.textContent = `${current} von ${goal}`;

  const textLine2 = document.createElementNS(svgns, "text");
  textLine2.setAttribute("text-anchor", "middle");
  textLine2.setAttribute("y", "5");
  textLine2.setAttribute("font-size", "14");
  textLine2.setAttribute("font-family", "Dosis, sans-serif");
  textLine2.setAttribute("fill", "white");
  textLine2.textContent = `Seiten erreicht`;

  const textPercent = document.createElementNS(svgns, "text");
  textPercent.setAttribute("text-anchor", "middle");
  textPercent.setAttribute("y", "30");
  textPercent.setAttribute("font-size", "22");
  textPercent.setAttribute("font-family", "Dosis, sans-serif");
  textPercent.setAttribute("fill", "white");
  textPercent.textContent = `${percent}%`;

  textGroup.appendChild(textLine1);
  textGroup.appendChild(textLine2);
  textGroup.appendChild(textPercent);

  svg.appendChild(bgCircle);
  svg.appendChild(progressCircle);
  svg.appendChild(textGroup);

  container.appendChild(svg);
}

loadDataAndRender();