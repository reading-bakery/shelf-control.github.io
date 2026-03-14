/**
 * @name challenge-seiten.js
 * @description Lädt CSV-Daten aus Spalte B, summiert die Seiten und zeigt
 * den Fortschritt in einem SVG-Kreisdiagramm und einem linearen Graphen an.
 */
(function() {
  'use strict';

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=62129941&single=true&output=csv";
  const GOAL = 20000; // Zielseiten
  const TARGET_CIRCLE_ID = 'pages-circle';
  const TARGET_GRAPH_ID = 'pages-graph';

  async function loadDataAndRender() {
    try {
      // PapaParse laden, falls nicht global
      if (typeof Papa === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }

      // CSV laden
      const response = await fetch(CSV_URL);
      if (!response.ok) throw new Error("CSV konnte nicht geladen werden");
      const csvText = await response.text();

      const results = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });

      if (!results.data || results.data.length === 0) throw new Error("Keine Daten in CSV");

      // Spalte B summieren
      const totalPagesRead = results.data.reduce((sum, row) => {
        const keys = Object.keys(row);
        return sum + (row[keys[1]] || 0); // Spalte B = Index 1
      }, 0);

      // Kreisdiagramm rendern
      renderProgressCircle(totalPagesRead, GOAL);

      // Werte für linearen Graphen vorbereiten
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((today - startOfYear) / (1000*60*60*24)) + 1;
      const avgPerDay = totalPagesRead / dayOfYear;
      const predictedDay = Math.round(GOAL / avgPerDay);

      // Linearen Graphen rendern
      renderLinearGraph(dayOfYear, totalPagesRead, GOAL, avgPerDay, predictedDay);

    } catch (error) {
      console.error("Fehler beim Laden oder Verarbeiten der Daten:", error);
      const containerCircle = document.getElementById(TARGET_CIRCLE_ID);
      const containerGraph = document.getElementById(TARGET_GRAPH_ID);
      if (containerCircle) containerCircle.textContent = "Fehler beim Laden der Daten";
      if (containerGraph) containerGraph.textContent = "Fehler beim Laden der Daten";
    }
  }

  // -----------------------------
  // Kreisdiagramm
  // -----------------------------
  function renderProgressCircle(current, goal) {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (1000*60*60*24)) + 1;
    const daysInYear = 365;

    const targetAtThisTime = Math.round(goal * (dayOfYear / daysInYear));
    const delta = current - targetAtThisTime;
    const percent = ((current / goal) * 100).toFixed(1);

    const deltaText = delta === 0 ? "Genau im Plan!" :
                     delta > 0 ? `+${delta} Vorsprung` :
                     `-${Math.abs(delta)} Rückstand`;
    const deltaColor = delta === 0 ? "white" : delta > 0 ? "#00FF00" : "#FF4500";

    const container = document.getElementById(TARGET_CIRCLE_ID);
    if (!container) return;
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

    // Hintergrundkreis
    const bgCircle = document.createElementNS(svgns, "circle");
    bgCircle.setAttribute("cx", size/2);
    bgCircle.setAttribute("cy", size/2);
    bgCircle.setAttribute("r", radius);
    bgCircle.setAttribute("stroke", "#353434ff");
    bgCircle.setAttribute("stroke-width", strokeWidth);
    bgCircle.setAttribute("fill", "none");

    // Farbverlauf
    const defs = document.createElementNS(svgns, "defs");
    const linearGradient = document.createElementNS(svgns, "linearGradient");
    linearGradient.setAttribute("id", "greenGradient");
    linearGradient.setAttribute("x1", "0%");
    linearGradient.setAttribute("y1", "0%");
    linearGradient.setAttribute("x2", "100%");
    linearGradient.setAttribute("y2", "0%");

    const stop1 = document.createElementNS(svgns, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#025a2aff");
    const stop2 = document.createElementNS(svgns, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#4bd886");

    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    defs.appendChild(linearGradient);
    svg.appendChild(defs);

    // Fortschrittskreis
    const progressCircle = document.createElementNS(svgns, "circle");
    progressCircle.setAttribute("cx", size/2);
    progressCircle.setAttribute("cy", size/2);
    progressCircle.setAttribute("r", radius);
    progressCircle.setAttribute("stroke", "url(#greenGradient)");
    progressCircle.setAttribute("stroke-width", strokeWidth);
    progressCircle.setAttribute("fill", "none");
    progressCircle.setAttribute("stroke-dasharray", circumference);
    progressCircle.setAttribute("stroke-dashoffset", offset);
    progressCircle.setAttribute("stroke-linecap", "round");

    // Textgruppe
    const textGroup = document.createElementNS(svgns, "g");
    textGroup.setAttribute("transform", `translate(${size/2}, ${size/2}) rotate(90)`);

    const textLine1 = document.createElementNS(svgns, "text");
    textLine1.setAttribute("text-anchor", "middle");
    textLine1.setAttribute("y", "-15");
    textLine1.setAttribute("font-size", "18");
    textLine1.setAttribute("font-family", "Dosis, sans-serif");
    textLine1.setAttribute("fill", "white");
    textLine1.textContent = `${current.toLocaleString('de-DE')} von ${goal.toLocaleString('de-DE')}`;

    const textLine2 = document.createElementNS(svgns, "text");
    textLine2.setAttribute("text-anchor", "middle");
    textLine2.setAttribute("y", "5");
    textLine2.setAttribute("font-size", "12");
    textLine2.setAttribute("font-family", "Dosis, sans-serif");
    textLine2.setAttribute("fill", "white");
    textLine2.textContent = `Seiten gelesen.`;

    const textPercent = document.createElementNS(svgns, "text");
    textPercent.setAttribute("text-anchor", "middle");
    textPercent.setAttribute("y", "30");
    textPercent.setAttribute("font-size", "22");
    textPercent.setAttribute("font-family", "Dosis, sans-serif");
    textPercent.setAttribute("fill", "white");
    textPercent.textContent = `${percent}%`;

    const textDelta = document.createElementNS(svgns, "text");
    textDelta.setAttribute("text-anchor", "middle");
    textDelta.setAttribute("y", "50");
    textDelta.setAttribute("font-size", "14");
    textDelta.setAttribute("font-family", "Dosis, sans-serif");
    textDelta.setAttribute("fill", deltaColor);
    textDelta.textContent = deltaText;

    textGroup.appendChild(textLine1);
    textGroup.appendChild(textLine2);
    textGroup.appendChild(textPercent);
    textGroup.appendChild(textDelta);

    svg.appendChild(bgCircle);
    svg.appendChild(progressCircle);
    svg.appendChild(textGroup);
    container.appendChild(svg);
  }

  // -----------------------------
  // Linearer Graph
  // -----------------------------
  function renderLinearGraph(dayOfYear, current, goal, avgPerDay, predictedDay) {
    const container = document.getElementById(TARGET_GRAPH_ID);
    if (!container) return;
    container.innerHTML = "";

    const width = 300;
    const height = 200;
    const padding = 0;
    const axisYOffset = 50;
    const svgns = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgns,"svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    const xScale = (width - padding * 2) / 365;
    const yScale = (height - padding - axisYOffset) / goal;

    // Achsen
    const axisX = document.createElementNS(svgns,"line");
    axisX.setAttribute("x1", padding);
    axisX.setAttribute("y1", height - axisYOffset);
    axisX.setAttribute("x2", width - padding);
    axisX.setAttribute("y2", height - axisYOffset);
    axisX.setAttribute("stroke","white");
    svg.appendChild(axisX);

    const axisY = document.createElementNS(svgns,"line");
    axisY.setAttribute("x1", padding);
    axisY.setAttribute("y1", padding);
    axisY.setAttribute("x2", padding);
    axisY.setAttribute("y2", height - axisYOffset);
    axisY.setAttribute("stroke","white");
    svg.appendChild(axisY);

    // Ist-Linie
    const linePoints = [];
    for(let i=0;i<=dayOfYear;i++){
      const x = padding + i*xScale;
      const y = height - axisYOffset - avgPerDay*i*yScale;
      linePoints.push(`${x},${y}`);
    }

    const line = document.createElementNS(svgns,"polyline");
    line.setAttribute("points", linePoints.join(" "));
    line.setAttribute("fill","none");
    line.setAttribute("stroke","#92230bff");
    line.setAttribute("stroke-width","2");
    svg.appendChild(line);

    container.appendChild(svg);
  }

  // -----------------------------
  // Start
  // -----------------------------
  loadDataAndRender();

})();
