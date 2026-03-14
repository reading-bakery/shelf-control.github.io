/**
 * @name challenge-seiten.js
 * @description CSV-Daten aus Spalte B (Seiten) summieren, Kreisdiagramm und linearen Graphen mit Prognose, gefüllten Flächen und Tooltip.
 */
(function() {
  'use strict';

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=62129941&single=true&output=csv";
  const GOAL = 20000;
  const TARGET_CIRCLE_ID = 'pages-circle';
  const TARGET_GRAPH_ID = 'pages-graph';

  async function loadDataAndRender() {
    try {
      if (typeof Papa === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }

      const response = await fetch(CSV_URL);
      if (!response.ok) throw new Error("CSV konnte nicht geladen werden");
      const csvText = await response.text();

      const results = Papa.parse(csvText, { header: true, skipEmptyLines: true, dynamicTyping: true });
      if (!results.data || results.data.length === 0) throw new Error("Keine Daten in CSV");

      const totalPagesRead = results.data.reduce((sum, row) => {
        const keys = Object.keys(row);
        return sum + (parseInt(row[keys[1]], 10) || 0);
      }, 0);

      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((today - startOfYear)/(1000*60*60*24)) + 1;

      const avgPerDay = totalPagesRead / dayOfYear;
      const predictedDay = Math.ceil(GOAL / avgPerDay);

      renderProgressCircle(totalPagesRead, GOAL, dayOfYear);
      renderLinearGraph(dayOfYear, totalPagesRead, GOAL, avgPerDay, predictedDay);

    } catch (error) {
      console.error("Fehler beim Laden oder Verarbeiten der Daten:", error);
      const containerCircle = document.getElementById(TARGET_CIRCLE_ID);
      const containerGraph = document.getElementById(TARGET_GRAPH_ID);
      if(containerCircle) containerCircle.textContent = "Fehler beim Laden der Daten";
      if(containerGraph) containerGraph.textContent = "Fehler beim Laden der Daten";
    }
  }

  // -----------------------------
  // Kreisdiagramm
  // -----------------------------
  function renderProgressCircle(current, goal, dayOfYear) {
    const percent = ((current / goal) * 100).toFixed(1);
    const container = document.getElementById(TARGET_CIRCLE_ID);
    if (!container) return;
    container.innerHTML = "";

    const daysInYear = 365;
    const targetAtThisTime = Math.round(goal * (dayOfYear / daysInYear));
    const delta = current - targetAtThisTime;

    const deltaText = delta === 0 ? "Genau im Plan!" : delta > 0 ? `+${delta} Vorsprung` : `-${Math.abs(delta)} Rückstand`;
    const deltaColor = delta === 0 ? "white" : delta > 0 ? "#13c913" : "#FF4500";

    const size = 220, strokeWidth = 30;
    const radius = (size - strokeWidth)/2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - Math.min(percent,100)/100);
    const svgns = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgns,"svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.style.transform = "rotate(-90deg)";

    // Hintergrundkreis
    const bgCircle = document.createElementNS(svgns,"circle");
    bgCircle.setAttribute("cx", size/2);
    bgCircle.setAttribute("cy", size/2);
    bgCircle.setAttribute("r", radius);
    bgCircle.setAttribute("stroke", "#353434ff");
    bgCircle.setAttribute("stroke-width", strokeWidth);
    bgCircle.setAttribute("fill","none");
    svg.appendChild(bgCircle);

    // Farbverlauf
    const defs = document.createElementNS(svgns,"defs");
    const linearGradient = document.createElementNS(svgns,"linearGradient");
    linearGradient.setAttribute("id","greenGradient");
    linearGradient.setAttribute("x1","0%"); linearGradient.setAttribute("y1","0%");
    linearGradient.setAttribute("x2","100%"); linearGradient.setAttribute("y2","0%");
    const stop1 = document.createElementNS(svgns,"stop"); stop1.setAttribute("offset","0%"); stop1.setAttribute("stop-color","#025a2aff");
    const stop2 = document.createElementNS(svgns,"stop"); stop2.setAttribute("offset","100%"); stop2.setAttribute("stop-color","#4bd886");
    linearGradient.appendChild(stop1); linearGradient.appendChild(stop2);
    defs.appendChild(linearGradient);
    svg.appendChild(defs);

    // Fortschrittskreis
    const progressCircle = document.createElementNS(svgns,"circle");
    progressCircle.setAttribute("cx", size/2);
    progressCircle.setAttribute("cy", size/2);
    progressCircle.setAttribute("r", radius);
    progressCircle.setAttribute("stroke", "url(#greenGradient)");
    progressCircle.setAttribute("stroke-width", strokeWidth);
    progressCircle.setAttribute("fill","none");
    progressCircle.setAttribute("stroke-dasharray", circumference);
    progressCircle.setAttribute("stroke-dashoffset", offset);
    progressCircle.setAttribute("stroke-linecap","round");
    svg.appendChild(progressCircle);

    // Text
    const textGroup = document.createElementNS(svgns,"g");
    textGroup.setAttribute("transform", `translate(${size/2}, ${size/2}) rotate(90)`);

    const text1 = document.createElementNS(svgns,"text");
    text1.setAttribute("text-anchor","middle");
    text1.setAttribute("y","-15");
    text1.setAttribute("font-size","18");
    text1.setAttribute("fill","white");
    text1.setAttribute("font-family","Dosis, sans-serif");
    text1.textContent = `${current.toLocaleString('de-DE')} von ${goal.toLocaleString('de-DE')}`;

    const text2 = document.createElementNS(svgns,"text");
    text2.setAttribute("text-anchor","middle");
    text2.setAttribute("y","5");
    text2.setAttribute("font-size","12");
    text2.setAttribute("fill","white");
    text2.setAttribute("font-family","Dosis, sans-serif");
    text2.textContent = "Seiten gelesen";

    const textPercent = document.createElementNS(svgns,"text");
    textPercent.setAttribute("text-anchor","middle");
    textPercent.setAttribute("y","30");
    textPercent.setAttribute("font-size","22");
    textPercent.setAttribute("fill","white");
    textPercent.setAttribute("font-family","Dosis, sans-serif");
    textPercent.textContent = `${percent}%`;

    const textDelta = document.createElementNS(svgns,"text");
    textDelta.setAttribute("text-anchor","middle");
    textDelta.setAttribute("y","50");
    textDelta.setAttribute("font-size","14");
    textDelta.setAttribute("fill", deltaColor);
    textDelta.setAttribute("font-family","Dosis, sans-serif");
    textDelta.textContent = deltaText;

    textGroup.appendChild(text1);
    textGroup.appendChild(text2);
    textGroup.appendChild(textPercent);
    textGroup.appendChild(textDelta);

    svg.appendChild(textGroup);
    container.appendChild(svg);
  }

  // -----------------------------
  // Linearer Graph mit Prognose + Tooltip
  // -----------------------------
  function renderLinearGraph(dayOfYear, current, goal, avgPerDay, predictedDay) {
    const container = document.getElementById(TARGET_GRAPH_ID);
    if (!container) return;
    container.innerHTML = "";

    const width = 350;
    const height = 220;
    const padding = 30;
    const axisYOffset = 50;
    const svgns = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgns,"svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    const maxY = Math.max(current, goal);
    const xScale = (width - 2*padding) / 365;
    const yScale = (height - padding - axisYOffset) / maxY;

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

    // -----------------------------
  // Achsenbeschriftungen
  // -----------------------------

  // X-Achse: "Bücher" (rechts unten)
  const xLabel = document.createElementNS(svgns, "text");
  xLabel.setAttribute("x", width - padding); // rechts
  xLabel.setAttribute("y", height - axisYOffset + 15); // unterhalb der Achse
  xLabel.setAttribute("fill", "white");
  xLabel.setAttribute("font-size", "13");
  xLabel.setAttribute("font-family", "Dosis, sans-serif");
  xLabel.setAttribute("text-anchor", "end"); // rechtsbündig
  xLabel.textContent = "Seiten";
  svg.appendChild(xLabel);

  // Y-Achse: "Monat" (links, hochkant)
  const yLabel = document.createElementNS(svgns, "text");
  const labelX = 15;               // Abstand vom linken Rand
  const labelY = padding + 20;     // Abstand vom oberen Rand
  yLabel.setAttribute("x", labelX);
  yLabel.setAttribute("y", labelY);
  yLabel.setAttribute("fill", "white");
  yLabel.setAttribute("font-size", "13");
  yLabel.setAttribute("font-family", "Dosis, sans-serif");
  yLabel.setAttribute("text-anchor", "middle");
  yLabel.setAttribute("transform", `rotate(-90 ${labelX} ${labelY})`); // Text hochkant
  yLabel.textContent = "Monat";
  svg.appendChild(yLabel);


    // -----------------------------
    // Gefüllte Flächen
    // -----------------------------
    const fillPoints = [`${padding},${height-axisYOffset}`];
    for(let i=0;i<=dayOfYear;i++){
      const x = padding + i*xScale;
      const y = height - axisYOffset - avgPerDay*i*yScale;
      fillPoints.push(`${x},${y}`);
    }
    fillPoints.push(`${padding + dayOfYear*xScale},${height-axisYOffset}`);

    const fillPolygon = document.createElementNS(svgns,"polygon");
    fillPolygon.setAttribute("points", fillPoints.join(" "));
    fillPolygon.setAttribute("fill","rgba(2,90,42,0.2)");
    svg.appendChild(fillPolygon);

    const lastX = padding + dayOfYear*xScale;
    const lastY = height - axisYOffset - current*yScale;
    const predX = padding + Math.min(predictedDay,365)*xScale;
    const predY = height - axisYOffset - goal*yScale;

    const predPolygon = document.createElementNS(svgns,"polygon");
    predPolygon.setAttribute("points", [
      `${lastX},${height-axisYOffset}`,
      `${lastX},${lastY}`,
      `${predX},${predY}`,
      `${predX},${height-axisYOffset}`
    ].join(" "));
    predPolygon.setAttribute("fill","rgba(75,216,134,0.2)");
    svg.appendChild(predPolygon);

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
    line.setAttribute("stroke","#025a2aff");
    line.setAttribute("stroke-width","2");
    svg.appendChild(line);

    // Prognose-Linie
    const predLine = document.createElementNS(svgns,"line");
    predLine.setAttribute("x1", lastX);
    predLine.setAttribute("y1", lastY);
    predLine.setAttribute("x2", predX);
    predLine.setAttribute("y2", predY);
    predLine.setAttribute("stroke","#4bd886");
    predLine.setAttribute("stroke-width","2");
    predLine.setAttribute("stroke-dasharray","5,5");
    svg.appendChild(predLine);

    // -----------------------------
    // Tooltip
    // -----------------------------
    // Tooltip vorbereiten
const tooltip = document.createElementNS(svgns, "text");
tooltip.setAttribute("fill", "white");
tooltip.setAttribute("font-size", "12");
tooltip.setAttribute("font-family", "Dosis, sans-serif");
tooltip.setAttribute("text-anchor", "middle");
tooltip.setAttribute("visibility", "hidden");
svg.appendChild(tooltip);

const overlay = document.createElementNS(svgns, "rect");
overlay.setAttribute("x", padding);
overlay.setAttribute("y", padding);
overlay.setAttribute("width", width - 2*padding);
overlay.setAttribute("height", height - padding - axisYOffset);
overlay.setAttribute("fill", "transparent");
svg.appendChild(overlay);

overlay.addEventListener("mousemove", (e) => {
  const rect = svg.getBoundingClientRect();
  let day = Math.round((e.clientX - rect.left - padding) / xScale);
  day = Math.max(0, Math.min(day, 365));

  // Prognose berechnen
  let predictedY;
  if(day <= predictedDay){
    const slope = (goal - current) / (predictedDay - dayOfYear);
    predictedY = current + slope * (day - dayOfYear);
  } else {
    predictedY = goal;
  }

  const xPos = padding + day * xScale;
  const yPos = height - axisYOffset - Math.min(current, avgPerDay * day) * yScale;

  const monthIndex = Math.min(11, Math.floor(day / 30));
  const monthName = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][monthIndex];

  // -----------------------------
  // Tooltip position
  tooltip.setAttribute("x", xPos);
  tooltip.setAttribute("y", yPos - 10);

  // -----------------------------
  // Zeilenumbruch via <tspan>
  tooltip.innerHTML = "";

  const line1 = document.createElementNS(svgns, "tspan");
  line1.setAttribute("x", xPos);
  line1.setAttribute("dy", "0");
  line1.textContent = `${monthName}:`;

  const line2 = document.createElementNS(svgns, "tspan");
  line2.setAttribute("x", xPos);
  line2.setAttribute("dy", "1.2em");
  line2.textContent = `${Math.round(predictedY)} Seiten`;

  tooltip.appendChild(line1);
  tooltip.appendChild(line2);

  // -----------------------------
  // Tooltip Hintergrund
  let bbox = tooltip.getBBox();
  let paddingRect = 5;

  let bgX = bbox.x - paddingRect;
  let bgY = bbox.y - paddingRect;
  let bgWidth = bbox.width + paddingRect*2;
  let bgHeight = bbox.height + paddingRect*2;

  if(!tooltip.bg){
    const bg = document.createElementNS(svgns, "rect");
    bg.setAttribute("rx", 8);
    bg.setAttribute("ry", 8);
    bg.setAttribute("fill", "rgba(0,0,0,0.5)");
    svg.insertBefore(bg, tooltip); // Hintergrund unter Text
    tooltip.bg = bg;
  }

  tooltip.bg.setAttribute("x", bgX);
  tooltip.bg.setAttribute("y", bgY);
  tooltip.bg.setAttribute("width", bgWidth);
  tooltip.bg.setAttribute("height", bgHeight);

  tooltip.setAttribute("visibility", "visible");
});

overlay.addEventListener("mouseleave", () => tooltip.setAttribute("visibility", "hidden"));


    container.appendChild(svg);
  }

  loadDataAndRender();

})();
