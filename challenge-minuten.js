/**
 * @name challenge-minuten.js
 * @description CSV-Daten aus Spalte C summieren, Kreisdiagramm und linearer Graph mit modularer Tooltip-Funktion.
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

      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 86400000) + 1;
      const avgPerDay = totalMinutes / dayOfYear;
      const predictedDay = Math.ceil(GOAL / avgPerDay);

      renderProgressCircle(totalMinutes, GOAL, dayOfYear);
      renderLinearGraph(dayOfYear, totalMinutes, GOAL, avgPerDay, predictedDay);
    } catch (e) { console.error(e); }
  }

  // --- Helfer: Tooltip Logik ---
  function setupTooltip(svg, { padding, width, height, axisYOffset, xScale, yScale, current, goal, dayOfYear, predictedDay, avgPerDay }) {
    const svgns = "http://www.w3.org/2000/svg";

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
    overlay.setAttribute("width", width - 2 * padding);
    overlay.setAttribute("height", height - padding - axisYOffset);
    overlay.setAttribute("fill", "transparent");
    svg.appendChild(overlay);

    overlay.addEventListener("mousemove", (e) => {
      const rect = svg.getBoundingClientRect();
      let day = Math.round((e.clientX - rect.left - padding) / xScale);
      day = Math.max(0, Math.min(day, 365));

      let predictedValue;
      if (day <= dayOfYear) {
        predictedValue = avgPerDay * day;
      } else {
        const slope = (goal - current) / (predictedDay - dayOfYear);
        predictedValue = current + slope * (day - dayOfYear);
      }

      const xPos = padding + day * xScale;
      const yPos = height - axisYOffset - Math.min(current, avgPerDay * day) * yScale;
      const monthIndex = Math.min(11, Math.floor(day / 30.5));
      const monthName = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"][monthIndex];

      tooltip.setAttribute("x", xPos);
      tooltip.setAttribute("y", yPos - 15);
      tooltip.innerHTML = "";

      const line1 = document.createElementNS(svgns, "tspan");
      line1.setAttribute("x", xPos); line1.setAttribute("dy", "0");
      line1.textContent = `${monthName}:`;

      const line2 = document.createElementNS(svgns, "tspan");
      line2.setAttribute("x", xPos); line2.setAttribute("dy", "1.2em");
      line2.textContent = `${Math.round(predictedValue)} Min.`;

      tooltip.appendChild(line1); tooltip.appendChild(line2);

      if (!tooltip.bg) {
        const bg = document.createElementNS(svgns, "rect");
        bg.setAttribute("rx", 8); bg.setAttribute("ry", 8);
        bg.setAttribute("fill", "rgba(0,0,0,0.7)");
        svg.insertBefore(bg, tooltip);
        tooltip.bg = bg;
      }

      const bbox = tooltip.getBBox();
      const pR = 5;
      tooltip.bg.setAttribute("x", bbox.x - pR);
      tooltip.bg.setAttribute("y", bbox.y - pR);
      tooltip.bg.setAttribute("width", bbox.width + pR * 2);
      tooltip.bg.setAttribute("height", bbox.height + pR * 2);

      tooltip.setAttribute("visibility", "visible");
      tooltip.bg.setAttribute("visibility", "visible");
    });

    overlay.addEventListener("mouseleave", () => {
      tooltip.setAttribute("visibility", "hidden");
      if (tooltip.bg) tooltip.bg.setAttribute("visibility", "hidden");
    });
  }

  function renderProgressCircle(current, goal, dayOfYear) {
    const container = document.getElementById(TARGET_CIRCLE_ID);
    if (!container) return;

    const percent = ((current / goal) * 100).toFixed(1);
    const targetNow = Math.round(goal * (dayOfYear / 365));
    const delta = current - targetNow;
    
    const deltaText = delta === 0 ? "Genau im Plan!" : delta > 0 ? `+${delta} Vorsprung` : `-${Math.abs(delta)} Rückstand`;
    const deltaColor = delta === 0 ? "white" : delta > 0 ? "#13c913" : "#FF4500";
    
    const size = 220, stroke = 30, radius = 95, circ = 2 * Math.PI * radius;

    container.innerHTML = `
      <svg width="${size}" height="${size}" style="transform: rotate(-90deg)">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8ad0ff" />
            <stop offset="100%" stop-color="#023557ff" />
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
          <text y="-15" font-size="18">${current.toLocaleString()} / ${goal.toLocaleString()}</text>
          <text y="5" font-size="12">Minuten gehört.</text>
          <text y="30" font-size="22">${percent}%</text>
          <text y="50" font-size="14" fill="${deltaColor}">${deltaText}</text>
        </g>
      </svg>`;
  }

  function renderLinearGraph(dayOfYear, current, goal, avgPerDay, predictedDay) {
    const container = document.getElementById(TARGET_GRAPH_ID);
    if (!container) return;
    container.innerHTML = "";

    const width = 350, height = 220, padding = 30, axisYOffset = 50, svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns,"svg");
    svg.setAttribute("width", width); svg.setAttribute("height", height);

    const maxY = Math.max(current, goal);
    const xScale = (width - 2*padding) / 365;
    const yScale = (height - padding - axisYOffset) / maxY;

    // Flächen
    const fPts = [`${padding},${height-axisYOffset}`];
    const lPts = [];
    for(let i=0; i<=dayOfYear; i++) {
        const x = padding + i*xScale, y = height - axisYOffset - (avgPerDay*i)*yScale;
        fPts.push(`${x},${y}`); lPts.push(`${x},${y}`);
    }
    fPts.push(`${padding + dayOfYear*xScale},${height-axisYOffset}`);
    
    const fill = document.createElementNS(svgns, "polygon");
    fill.setAttribute("points", fPts.join(" "));
    fill.setAttribute("fill", "rgba(2, 53, 87, 0.3)");
    svg.appendChild(fill);

    const lastX = padding + dayOfYear*xScale, lastY = height - axisYOffset - current*yScale;
    const predX = padding + Math.min(predictedDay, 365)*xScale, predY = height - axisYOffset - goal*yScale;

    const pFill = document.createElementNS(svgns, "polygon");
    pFill.setAttribute("points", `${lastX},${height-axisYOffset} ${lastX},${lastY} ${predX},${predY} ${predX},${height-axisYOffset}`);
    pFill.setAttribute("fill", "rgba(138, 208, 255, 0.1)");
    svg.appendChild(pFill);

    // Achsen & Labels
    const line = (x1,y1,x2,y2) => {
      const el = document.createElementNS(svgns,"line");
      el.setAttribute("x1",x1); el.setAttribute("y1",y1); el.setAttribute("x2",x2); el.setAttribute("y2",y2);
      el.setAttribute("stroke","white"); return el;
    };
    svg.append(line(padding, height-axisYOffset, width-padding, height-axisYOffset), line(padding, padding, padding, height-axisYOffset));

    const lbl = (x, y, t, anchor, rot = 0) => {
      const el = document.createElementNS(svgns,"text");
      el.setAttribute("x",x); el.setAttribute("y",y); el.setAttribute("fill","white");
      el.setAttribute("font-size","13"); el.setAttribute("font-family","Dosis");
      el.setAttribute("text-anchor", anchor);
      if(rot) el.setAttribute("transform", `rotate(${rot} ${x} ${y})`);
      el.textContent = t; return el;
    };
    svg.append(lbl(width-padding, height-axisYOffset+15, "Minuten", "end"), lbl(15, padding+20, "Monat", "middle", -90));

    // Linien
    const poly = document.createElementNS(svgns,"polyline");
    poly.setAttribute("points", lPts.join(" "));
    poly.setAttribute("fill","none"); poly.setAttribute("stroke","#023557ff"); poly.setAttribute("stroke-width","3");
    svg.appendChild(poly);

    const pLine = document.createElementNS(svgns,"line");
    pLine.setAttribute("x1", lastX); pLine.setAttribute("y1", lastY);
    pLine.setAttribute("x2", predX); pLine.setAttribute("y2", predY);
    pLine.setAttribute("stroke","#8ad0ff"); pLine.setAttribute("stroke-width","3"); pLine.setAttribute("stroke-dasharray","8,4");
    svg.appendChild(pLine);

    // Tooltip Aufruf
    setupTooltip(svg, { padding, width, height, axisYOffset, xScale, yScale, current, goal, dayOfYear, predictedDay, avgPerDay });

    container.appendChild(svg);
  }

  loadDataAndRender();
})();