const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=62129941&single=true&output=csv";
const goal = 90;

async function loadDataAndRender() {
  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();

    // CSV parsen mit PapaParse
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const currentStr = results.data[0]?.Bücher;
    if (!currentStr) throw new Error("Spalte 'Bücher' nicht gefunden oder leer.");

    const current = parseInt(currentStr, 10);
    if (isNaN(current)) throw new Error("Wert in 'Bücher' ist keine Zahl.");

    renderProgressCircle(current, goal);
  } catch (error) {
    console.error("Fehler beim Laden oder Verarbeiten der Daten:", error);
    const container = document.getElementById("books-circle");
    container.textContent = "Fehler beim Laden der Daten";
  }
}

function renderProgressCircle(current, goal) {
  const percent = ((current / goal) * 100).toFixed(1); // kein cap bei 100%

  const container = document.getElementById('books-circle');
  container.innerHTML = "";

  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(percent, 100) / 100); // Fortschrittskreis max. 100%

  const svgns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgns, "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.transform = "rotate(-90deg)";
  svg.style.filter = "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2))";

  const bgCircle = document.createElementNS(svgns, "circle");
  bgCircle.setAttribute("cx", size / 2);
  bgCircle.setAttribute("cy", size / 2);
  bgCircle.setAttribute("r", radius);
  bgCircle.setAttribute("stroke", "#eee");
  bgCircle.setAttribute("stroke-width", strokeWidth);
  bgCircle.setAttribute("fill", "none");

  const progressCircle = document.createElementNS(svgns, "circle");
  progressCircle.setAttribute("cx", size / 2);
  progressCircle.setAttribute("cy", size / 2);
  progressCircle.setAttribute("r", radius);
  progressCircle.setAttribute("stroke", "#ff7256");
  progressCircle.setAttribute("stroke-width", strokeWidth);
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("stroke-dasharray", circumference);
  progressCircle.setAttribute("stroke-dashoffset", offset);
  progressCircle.setAttribute("stroke-linecap", "round");
  progressCircle.style.transition = "stroke-dashoffset 1s ease";

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
  textLine2.setAttribute("font-size", "12");
  textLine2.setAttribute("font-family", "Dosis, sans-serif");
  textLine2.setAttribute("fill", "white");
  textLine2.textContent = `Büchern erreicht`;

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

// Start
loadDataAndRender();
