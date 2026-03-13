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
    const csvText = await response.text();
    const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    const buchSpalte = Object.keys(results.data[0]).find(k => k.trim().toLowerCase() === 'bücher');
    const current = parseInt(results.data[0][buchSpalte], 10);

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear)/(1000*60*60*24)) + 1;
    const avgPerDay = current / dayOfYear;
    const predictedDay = Math.ceil(goal / avgPerDay);

    renderProgressCircle(current, goal, dayOfYear);
    renderLinearGraph(dayOfYear, current, goal, avgPerDay, predictedDay);

  } catch (error) {
    console.error("Fehler beim Laden oder Verarbeiten der Daten:", error);
    const container = document.getElementById("books-circle");
    container.textContent = "Fehler beim Laden der Daten";
  }
}

// Kreisdiagramm mit Vorsprung/Rückstand
function renderProgressCircle(current, goal, dayOfYear) {
  const percent = ((current / goal) * 100).toFixed(1);
  const container = document.getElementById('books-circle');
  container.innerHTML = "";

  const size = 220, strokeWidth = 30;
  const radius = (size - strokeWidth)/2;
  const circumference = 2*Math.PI*radius;
  const offset = circumference * (1 - Math.min(percent,100)/100);
  const svgns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgns,"svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
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

  // Hintergrundkreis
  const bgCircle = document.createElementNS(svgns,"circle");
  bgCircle.setAttribute("cx", size/2); bgCircle.setAttribute("cy", size/2); bgCircle.setAttribute("r", radius);
  bgCircle.setAttribute("stroke","#353434ff"); bgCircle.setAttribute("stroke-width", strokeWidth); bgCircle.setAttribute("fill","none");

  // Fortschrittskreis
  const progressCircle = document.createElementNS(svgns,"circle");
  progressCircle.setAttribute("cx", size/2); progressCircle.setAttribute("cy", size/2); progressCircle.setAttribute("r", radius);
  progressCircle.setAttribute("stroke","url(#coralGradient)"); progressCircle.setAttribute("stroke-width", strokeWidth);
  progressCircle.setAttribute("fill","none"); progressCircle.setAttribute("stroke-dasharray", circumference);
  progressCircle.setAttribute("stroke-dashoffset", offset); progressCircle.setAttribute("stroke-linecap","round");

  svg.appendChild(bgCircle);
  svg.appendChild(progressCircle);

  // Delta berechnen
  const daysInYear = 365;
  const targetAtThisTime = Math.round(goal * (dayOfYear / daysInYear));
  const delta = current - targetAtThisTime;
  const deltaText = delta === 0 ? "Genau im Plan!" : delta > 0 ? `+${delta} Vorsprung` : `-${Math.abs(delta)} Rückstand`;
  const deltaColor = delta === 0 ? "white" : delta > 0 ? "#13c913" : "#FF4500";

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
  const width = 400, height = 150, padding = 30;
  const svgns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgns,"svg");
  svg.setAttribute("width", width); svg.setAttribute("height", height);

  // Skalen
  const xScale = (width-2*padding)/365;
  const yScale = (height-2*padding)/goal;

  // Achsen
  const axisX = document.createElementNS(svgns,"line");
  axisX.setAttribute("x1",padding); axisX.setAttribute("y1",height-padding);
  axisX.setAttribute("x2",width-padding); axisX.setAttribute("y2",height-padding);
  axisX.setAttribute("stroke","white"); svg.appendChild(axisX);

  const axisY = document.createElementNS(svgns,"line");
  axisY.setAttribute("x1",padding); axisY.setAttribute("y1",padding);
  axisY.setAttribute("x2",padding); axisY.setAttribute("y2",height-padding);
  axisY.setAttribute("stroke","white"); svg.appendChild(axisY);

  // Tatsächlicher Fortschritt
  const line = document.createElementNS(svgns,"polyline");
  const points = [];
  for(let i=0;i<=dayOfYear;i++){
    const x = padding + i*xScale;
    const y = height-padding - avgPerDay*i*yScale;
    points.push(`${x},${y}`);
  }
  line.setAttribute("points", points.join(" "));
  line.setAttribute("fill","none"); line.setAttribute("stroke","#00FF00"); line.setAttribute("stroke-width","2");
  svg.appendChild(line);

  // Prognose
  const lastX = padding + dayOfYear*xScale;
  const lastY = height-padding - current*yScale;
  const predX = padding + Math.min(predictedDay,365)*xScale;
  const predY = height-padding - goal*yScale;
  const predLine = document.createElementNS(svgns,"line");
  predLine.setAttribute("x1",lastX); predLine.setAttribute("y1",lastY);
  predLine.setAttribute("x2",predX); predLine.setAttribute("y2",predY);
  predLine.setAttribute("stroke","#FFD700"); predLine.setAttribute("stroke-width","2"); predLine.setAttribute("stroke-dasharray","5,5");
  svg.appendChild(predLine);

  container.appendChild(svg);
}

loadDataAndRender();
