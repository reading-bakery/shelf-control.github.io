/**
 * @name challenge-minuten.js
 * @description CSV-Daten aus Spalte C summieren, Kreisdiagramm und linearer Graph mit Fokus auf Minuten/Monat.
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
      if (!response.ok) throw new Error("CSV Fehler");
      const csvText = await response.text();

      const results = Papa.parse(csvText, { header: true, skipEmptyLines: true, dynamicTyping: true });
      const totalMinutes = results.data.reduce((sum, row) => {
        const keys = Object.keys(row);
        return sum + (parseInt(row[keys[2]], 10) || 0);
      }, 0);

      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((today - startOfYear)/(1000*60*60*24)) + 1;
      const avgPerDay = totalMinutes / dayOfYear;
      const predictedDay = Math.ceil(GOAL / avgPerDay);

      renderProgressCircle(totalMinutes, GOAL, dayOfYear);
      renderLinearGraph(dayOfYear, totalMinutes, GOAL, avgPerDay, predictedDay);

    } catch (error) {
      console.error(error);
    }
  }

  function renderProgressCircle(current, goal, dayOfYear) {
    const percent = ((current / goal) * 100).toFixed(1);
    const container = document.getElementById(TARGET_CIRCLE_ID);
    if (!container) return;
    container.innerHTML = "";

    const targetNow = Math.round(goal * (dayOfYear / 365));
    const delta = current - targetNow;
    const deltaColor = delta >= 0 ? "#13c913" : "#FF4500";
    const deltaText = delta >= 0 ? `+${delta} Min.` : `${delta} Min.`;

    const size = 220, stroke = 30, radius = (size - stroke)/2, circ = 2 * Math.PI * radius;
    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns,"svg");
    svg.setAttribute("width", size); svg.setAttribute("height", size);
    svg.style.transform = "rotate(-90deg)";

    const bg = document.createElementNS(svgns,"circle");
    bg.setAttribute("cx", size/2); bg.setAttribute("cy", size/2); bg.setAttribute("r", radius);
    bg.setAttribute("stroke", "#353434"); bg.setAttribute("stroke-width", stroke); bg.setAttribute("fill","none");
    svg.appendChild(bg);

    const progress = document.createElementNS(svgns,"circle");
    progress.setAttribute("cx", size/2); progress.setAttribute("cy", size/2); progress.setAttribute("r", radius);
    progress.setAttribute("stroke", "#8ad0ff"); progress.setAttribute("stroke-width", stroke);
    progress.setAttribute("fill","none"); progress.setAttribute("stroke-dasharray", circ);
    progress.setAttribute("stroke-dashoffset", circ * (1 - Math.min(percent,100)/100));
    progress.setAttribute("stroke-linecap","round");
    svg.appendChild(progress);

    const g = document.createElementNS(svgns,"g");
    g.setAttribute("transform", `translate(${size/2}, ${size/2}) rotate(90)`);
    const txt = (y, f, c, t) => {
      const el = document.createElementNS(svgns,"text");
      el.setAttribute("text-anchor","middle"); el.setAttribute("y", y);
      el.setAttribute("font-size", f); el.setAttribute("fill", c);
      el.setAttribute("font-family","Dosis, sans-serif"); el.textContent = t;
      return el;
    };
    g.append(txt("-15","18","white",`${current} / ${goal}`), txt("5","12","white","Minuten gesamt"), txt("30","22","white",`${percent}%`), txt("50","14",deltaColor, deltaText));
    svg.appendChild(g); container.appendChild(svg);
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

    // Achsen
    const line = (x1,y1,x2,y2) => {
      const l = document.createElementNS(svgns,"line");
      l.setAttribute("x1",x1); l.setAttribute("y1",y1); l.setAttribute("x2",x2); l.setAttribute("y2",y2);
      l.setAttribute("stroke","white"); return l;
    };
    svg.append(line(pad, height-off, width-pad, height-off), line(pad, pad, pad, height-off));

    // LABELS (Minuten & Monat)
    const lbl = (x, y, t, anchor, rot = 0) => {
      const el = document.createElementNS(svgns,"text");
      el.setAttribute("x",x); el.setAttribute("y",y); el.setAttribute("fill","white");
      el.setAttribute("font-size","13"); el.setAttribute("font-family","Dosis");
      el.setAttribute("text-anchor", anchor);
      if(rot) el.setAttribute("transform", `rotate(${rot} ${x} ${y})`);
      el.textContent = t; return el;
    };
    svg.append(lbl(width-pad, height-off+15, "Minuten", "end"));
    svg.append(lbl(15, pad+20, "Monat", "middle", -90));

    // Flächen & Linien (Logik bleibt für die Kurve erhalten)
    const pts = [];
    for(let i=0; i<=dayOfYear; i++) pts.push(`${pad + i*xS},${height - off - (avgPerDay*i)*yS}`);
    
    const poly = document.createElementNS(svgns,"polyline");
    poly.setAttribute("points", pts.join(" "));
    poly.setAttribute("fill","none"); poly.setAttribute("stroke","#023557ff"); poly.setAttribute("stroke-width","2");
    svg.appendChild(poly);

    // Tooltip
    const tip = document.createElementNS(svgns, "text");
    tip.setAttribute("fill", "white"); tip.setAttribute("font-size", "12"); tip.setAttribute("font-family", "Dosis");
    tip.setAttribute("text-anchor", "middle"); tip.setAttribute("visibility", "hidden");
    svg.appendChild(tip);

    const overlay = document.createElementNS(svgns, "rect");
    overlay.setAttribute("x", pad); overlay.setAttribute("y", pad);
    overlay.setAttribute("width", width-2*pad); overlay.setAttribute("height", height-pad-off);
    overlay.setAttribute("fill", "transparent");
    svg.appendChild(overlay);

    overlay.addEventListener("mousemove", (e) => {
      const r = svg.getBoundingClientRect();
      let d = Math.round((e.clientX - r.left - pad) / xS);
      d = Math.max(0, Math.min(d, 365));
      const val = d <= dayOfYear ? avgPerDay * d : current + ((goal-current)/(predictedDay-dayOfYear))*(d-dayOfYear);
      const m = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"][Math.min(11, Math.floor(d/30.5))];

      tip.innerHTML = `<tspan x="${pad + d*xS}" dy="0">${m}</tspan><tspan x="${pad + d*xS}" dy="1.2em">${Math.round(val)} Min.</tspan>`;
      tip.setAttribute("x", pad + d*xS); tip.setAttribute("y", height - off - Math.min(maxY, val)*yS - 25);
      tip.setAttribute("visibility", "visible");
    });
    overlay.addEventListener("mouseleave", () => tip.setAttribute("visibility", "hidden"));

    container.appendChild(svg);
  }

  loadDataAndRender();
})();