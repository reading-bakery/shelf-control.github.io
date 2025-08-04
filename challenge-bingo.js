document.addEventListener("DOMContentLoaded", () => {
  const bingoGrid = document.getElementById("bingo");
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1579050693&single=true&output=csv";

  function parseCSV(text) {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      let obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return obj;
    });
  }

  fetch(csvUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP Fehler! Status: ${response.status}`);
      return response.text();
    })
    .then(text => {
      const data = parseCSV(text);
      const maxCells = 20;
      bingoGrid.innerHTML = "";

      for (let i = 0; i < maxCells; i++) {
        const item = data[i];
        if (!item) {
          const emptyDiv = document.createElement("div");
          emptyDiv.className = "no-flip";
          emptyDiv.innerHTML = "&nbsp;";
          bingoGrid.appendChild(emptyDiv);
          continue;
        }

        const aufgabe = item["Aufgabe"] || "";
        const buch = item["Buch"] || "";

        if (!aufgabe) continue;

        const container = document.createElement("div");
        container.className = "flip-container";
        if (buch.trim()) {
          container.classList.add("flipped"); // automatisch geflippt bei Buch
        }

        const inner = document.createElement("div");
        inner.className = "flip-inner";

        const front = document.createElement("div");
        front.className = "flip-front";
        front.textContent = aufgabe;

        const back = document.createElement("div");
        back.className = "flip-back";
        back.textContent = buch.trim() || "???";

        inner.appendChild(front);
        inner.appendChild(back);
        container.appendChild(inner);

        // Flip per Klick immer erlaubt
        container.addEventListener("click", () => {
          container.classList.toggle("flipped");
        });

        bingoGrid.appendChild(container);
      }
    })
    .catch(err => {
      console.error("Fehler beim Laden der CSV:", err);
      bingoGrid.innerHTML = "<p>Fehler beim Laden der Daten.</p>";
    });
});
