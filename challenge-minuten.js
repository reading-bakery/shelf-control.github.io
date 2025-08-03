/**
 * @name challenge-minuten.js
 * @description Lädt CSV-Daten, summiert die Minuten und zeigt den Fortschritt in einem SVG-Kreisdiagramm an.
 * Der gesamte Code ist in einem IIFE gekapselt, um globale Konflikte zu vermeiden.
 */
(function() {
  'use strict';

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=62129941&single=true&output=csv";
  const GOAL = 15000;
  const TARGET_DIV_ID = 'minutes-circle';

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

      const results = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });

      const totalMinutesRead = results.data.reduce((sum, row) => {
        return sum + (row.Minuten || 0);
      }, 0);
      
      renderProgressCircle(totalMinutesRead, GOAL);

    } catch (error) {
      console.error("Fehler beim Laden oder Verarbeiten der Daten:", error);
      const container = document.getElementById(TARGET_DIV_ID);
      if (container) {
          container.textContent = "Fehler beim Laden der Daten";
      }
    }
  }

  function renderProgressCircle(current, goal) {
    const percent = ((current / goal) * 100).toFixed(1);

    const container = document.getElementById(TARGET_DIV_ID);
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
    svg.style.filter = "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2))";

    // Hintergrundkreis
    const bgCircle = document.createElementNS(svgns, "circle");
    bgCircle.setAttribute("cx", size / 2);
    bgCircle.setAttribute("cy", size / 2);
    bgCircle.setAttribute("r", radius);
    bgCircle.setAttribute("stroke", "#353434ff");
    bgCircle.setAttribute("stroke-width", strokeWidth);
    bgCircle.setAttribute("fill", "none");

    // Farbverlauf definieren
    const defs = document.createElementNS(svgns, "defs");
    const linearGradient = document.createElementNS(svgns, "linearGradient");
    linearGradient.setAttribute("id", "blueGradient"); // Eindeutiger Name für den Farbverlauf
    linearGradient.setAttribute("x1", "0%");
    linearGradient.setAttribute("y1", "0%");
    linearGradient.setAttribute("x2", "100%");
    linearGradient.setAttribute("y2", "0%");

    const stop1 = document.createElementNS(svgns, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#023557ff"); // Dunklerer Blauton

    const stop2 = document.createElementNS(svgns, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#8ad0ff"); // Hellerer Blauton

    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    defs.appendChild(linearGradient);
    svg.appendChild(defs);

    // Fortschrittskreis mit Farbverlauf
    const progressCircle = document.createElementNS(svgns, "circle");
    progressCircle.setAttribute("cx", size / 2);
    progressCircle.setAttribute("cy", size / 2);
    progressCircle.setAttribute("r", radius);
    progressCircle.setAttribute("stroke", "url(#blueGradient)"); // Verweis auf den Farbverlauf
    progressCircle.setAttribute("stroke-width", strokeWidth);
    progressCircle.setAttribute("fill", "none");
    progressCircle.setAttribute("stroke-dasharray", circumference);
    progressCircle.setAttribute("stroke-dashoffset", offset);
    progressCircle.setAttribute("stroke-linecap", "round");
    progressCircle.style.transition = "stroke-dashoffset 1s ease";

    // Textgruppe (zentriert und zurückrotiert)
    const textGroup = document.createElementNS(svgns, "g");
    textGroup.setAttribute("transform", `translate(${size / 2}, ${size / 2}) rotate(90)`);

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
    textLine2.textContent = `Minuten gehört.`;

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

  // Startet den gesamten Prozess, wenn die Seite geladen ist.
  document.addEventListener('DOMContentLoaded', loadDataAndRender);

})(); // Ende des IIFE