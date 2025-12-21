document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".lesejahr-archiv");
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=158437862&single=true&output=csv";

  async function loadCSV(url) {
    const response = await fetch(url);
    const text = await response.text();
    return parseCSV(text);
  }

  function parseCSV(text) {
    const lines = text.trim().split("\n");
    const headers = lines.shift().split(",");
    return lines.map(line => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i]?.trim();
      });
      return obj;
    });
  }

  function groupByYearMonth(data) {
    const grouped = {};
    data.forEach(item => {
      const year = item.Jahr || "Unbekannt";
      const month = item.Monat || "Unbekannt";
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];
      grouped[year][month].push(item);
    });
    return grouped;
  }

  // Funktion für volle/halbe Sterne
  function createStars(sterne) {
    const container = document.createElement("div");
    container.classList.add("sterne-bewertung");

    for (let i = 1; i <= 5; i++) {
      const starSpan = document.createElement("span");
      if (sterne >= i) {
        starSpan.textContent = "★"; // volle Sterne
      } else if (sterne + 0.5 >= i) {
        starSpan.textContent = "★"; 
        starSpan.style.background = "linear-gradient(90deg, gold 50%, #555 50%)";
        starSpan.style.webkitBackgroundClip = "text";
        starSpan.style.webkitTextFillColor = "transparent";
      } else {
        starSpan.textContent = "☆"; // leerer Stern
      }
      container.appendChild(starSpan);
    }

    return container;
  }

  function renderYears(groupedData) {
    container.innerHTML = "";
    const years = Object.keys(groupedData).sort((a,b) => b - a);

    years.forEach(year => {
      const yearDiv = document.createElement("div");
      yearDiv.classList.add("lesejahr");

      const yearHeader = document.createElement("h2");
      yearHeader.textContent = year;
      yearDiv.appendChild(yearHeader);

      const months = groupedData[year];
      const monthCollapses = [];

      for (const month in months) {
        const monthBtn = document.createElement("button");
        monthBtn.classList.add("month-button");
        monthBtn.textContent = month;

        const collapseDiv = document.createElement("div");
        collapseDiv.classList.add("collapse");
        collapseDiv.style.display = "none"; // <<< Standard: zugeklappt

        months[month].forEach(book => {
          const coverDiv = document.createElement("div");
          coverDiv.classList.add("cover-container");

          const img = document.createElement("img");
          img.classList.add("cover-img");
          img.src = book.Cover;
          img.alt = book.Buch;

          coverDiv.appendChild(img);

          const sterne = parseFloat(book.Sterne.replace(",", "."));
          coverDiv.appendChild(createStars(sterne));

          collapseDiv.appendChild(coverDiv);
        });
        
        monthBtn.addEventListener("click", () => {
          monthCollapses.forEach(div => {
            if (div !== collapseDiv) {
              div.style.display = "none";
              // Entsprechend die active-Klasse entfernen
              const btn = div.previousElementSibling; // Button direkt vor Collapse
              if (btn && btn.classList.contains("month-button")) {
                btn.classList.remove("active");
              }
            }
          });

          if (collapseDiv.style.display === "flex") {
            collapseDiv.style.display = "none";
            monthBtn.classList.remove("active"); // schließen → active entfernen
          } else {
            collapseDiv.style.display = "flex";
            monthBtn.classList.add("active"); // öffnen → active setzen
          }
        })
        monthCollapses.push(collapseDiv);
        yearDiv.appendChild(monthBtn);
        yearDiv.appendChild(collapseDiv);
      }

      container.appendChild(yearDiv);
    });
  }

  async function init() {
    const data = await loadCSV(csvUrl);
    const groupedData = groupByYearMonth(data);
    renderYears(groupedData);
  }

  init();
});
