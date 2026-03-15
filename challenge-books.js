/**
 * @name books-challenge.js
 * @description Lese-Challenge mit korrekter Tablet-Logik und Fehlerbehebung.
 */
(function() {
  'use strict';

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=62129941&single=true&output=csv";
  const GOAL = 90;

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

      const keys = Object.keys(results.data[0]);
      const buchSpalte = keys.find(k => k.trim().toLowerCase() === 'bücher');
      const current = parseInt(results.data[0][buchSpalte], 10) || 0;

      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((today - startOfYear)/(1000*60*60*24)) + 1;

      const avgPerDay = current / dayOfYear;
      const predictedDay = Math.ceil(GOAL / avgPerDay);
      const finalProjection = Math.round(avgPerDay * 365);

      renderProgressCircle(current, GOAL, dayOfYear);
      renderLinearGraph(dayOfYear, current, GOAL, avgPerDay, predictedDay, finalProjection);

    } catch (error) {
      console.error("Fehler beim Laden oder Verarbeiten der Daten:", error);
    }
  }

  function renderProgressCircle(current, goal, dayOfYear) {
    const percent = ((current / goal) * 100).toFixed(1);
    const container = document.getElementById('books-circle');
    if (!container) return;
    container.innerHTML = "";

    const targetAtThisTime = Math.round(goal * (dayOfYear / 365));
    const delta = current - targetAtThisTime;
    const deltaText = delta === 0 ? "Genau im Plan!" : delta > 0 ? `+${delta} Vorsprung` : `-${Math.abs(delta)} Rückstand`;
    const deltaColor = delta === 0 ? "white" : delta > 0 ? "#13c913" : "#FF4500";

    const size = 220, strokeWidth = 30, radius = (size - strokeWidth)/2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - Math.min(percent,100)/100);
    const svgns = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgns,"svg");
    svg.setAttribute("width", size); svg.setAttribute("height", size);
    svg.style.transform = "rotate(-90deg)";

    const defs = document.createElementNS(svgns,"defs");
    const gradient = document.createElementNS(svgns,"linearGradient");
    gradient.setAttribute("id","coralGradient");
    const stop1 = document.createElementNS(svgns,"stop"); stop1.setAttribute("offset","0%"); stop1.setAttribute("stop-color","#92230bff");
    const stop2 = document.createElementNS(svgns,"stop"); stop2.setAttribute("offset","100%"); stop2.setAttribute("stop-color","#ff7f50");
    gradient.append(stop1, stop2); defs.appendChild(gradient); svg.appendChild(defs);

    const bgCircle = document.createElementNS(svgns,"circle");
    bgCircle.setAttribute("cx", size/2); bgCircle.setAttribute("cy", size/2); bgCircle.setAttribute("r", radius);
    bgCircle.setAttribute("stroke", "#353434"); bgCircle.setAttribute("stroke-width", strokeWidth); bgCircle.setAttribute("fill","none");
    svg.appendChild(bgCircle);

    const progressCircle = document.createElementNS(svgns,"circle");
    progressCircle.setAttribute("cx", size/2); progressCircle.setAttribute("cy", size/2); progressCircle.setAttribute("r", radius);
    progressCircle.setAttribute("stroke", "url(#coralGradient)"); progressCircle.setAttribute("stroke-width", strokeWidth);
    progressCircle.setAttribute("fill","none"); progressCircle.setAttribute("stroke-dasharray", circumference);
    progressCircle.setAttribute("stroke-dashoffset", offset); progressCircle.setAttribute("stroke-linecap","round");
    svg.appendChild(progressCircle);

    const textGroup = document.createElementNS(svgns,"g");
    textGroup.setAttribute("transform", `translate(${size/2}, ${size/2}) rotate(90)`);

    const t1 = document.createElementNS(svgns,"text");
    t1.setAttribute("text-anchor","middle"); t1.setAttribute("y","-15");
    t1.setAttribute("font-size","18"); t1.setAttribute("fill","white"); t1.setAttribute("font-family","Dosis, sans-serif");
    t1.textContent = `${current} von ${goal}`;

    const tPercent = document.createElementNS(svgns,"text");
    tPercent.setAttribute("text-anchor","middle"); tPercent.setAttribute("y","30");
    tPercent.setAttribute("font-size","22"); tPercent.setAttribute("fill","white"); tPercent.setAttribute("font-family","Dosis, sans-serif");
    tPercent.textContent = `${percent}%`;

    const tDelta = document.createElementNS(svgns,"text");
    tDelta.setAttribute("text-anchor","middle"); tDelta.setAttribute("y","50");
    tDelta.setAttribute("font-size","14"); tDelta.setAttribute("fill", deltaColor); tDelta.setAttribute("font-family","Dosis, sans-serif");
    tDelta.textContent = deltaText;

    textGroup.append(t1, tPercent, tDelta); svg.appendChild(textGroup);
    container.appendChild(svg);
  }

  function renderLinearGraph(dayOfYear, current, goal, avgPerDay, predictedDay, finalProjection) {
    const container = document.getElementById('books-graph');
    if (!container) return;
    container.innerHTML = "";

    // 1. Breite bestimmen (Nur einmal!)
    const isTabletPortrait = window.matchMedia("(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)").matches;
    const width = isTabletPortrait ? 500 : 350; 
    
    const height = 220, padding = 30, axisYOffset = 50, svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns,"svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const maxY = Math.max(goal, finalProjection);
    const xScale = (width - 2*padding) / 365;
    const yScale = (height - padding - axisYOffset) / maxY;

    const lastX = padding + dayOfYear * xScale;
    const lastY = height - axisYOffset - current * yScale;

    // Achsen-Generator
    const lineGen = (x1,y1,x2,y2) => {
      const el = document.createElementNS(svgns,"line");
      el.setAttribute("x1",x1); el.setAttribute("y1",y1); el.setAttribute("x2",x2); el.setAttribute("y2",y2);
      el.setAttribute("stroke","white"); return el;
    };
    svg.append(lineGen(padding, height-axisYOffset, width-padding, height-axisYOffset), lineGen(padding, padding, padding, height-axisYOffset));

    // Flächen: IST
    const fillPoints = [`${padding},${height-axisYOffset}`];
    for(let i=0; i<=dayOfYear; i++) fillPoints.push(`${padding + i*xScale},${height - axisYOffset - avgPerDay*i*yScale}`);
    fillPoints.push(`${lastX},${height-axisYOffset}`);
    const fillPoly = document.createElementNS(svgns,"polygon");
    fillPoly.setAttribute("points", fillPoints.join(" ")); fillPoly.setAttribute("fill","rgba(146,35,11,0.3)");
    svg.appendChild(fillPoly);

    // Flächen: PROGNOSE
    const goalDayX = padding + Math.min(predictedDay,365)*xScale, goalY = height - axisYOffset - goal*yScale;
    const predFill = document.createElementNS(svgns,"polygon");
    predFill.setAttribute("points", [`${lastX},${height-axisYOffset}`, `${lastX},${lastY}`, `${goalDayX},${goalY}`, `${goalDayX},${height-axisYOffset}`].join(" "));
    predFill.setAttribute("fill","rgba(255,127,80,0.2)");
    svg.appendChild(predFill);

    // Bereich: ÜBERSCHUSS (Gelb)
    if (finalProjection > goal) {
      const endYearX = padding + 365 * xScale, endYearY = height - axisYOffset - finalProjection * yScale;
      const surplusFill = document.createElementNS(svgns, "polygon");
      surplusFill.setAttribute("points", [`${goalDayX},${height-axisYOffset}`, `${goalDayX},${goalY}`, `${endYearX},${endYearY}`, `${endYearX},${height-axisYOffset}`].join(" "));
      surplusFill.setAttribute("fill", "rgba(255, 215, 0, 0.25)");
      svg.appendChild(surplusFill);

      const pValueText = document.createElementNS(svgns, "text");
      pValueText.setAttribute("x", endYearX); pValueText.setAttribute("y", endYearY - 10);
      pValueText.setAttribute("fill", "#FFD700"); pValueText.setAttribute("font-size", "16");
      pValueText.setAttribute("font-weight", "bold"); pValueText.setAttribute("font-family", "Dosis");
      pValueText.setAttribute("text-anchor", "end"); pValueText.textContent = finalProjection;
      svg.appendChild(pValueText);

      const dotLine = document.createElementNS(svgns, "line");
      dotLine.setAttribute("x1", goalDayX); dotLine.setAttribute("y1", goalY);
      dotLine.setAttribute("x2", endYearX); dotLine.setAttribute("y2", endYearY);
      dotLine.setAttribute("stroke", "#FFD700"); dotLine.setAttribute("stroke-width", "2");
      dotLine.setAttribute("stroke-dasharray", "2,4"); svg.appendChild(dotLine);
    }

    // IST-WERT ANZEIGE
    const currentValText = document.createElementNS(svgns, "text");
    currentValText.setAttribute("x", lastX); currentValText.setAttribute("y", lastY - 10);
    currentValText.setAttribute("fill", "#92230bff"); currentValText.setAttribute("font-size", "16");
    currentValText.setAttribute("font-weight", "bold"); currentValText.setAttribute("font-family", "Dosis");
    currentValText.setAttribute("text-anchor", "middle"); currentValText.textContent = current;
    svg.appendChild(currentValText);

    // Fortschrittslinie
    const linePoints = [];
    for(let i=0; i<=dayOfYear; i++) linePoints.push(`${padding + i*xScale},${height - axisYOffset - avgPerDay*i*yScale}`);
    const poly = document.createElementNS(svgns,"polyline");
    poly.setAttribute("points", linePoints.join(" ")); poly.setAttribute("fill","none");
    poly.setAttribute("stroke","#92230bff"); poly.setAttribute("stroke-width","2");
    svg.appendChild(poly);

    const pLine = document.createElementNS(svgns,"line");
    pLine.setAttribute("x1", lastX); pLine.setAttribute("y1", lastY);
    pLine.setAttribute("x2", goalDayX); pLine.setAttribute("y2", goalY);
    pLine.setAttribute("stroke","#ff7f50"); pLine.setAttribute("stroke-width","2"); pLine.setAttribute("stroke-dasharray","5,5");
    svg.appendChild(pLine);

    // Ziel-Markierung (🏆)
    if (predictedDay <= 365) {
      const trophy = document.createElementNS(svgns, "text");
      trophy.setAttribute("x", goalDayX); trophy.setAttribute("y", goalY + 7);
      trophy.setAttribute("font-size", "20"); trophy.setAttribute("text-anchor", "middle");
      trophy.textContent = "🏆"; svg.appendChild(trophy);

      const monthNames = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
      const label = document.createElementNS(svgns, "text");
      label.setAttribute("x", goalDayX + 3); label.setAttribute("y", goalY + 25);
      label.setAttribute("fill", "orange"); label.setAttribute("font-size", "12");
      label.setAttribute("font-weight", "bold"); label.setAttribute("font-family", "Dosis");
      label.textContent = monthNames[Math.min(11, Math.floor(predictedDay / 30.5))];
      svg.appendChild(label);
    }

    container.appendChild(svg);
  }

  loadDataAndRender();
})();