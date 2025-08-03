document.addEventListener("DOMContentLoaded", () => {
  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=2088005895&single=true&output=csv";

  const STATUS_COLORS = {
    "YES": "#3CB371",  // gelesen
    "NO": "grey",      // ungelesen
    "ABBR": "#9370DB"  // abgebrochen
  };

  const STATUS_LABELS = {
    "YES": "gelesen",
    "NO": "ungelesen",
    "ABBR": "abgebrochen"
  };

  function updateLegendColors() {
    const legends = document.querySelectorAll(".legend");
    if (!legends.length) return;

    legends.forEach(legend => {
      legend.innerHTML = "";

      for (const status of Object.keys(STATUS_COLORS)) {
        const color = STATUS_COLORS[status];
        const label = STATUS_LABELS[status];

        const wrapper = document.createElement("span");
        wrapper.style.display = "inline-flex";
        wrapper.style.alignItems = "center";
        wrapper.style.marginRight = "1.5rem";
        wrapper.style.fontSize = "1rem";

        const circle = document.createElement("span");
        circle.style.display = "inline-block";
        circle.style.width = "12px";
        circle.style.height = "12px";
        circle.style.borderRadius = "50%";
        circle.style.backgroundColor = color;
        circle.style.marginRight = "0.4rem";

        const text = document.createTextNode(label);

        wrapper.appendChild(circle);
        wrapper.appendChild(text);
        legend.appendChild(wrapper);
      }
    });
  }

  function updateStatus() {
    fetch(CSV_URL + "&cachebuster=" + Date.now())
      .then(response => response.text())
      .then(csv => {
        const lines = csv.trim().split("\n").slice(1);
        const statusMap = new Map();

        for (const line of lines) {
          const [title, status] = line.split(",").map(s => s.trim());
          statusMap.set(title, status);
        }

        document.querySelectorAll(".covers").forEach(cover => {
          const title = cover.getAttribute("data-title");
          const svg = cover.querySelector("svg");
          const img = cover.querySelector("img");
          const status = statusMap.get(title);

          if (status && STATUS_COLORS[status]) {
            if (svg) svg.style.color = STATUS_COLORS[status];

            if (status === "NO" && img) {
              img.style.filter = "grayscale(100%)";
              img.style.opacity = "0.7";
            } else if (img) {
              img.style.filter = "none";
              img.style.opacity = "1";
            }
          }
        });

        updateLegendColors();
      })
      .catch(error => console.error("Fehler beim Laden der CSV-Daten:", error));
  }

  updateStatus();
  setInterval(updateStatus, 60000);
});
