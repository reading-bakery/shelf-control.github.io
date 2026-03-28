/**
 * @name challenge-minuten.js
 * @description CSV-Daten summieren, Kreisdiagramm und linearer Graph mit Pokal-Marker und gelber Ziel-Fläche. Tooltip entfernt.
 */
(function() {
  'use strict';

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=62129941&single=true&output=csv";
  const GOAL = 15000;
  const TARGET_CIRCLE_ID = 'minutes-circle';
  const TARGET_GRAPH_ID = 'minutes-graph';

  async function loadDataAndRender() {
    try {
      if (typeof Papa === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }

      const response = await fetch(CSV_URL);
      const csvText = await response.text();
      const results = Papa.parse(csvText, { header: true, skipEmptyLines: true, dynamicTyping: true });

      const totalMinutes = results.data.reduce((sum, row) => {
        const keys = Object.keys(row);
        return sum + (parseInt(row[keys[2]], 10) || 0);
      }, 0);

      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((today - startOfYear) / 86400000) + 1;
      
      const avgPerDay = totalMinutes / dayOfYear;
      const predictedDay = Math.ceil(GOAL / avgPerDay);
      const finalProjection = Math.round(avgPerDay * 365);

      renderProgressCircle(totalMinutes, GOAL, dayOfYear);
      renderLinearGraph(dayOfYear, totalMinutes, GOAL, avgPerDay, predictedDay, finalProjection);
    } catch (e) { console.error(e); }
  }

  function renderProgressCircle(current, goal, dayOfYear) {
    const container = document.getElementById(TARGET_CIRCLE_ID);
    if (!container) return;

    const percent = ((current / goal) * 100).toFixed(1);
    const targetNow = Math.round(goal * (dayOfYear / 365));
    const delta = current - targetNow;
    
    const deltaText = delta === 0 ? "Genau im Plan!" : delta > 0 ? `+${delta.toLocaleString('de-DE')} Vorsprung` : `-${Math.abs(delta).toLocaleString('de-DE')} Rückstand`;
    const deltaColor = delta === 0 ? "white" : delta > 0 ? "#13c913" : "#FF4500";
    
    const size = 220, stroke = 30, radius = 95, circ = 2 * Math.PI * radius;

    container.innerHTML = `
      <svg width="${size}" height="${size}" style="transform: rotate(-90deg)">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#023557ff" />
            <stop offset="100%" stop-color="#8ad0ff" />
          </linearGradient>
        </defs>
        <circle cx="110" cy="110" r="${radius}" stroke="#353434" stroke-width="${stroke}" fill="none" />
        <circle cx="110" cy="110" r="${radius}" 
          stroke="url(#progressGradient)" 
          stroke-width="${stroke}" fill="none" 
          stroke-dasharray="${circ}" 
          stroke-dashoffset="${circ * (1 - Math.min(percent,100)/100)}" 
          stroke-linecap="round" />
        <g style="transform: rotate(90deg) translate(110px, -110px); font-family: Dosis, sans-serif; fill: white; text-anchor: middle;">
          <text y="-15" font-size="18">${current.toLocaleString('de-DE')} / ${goal.toLocaleString('de-DE')}</text>
          <text y="5" font-size="12">Minuten gehört.</text>
          <text y="30" font-size="22">${percent}%</text>
          <text y="50" font-size="14" fill="${deltaColor}">${deltaText}</text>
        </g>
      </svg>`;
  }

  function renderLinearGraph(dayOfYear, current, goal, avgPerDay, predictedDay, finalProjection) {
    const container = document.getElementById(TARGET_GRAPH_ID);
    if (!container) return;
    container.innerHTML = "";

    const width = 350, height = 220, padding = 30, axisYOffset = 50, svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns,"svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const maxY = Math.max(goal, finalProjection);
    const xScale = (width - 2*padding) / 365;
    const yScale = (height - padding - axisYOffset) / maxY;

    // Achsen
    const lineGen = (x1,y1,x2,y2) => {
      const el = document.createElementNS(svgns,"line");
      el.setAttribute("x1",x1); el.setAttribute("y1",y1); el.setAttribute("x2",x2); el.setAttribute("y2",y2);
      el.setAttribute("stroke","white"); return el;
    };
    svg.append(lineGen(padding, height-axisYOffset, width-padding, height-axisYOffset), lineGen(padding, padding, padding, height-axisYOffset));

    // --- NEU: ACHSENBESCHRIFTUNG "BÜCHER" ---
    const xAxisLabel = document.createElementNS(svgns, "text");
    xAxisLabel.setAttribute("x", width - padding); 
    xAxisLabel.setAttribute("y", height - axisYOffset + 15);
    xAxisLabel.setAttribute("fill", "white");
    xAxisLabel.setAttribute("font-size", "14");
    xAxisLabel.setAttribute("font-family", "Dosis");
    xAxisLabel.setAttribute("text-anchor", "end");
    xAxisLabel.textContent = "Minuten";
    svg.appendChild(xAxisLabel);



    // Flächen: IST
    const fPts = [`${padding},${height-axisYOffset}`];
    const lPts = [];
    for(let i=0; i<=dayOfYear; i++) {
        const x = padding + i*xScale, y = height - axisYOffset - (avgPerDay*i)*yScale;
        fPts.push(`${x},${y}`); lPts.push(`${x},${y}`);
    }
    fPts.push(`${padding + dayOfYear*xScale},${height-axisYOffset}`);
    const fill = document.createElementNS(svgns, "polygon");
    fill.setAttribute("points", fPts.join(" ")); fill.setAttribute("fill", "rgba(2, 53, 87, 0.3)");
    svg.appendChild(fill);

    // Flächen: PROGNOSE bis Ziel
    const lastX = padding + dayOfYear*xScale, lastY = height - axisYOffset - current*yScale;
    const goalDayX = padding + Math.min(predictedDay, 365)*xScale, goalY = height - axisYOffset - goal*yScale;
    const pFill = document.createElementNS(svgns, "polygon");
    pFill.setAttribute("points", `${lastX},${height-axisYOffset} ${lastX},${lastY} ${goalDayX},${goalY} ${goalDayX},${height-axisYOffset}`);
    pFill.setAttribute("fill", "rgba(138, 208, 255, 0.15)");
    svg.appendChild(pFill);

    // Bereich: ÜBERSCHUSS (Gelb)
    if (finalProjection > goal) {
      const endYearX = padding + 365 * xScale, endYearY = height - axisYOffset - finalProjection * yScale;
      const sFill = document.createElementNS(svgns, "polygon");
      sFill.setAttribute("points", `${goalDayX},${height-axisYOffset} ${goalDayX},${goalY} ${endYearX},${endYearY} ${endYearX},${height-axisYOffset}`);
      sFill.setAttribute("fill", "rgba(255, 215, 0, 0.2)");
      svg.appendChild(sFill);

      const pVal = document.createElementNS(svgns, "text");
      pVal.setAttribute("x", endYearX); pVal.setAttribute("y", endYearY - 10);
      pVal.setAttribute("fill", "#FFD700"); pVal.setAttribute("font-size", "14");
      pVal.setAttribute("font-weight", "bold"); pVal.setAttribute("font-family", "Dosis");
      pVal.setAttribute("text-anchor", "end"); pVal.textContent = finalProjection.toLocaleString('de-DE');
      svg.appendChild(pVal);

      const dotLine = document.createElementNS(svgns, "line");
      dotLine.setAttribute("x1", goalDayX); dotLine.setAttribute("y1", goalY);
      dotLine.setAttribute("x2", endYearX); dotLine.setAttribute("y2", endYearY);
      dotLine.setAttribute("stroke", "#FFD700"); dotLine.setAttribute("stroke-width", "2");
      dotLine.setAttribute("stroke-dasharray", "2,4"); svg.appendChild(dotLine);
    }

    // --- NEU: IST-WERT ANZEIGE ---
    const currentValText = document.createElementNS(svgns, "text");
    currentValText.setAttribute("x", lastX); currentValText.setAttribute("y", lastY - 10);
    currentValText.setAttribute("fill", "#8ad0ff"); currentValText.setAttribute("font-size", "16");
    currentValText.setAttribute("font-weight", "bold"); currentValText.setAttribute("font-family", "Dosis");
    currentValText.setAttribute("text-anchor", "middle"); currentValText.textContent = current;
    svg.appendChild(currentValText);


    // Linien: IST & PROGNOSE
    const poly = document.createElementNS(svgns,"polyline");
    poly.setAttribute("points", lPts.join(" "));
    poly.setAttribute("fill","none"); poly.setAttribute("stroke","#023557ff"); poly.setAttribute("stroke-width","3");
    svg.appendChild(poly);

    const pLine = document.createElementNS(svgns,"line");
    pLine.setAttribute("x1", lastX); pLine.setAttribute("y1", lastY);
    pLine.setAttribute("x2", goalDayX); pLine.setAttribute("y2", goalY);
    pLine.setAttribute("stroke","#8ad0ff"); pLine.setAttribute("stroke-width","2"); pLine.setAttribute("stroke-dasharray","5,5");
    svg.appendChild(pLine);

    // Ziel-Markierung (Pokal)
    if (predictedDay <= 365) {
      const gX = padding + predictedDay * xScale, gY = height - axisYOffset - goal * yScale;
      const trophy = document.createElementNS(svgns, "text");
      trophy.setAttribute("x", gX); trophy.setAttribute("y", gY + 7);
      trophy.setAttribute("font-size", "20"); trophy.setAttribute("text-anchor", "middle");
      trophy.textContent = "🏆"; svg.appendChild(trophy);

      const monthNames = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
      const label = document.createElementNS(svgns, "text");
      label.setAttribute("x", gX + 3); label.setAttribute("y", gY + 25);
      label.setAttribute("fill", "orange"); label.setAttribute("font-size", "12");
      label.setAttribute("font-weight", "bold"); label.setAttribute("font-family", "Dosis");
      label.textContent = monthNames[Math.min(11, Math.floor(predictedDay / 30.5))];
      svg.appendChild(label);
    }

    container.appendChild(svg);
  }

  loadDataAndRender();
})();