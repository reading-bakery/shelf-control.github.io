const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=62129941&single=true&output=csv";
const goal = 90;

async function loadDataAndRender() {
  try {
    // PapaParse laden, falls nicht vorhanden
    if (typeof Papa === 'undefined') {
      await new Promise(resolve => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        document.head.appendChild(script);
        script.onload = resolve;
      });
    }

    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error("CSV konnte nicht geladen werden");

    const csvText = await response.text();
    const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    if (!results.data || results.data.length === 0) throw new Error("Keine Daten in CSV");

    const buchSpalte = Object.keys(results.data[0]).find(k => k.trim().toLowerCase() === 'bücher');
    if (!buchSpalte) throw new Error("Spalte 'Bücher' nicht gefunden");

    const current = parseInt(results.data[0][buchSpalte], 10);
    if (isNaN(current)) throw new Error("Wert in 'Bücher' ist keine Zahl");

    // Berechnungen für Graph & Kreis
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear)/(1000*60*60*24)) + 1;
    const avgPerDay = current / dayOfYear;
    const predictedDay = Math.ceil(goal / avgPerDay);

    renderProgressCircle(current, goal, dayOfYear);
    renderLinearGraph(dayOfYear, current, goal, avgPerDay, predictedDay);

  } catch (error) {
    console.error("Fehler beim Laden oder Verarbeiten der Daten:", error);
    document.getElementById("books-circle").textContent = "Fehler beim Laden der Daten";
  }
}

// Kreisdiagramm
function renderProgressCircle(current, goal, dayOfYear) {
  const percent = ((current/goal)*100).toFixed(1);
  const container = document.getElementById('books-circle');
  container.innerHTML = "";

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const daysInYear = 365;
  const targetAtThisTime = Math.round(goal * (dayOfYear/daysInYear));
  const delta = current - targetAtThisTime;

  let deltaText = delta === 0 ? "Genau im Plan!" 
                 : delta > 0 ? `+${delta} Vorsprung` 
                 : `-${Math.abs(delta)} Rückstand`;
  let deltaColor = delta === 0 ? "white" : delta > 0 ? "#13c913" : "#FF4500";

  const size = 220, strokeWidth = 30;
  const radius = (size-strokeWidth)/2;
  const circumference = 2*Math.PI*radius;
  const offset = circumference * (1 - Math.min(percent,100)/100);
  const svgns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgns,"svg");
  svg.setAttribute("width", size); svg.setAttribute("height", size);
  svg.style.transform = "rotate(-90deg)";

  // Farbverlauf
  const defs = document.createElementNS(svgns,"defs");
  const linearGradient = document.createElementNS(svgns,"linearGradient");
  linearGradient.setAttribute("id","coralGradient");
  linearGradient.setAttribute("x1","0%"); linearGradient.setAttribute("y1","0%");
  linearGradient.setAttribute("x2","100%"); linearGradient.setAttribute("y2","0%");
  const stop1 = document.createElementNS(svgns,"stop"); stop1.setAttribute("offset","0%"); stop1.setAttribute("stop-color","#92230bff");
  const stop2 = document.createElementNS(svgns,"stop"); stop2.setAttribute("offset","100%"); stop2.setAttribute("stop-color","#ff7f50");
  linearGradient.appendChild(stop1); linearGradient.appendChild(stop2);
  defs.appendChild(linearGradient);
  svg.appendChild(defs);

  const bgCircle = document.createElementNS(svgns,"circle");
  bgCircle.setAttribute("cx", size/2); bgCircle.setAttribute("cy", size/2); bgCircle.setAttribute("r", radius);
  bgCircle.setAttribute("stroke", "#353434ff"); bgCircle.setAttribute("stroke-width", strokeWidth); bgCircle.setAttribute("fill","none");

  const progressCircle = document.createElementNS(svgns,"circle");
  progressCircle.setAttribute("cx", size/2); progressCircle.setAttribute("cy", size/2); progressCircle.setAttribute("r", radius);
  progressCircle.setAttribute("stroke", "url(#coralGradient)");
  progressCircle.setAttribute("stroke-width", strokeWidth);
  progressCircle.setAttribute("fill","none");
  progressCircle.setAttribute("stroke-dasharray", circumference);
  progressCircle.setAttribute("stroke-dashoffset", offset);
  progressCircle.setAttribute("stroke-linecap","round");

  svg.appendChild(bgCircle); 
  svg.appendChild(progressCircle);

  // Textgruppe
  const textGroup = document.createElementNS(svgns,"g");
  textGroup.setAttribute("transform", `translate(${size/2}, ${size/2}) rotate(90)`);

  const textLine1 = document.createElementNS(svgns,"text");
  textLine1.setAttribute("text-anchor","middle"); textLine1.setAttribute("y","-15");
  textLine1.setAttribute("font-size","18"); textLine1.setAttribute("fill","white");
  textLine1.setAttribute("font-family","Dosis, sans-serif");
  textLine1.textContent = `${current} von ${goal}`;

  const textLine2 = document.createElementNS(svgns,"text");
  textLine2.setAttribute("text-anchor","middle"); textLine2.setAttribute("y","5");
  textLine2.setAttribute("font-size","12"); textLine2.setAttribute("fill","white");
  textLine2.setAttribute("font-family","Dosis, sans-serif");
  textLine2.textContent = "Büchern erreicht.";

  const textPercent = document.createElementNS(svgns,"text");
  textPercent.setAttribute("text-anchor","middle"); textPercent.setAttribute("y","30");
  textPercent.setAttribute("font-size","22"); textPercent.setAttribute("fill","white");
  textPercent.setAttribute("font-family","Dosis, sans-serif");
  textPercent.textContent = `${percent}%`;

  const textDelta = document.createElementNS(svgns,"text");
  textDelta.setAttribute("text-anchor","middle"); textDelta.setAttribute("y","50");
  textDelta.setAttribute("font-size","14"); textDelta.setAttribute("fill", deltaColor);
  textDelta.setAttribute("font-family","Dosis, sans-serif");
  textDelta.textContent = deltaText;

  textGroup.appendChild(textLine1);
  textGroup.appendChild(textLine2);
  textGroup.appendChild(textPercent);
  textGroup.appendChild(textDelta);

  svg.appendChild(textGroup);
  container.appendChild(svg);
}

// Linearer Graph darunter
function renderLinearGraph(dayOfYear, current, goal, avgPerDay, predictedDay) {

  const container = document.getElementById('books-graph');
  container.innerHTML = "";

  const width = 300;
  const height = 200;
  const padding = 30;
  const axisYOffset = 50;

  const svgns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgns,"svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  // Skalierung
  const xScale = (width - padding * 2) / 365;
  const yScale = (height - padding - axisYOffset) / goal;

  // X-Achse
  const axisX = document.createElementNS(svgns,"line");
  axisX.setAttribute("x1", padding);
  axisX.setAttribute("y1", height - axisYOffset);
  axisX.setAttribute("x2", width - padding);
  axisX.setAttribute("y2", height - axisYOffset);
  axisX.setAttribute("stroke","white");
  svg.appendChild(axisX);

  // Y-Achse
  const axisY = document.createElementNS(svgns,"line");
  axisY.setAttribute("x1", padding);
  axisY.setAttribute("y1", padding);
  axisY.setAttribute("x2", padding);
  axisY.setAttribute("y2", height - axisYOffset);
  axisY.setAttribute("stroke","white");
  svg.appendChild(axisY);

  // X-Achsenbeschriftung (unten)
  const xLabel = document.createElementNS(svgns, "text");
  xLabel.setAttribute("x", width / 1.2);
  xLabel.setAttribute("y", height - axisYOffset + 20);
  xLabel.setAttribute("fill", "white");
  xLabel.setAttribute("font-size", "13");
  xLabel.setAttribute("font-family", "Dosis, sans-serif");
  xLabel.setAttribute("text-anchor", "middle");
  xLabel.textContent = "Monat";
  svg.appendChild(xLabel);

  // Y-Achsenbeschriftung (vertikal links, etwas nach unten verschoben)
  const yLabel = document.createElementNS(svgns, "text");
  yLabel.setAttribute("x", padding - 20);
  yLabel.setAttribute("y", padding + 20);
  yLabel.setAttribute("fill", "white");
  yLabel.setAttribute("font-size", "13");
  yLabel.setAttribute("font-family", "Dosis, sans-serif");
  yLabel.setAttribute("text-anchor", "start");
  yLabel.setAttribute("transform", `rotate(-90 ${padding - 10} ${padding + 20})`);
  yLabel.textContent = "Bücher";
  svg.appendChild(yLabel);

  // -----------------------------
  // Gefüllter Bereich unter der Linie (bisheriger Fortschritt)
  // -----------------------------
  const fillPoints = [`${padding},${height - axisYOffset}`]; // Start unten links
  for(let i = 0; i <= dayOfYear; i++){
    const x = padding + i * xScale;
    const y = height - axisYOffset - avgPerDay * i * yScale;
    fillPoints.push(`${x},${y}`);
  }
  fillPoints.push(`${padding + dayOfYear * xScale},${height - axisYOffset}`); // Boden unten am letzten Punkt
  const fillPolygon = document.createElementNS(svgns, "polygon");
  fillPolygon.setAttribute("points", fillPoints.join(" "));
  fillPolygon.setAttribute("fill", "rgba(146,35,11,0.3)"); // halbtransparent passend zur Linie
  svg.appendChild(fillPolygon);

  // -----------------------------
  // Gefüllter Prognose-Bereich
  // -----------------------------
  const lastX = padding + dayOfYear * xScale;
  const lastY = height - axisYOffset - current * yScale;
  const predX = padding + Math.min(predictedDay,365) * xScale;
  const predY = height - axisYOffset - goal * yScale;

  const predFillPoints = [
    `${lastX},${height - axisYOffset}`, // Boden an Startpunkt
    `${lastX},${lastY}`,                 // Start der Prognose-Linie
    `${predX},${predY}`,                 // Ende der Prognose-Linie
    `${predX},${height - axisYOffset}`   // Boden am Ende
  ];

  const predFill = document.createElementNS(svgns, "polygon");
  predFill.setAttribute("points", predFillPoints.join(" "));
  predFill.setAttribute("fill", "rgba(255,127,80,0.2)"); // halbtransparentes Orange
  svg.appendChild(predFill);

  // Fortschrittslinie (dunkelrot)
  const linePoints = [];
  for(let i = 0; i <= dayOfYear; i++){
    const x = padding + i * xScale;
    const y = height - axisYOffset - avgPerDay * i * yScale;
    linePoints.push(`${x},${y}`);
  }
  const line = document.createElementNS(svgns,"polyline");
  line.setAttribute("points", linePoints.join(" "));
  line.setAttribute("fill","none");
  line.setAttribute("stroke","#92230bff");
  line.setAttribute("stroke-width","2");
  svg.appendChild(line);

  // Prognose-Linie (gelb gestrichelt)
  const predLine = document.createElementNS(svgns,"line");
  predLine.setAttribute("x1", lastX);
  predLine.setAttribute("y1", lastY);
  predLine.setAttribute("x2", predX);
  predLine.setAttribute("y2", predY);
  predLine.setAttribute("stroke","#ff7f50");
  predLine.setAttribute("stroke-width","2");
  predLine.setAttribute("stroke-dasharray","5,5");
  svg.appendChild(predLine);

  container.appendChild(svg);
}



loadDataAndRender();
