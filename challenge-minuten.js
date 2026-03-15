/**
 * @name challenge-minuten.js
 * @description CSV-Daten aus Spalte C summieren, Kreisdiagramm und linearer Graph mit interaktivem Tooltip-Hintergrund.
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

  function renderProgressCircle(current, goal, dayOfYear) {
    const container = document.getElementById(TARGET_CIRCLE_ID);
    if (!container) return;

    const percent = ((current / goal) * 100).toFixed(1);
    const targetNow = Math.round(goal * (dayOfYear / 365));
    const delta = current - targetNow;
    
    // Deine gemerkte Logik für Text und Farbe
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

    const width = 350, height = 220, pad = 30, off = 50, svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns,"svg");
    svg.setAttribute("width", width); svg.setAttribute("height", height);

    const maxY = Math.max(current, goal);
    const xS = (width - 2*pad) / 365;
    const yS = (height - pad - off) / maxY;

    const fPts = [`${pad},${height-off}`];
    const lPts = [];
    for(let i=0; i<=dayOfYear; i++) {
        const x = pad + i*xS, y = height - off - (avgPerDay*i)*yS;
        fPts.push(`${x},${y}`); lPts.push(`${x},${y}`);
    }
    fPts.push(`${pad + dayOfYear*xS},${height-off}`);
    
    const fill = document.createElementNS(svgns, "polygon");
    fill.setAttribute("points", fPts.join(" "));
    fill.setAttribute("fill", "rgba(2, 53, 87, 0.3)");
    svg.appendChild(fill);

    const lastX = pad + dayOfYear*xS, lastY = height - off - current*yS;
    const predX = pad + Math.min(predictedDay, 365)*xS, predY = height - off - goal*yS;

    const pFill = document.createElementNS(svgns, "polygon");
    pFill.setAttribute("points", `${lastX},${height-off} ${lastX},${lastY} ${predX},${predY} ${predX},${height-off}`);
    pFill.setAttribute("fill", "rgba(138, 208, 255, 0.1)");
    svg.appendChild(pFill);

    const line = (x1,y1,x2,y2) => {
      const el = document.createElementNS(svgns,"line");
      el.setAttribute("x1",x1); el.setAttribute("y1",y1); el.setAttribute("x2",x2); el.setAttribute("y2",y2);
      el.setAttribute("stroke","white"); return el;
    };
    svg.append(line(pad, height-off, width-pad, height-off), line(pad, pad, pad, height-off));

    const lbl = (x, y, t, anchor, rot = 0) => {
      const el = document.createElementNS(svgns,"text");
      el.setAttribute("x",x); el.setAttribute("y",y); el.setAttribute("fill","white");
      el.setAttribute("font-size","13"); el.setAttribute("font-family","Dosis");
      el.setAttribute("text-anchor", anchor);
      if(rot) el.setAttribute("transform", `rotate(${rot} ${x} ${y})`);
      el.textContent = t; return el;
    };
    svg.append(lbl(width-pad, height-off+15, "Minuten", "end"), lbl(15, pad+20, "Monat", "middle", -90));

    const poly = document.createElementNS(svgns,"polyline");
    poly.setAttribute("points", lPts.join(" "));
    poly.setAttribute("fill","none"); poly.setAttribute("stroke","#023557ff"); poly.setAttribute("stroke-width","3");
    svg.appendChild(poly);

    const pLine = document.createElementNS(svgns,"line");
    pLine.setAttribute("x1", lastX); pLine.setAttribute("y1", lastY);
    pLine.setAttribute("x2", predX); pLine.setAttribute("y2", predY);
    pLine.setAttribute("stroke","#8ad0ff"); pLine.setAttribute("stroke-width","3"); pLine.setAttribute("stroke-dasharray","8,4");
    svg.appendChild(pLine);

    const tooltip = document.createElementNS(svgns, "text");
    tooltip.setAttribute("fill", "white"); tooltip.setAttribute("font-size", "12");
    tooltip.setAttribute("font-family", "Dosis, sans-serif"); tooltip.setAttribute("text-anchor", "middle");
    tooltip.setAttribute("visibility", "hidden");
    svg.appendChild(tooltip);

    const overlay = document.createElementNS(svgns, "rect");
    overlay.setAttribute("x", pad); overlay.setAttribute("y", pad);
    overlay.setAttribute("width", width-2*pad); overlay.setAttribute("height", height-pad-off);
    overlay.setAttribute("fill", "transparent");
    svg.appendChild(overlay);

    overlay.addEventListener("mousemove", (e) => {
      const rect = svg.getBoundingClientRect();
      let d = Math.round((e.clientX - rect.left - pad) / xS);
      d = Math.max(0, Math.min(d, 365));

      let val;
      if(d <= dayOfYear) {
        val = avgPerDay * d;
      } else {
        const slope = (goal - current) / (predictedDay - dayOfYear);
        val = current + slope * (d - dayOfYear);
      }

      const xPos = pad + d * xS;
      const yPos = height - off - Math.min(maxY, val) * yS;
      const monthName = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][Math.min(11, Math.floor(d/30.5))];

      tooltip.setAttribute("x", xPos);
      tooltip.setAttribute("y", yPos - 15);
      tooltip.innerHTML = "";

      const line1 = document.createElementNS(svgns, "tspan");
      line1.setAttribute("x", xPos); line1.setAttribute("dy", "0");
      line1.textContent = `${monthName}:`;

      const line2 = document.createElementNS(svgns, "tspan");
      line2.setAttribute("x", xPos); line2.setAttribute("dy", "1.2em");
      line2.textContent = `${Math.round(val)} Min.`;

      tooltip.appendChild(line1); tooltip.appendChild(line2);

      let bbox = tooltip.getBBox();
      let pR = 5;
      if(!tooltip.bg){
        tooltip.bg = document.createElementNS(svgns, "rect");
        tooltip.bg.setAttribute("rx", 8); tooltip.bg.setAttribute("ry", 8);
        tooltip.bg.setAttribute("fill", "rgba(0,0,0,0.7)");
        svg.insertBefore(tooltip.bg, tooltip);
      }
      tooltip.bg.setAttribute("x", bbox.x - pR); tooltip.bg.setAttribute("y", bbox.y - pR);
      tooltip.bg.setAttribute("width", bbox.width + pR*2); tooltip.bg.setAttribute("height", bbox.height + pR*2);
      tooltip.setAttribute("visibility", "visible");
      tooltip.bg.setAttribute("visibility", "visible");
    });

    overlay.addEventListener("mouseleave", () => {
      tooltip.setAttribute("visibility", "hidden");
      if(tooltip.bg) tooltip.bg.setAttribute("visibility", "hidden");
    });

    container.appendChild(svg);
  }

  loadDataAndRender();
})();