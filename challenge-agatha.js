document.addEventListener("DOMContentLoaded", () => {
  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=601378467&single=true&output=csv";

  // Farbzuordnung
  const STATUS_COLORS = {
    "YES": "#e63946",  // Rot für gelesen
    "NO": "#6c757d",   // Grau für ungelesen
    "ABBR": "#2a9d8f"  // Grün für abgebrochen
  };

  fetch(CSV_URL)
    .then(response => response.text())
    .then(csv => {
      const lines = csv.trim().split("\n").slice(1); // Header überspringen
      const statusMap = new Map();

      for (const line of lines) {
        const [title, status] = line.split(",").map(s => s.trim());
        statusMap.set(title, status);
      }

      document.querySelectorAll(".covers").forEach(cover => {
        const title = cover.getAttribute("data-title");
        const svg = cover.querySelector("svg");
        const status = statusMap.get(title);

        if (svg && status && STATUS_COLORS[status]) {
          svg.style.color = STATUS_COLORS[status];
        }
      });
    })
    .catch(error => console.error("Fehler beim Laden der CSV-Daten:", error));
});
