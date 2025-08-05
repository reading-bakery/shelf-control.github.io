document.addEventListener("DOMContentLoaded", () => {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv";

  async function fetchAndRenderMinutes() {
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const csvText = await response.text();

      const rows = csvText.trim().split("\n").map(line => line.split(/\t|,/));

      // Header aus der ersten Zeile holen
      const header = rows[0];
      const dataRows = rows.slice(1);

      // Index-Spalten ermitteln
      const idxCover = header.indexOf("Cover");
      const idxTitel = header.indexOf("Titel");
      const idxMinutenTotal = header.indexOf("Minuten total");

      // Filtere alle gültigen Einträge mit Cover und Minuten als Zahl größer 0
      const validBooks = dataRows
        .map(r => ({
          cover: r[idxCover],
          titel: r[idxTitel],
          minutenTotal: Number(r[idxMinutenTotal])
        }))
        .filter(b => b.cover && !isNaN(b.minutenTotal) && b.minutenTotal > 0);

      if (validBooks.length < 2) {
        document.querySelector(".pie").textContent = "Nicht genügend Bücher mit gültigem Cover und Minutenangabe.";
        return;
      }

      // Kürzestes und längstes Hörbuch finden
      const shortestBook = validBooks.reduce((a, b) => (a.minutenTotal < b.minutenTotal ? a : b));
      const longestBook = validBooks.reduce((a, b) => (a.minutenTotal > b.minutenTotal ? a : b));

      // Container ansprechen und Ausgabe erzeugen
      const container = document.querySelector(".pie");
      container.innerHTML = `
        <h3>Shortest vs. Longest Hörbuch (Minuten total)</h3>
        <div style="display:flex; justify-content:space-between; max-width:600px;">
          <div style="text-align:center; width:48%;">
            <img src="${shortestBook.cover}" alt="Cover ${shortestBook.titel}" style="max-width:100%; height:auto; border-radius:5px;">
            <p><strong>${shortestBook.titel}</strong><br>${shortestBook.minutenTotal} Minuten</p>
          </div>
          <div style="text-align:center; width:48%;">
            <img src="${longestBook.cover}" alt="Cover ${longestBook.titel}" style="max-width:100%; height:auto; border-radius:5px;">
            <p><strong>${longestBook.titel}</strong><br>${longestBook.minutenTotal} Minuten</p>
          </div>
        </div>
      `;
    } catch (error) {
      document.querySelector(".pie").textContent = `Fehler beim Laden oder Verarbeiten: ${error.message}`;
    }
  }

  fetchAndRenderMinutes();
});
