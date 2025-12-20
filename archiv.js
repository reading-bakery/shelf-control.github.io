document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".lesejahr-archiv");
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=158437862&single=true&output=csv";

  async function loadCSV(url) {
    const response = await fetch(url);
    const text = await response.text();
    return parseCSV(text);
  }
202
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

  // Sterne erzeugen – nur dein einzelner Stern
  function createStars(sterne) {
    const container = document.createElement("div");
    container.classList.add("sterne-bewertung");

    const fullStars = Math.floor(sterne);
    const halfStar = sterne % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      let display = "";
      if (i < fullStars) display = "★";
      else if (i === fullStars && halfStar) display = "★"; // halber Stern als gleicher Stern
      else display = "☆";

      const span = document.createElement("span");
      span.style.marginLeft = "1px";
      span.style.fontSize = "0.0rem";
      span.style.color = "#ee"; // dein Stern
      span.innerHTML = display;

      container.appendChild(span);
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
        collapseDiv.style.display = "none"; // standardmäßig zugeklappt

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
            if (div !== collapseDiv) div.style.display = "none";
          });
          collapseDiv.style.display = collapseDiv.style.display === "flex" ? "none" : "flex";
        });

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
