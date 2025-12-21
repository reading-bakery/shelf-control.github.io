document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".lesejahr-archiv");
  const csvUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=158437862&single=true&output=csv";

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

  // ⭐ Sterne erstellen (SVG, halbe Sterne unterstützt)
  function createStarsDOM(sterne, coverWidthPx) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.width = coverWidthPx + "px";
    container.style.gap = "2px";
    container.style.boxSizing = "border-box";

    const fullStars = Math.floor(sterne);
    const halfStar = sterne % 1 >= 0.5;
    const maxStars = 5;
    const starSizePx = Math.min((coverWidthPx - (maxStars - 1) * 2) / maxStars * 1.25, 20);

    // volle Sterne
    for (let i = 0; i < fullStars; i++) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", starSizePx);
      svg.setAttribute("height", starSizePx);
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.innerHTML = `<polygon points="12,2 15,8.5 22,9.3 17,14.1 18.5,21 12,17.8 5.5,21 7,14.1 2,9.3 9,8.5" fill="gold"/>`;
      container.appendChild(svg);
    }

    // halber Stern
    if (halfStar) {
      const gradId = `half-grad-${Math.random().toString(36).substr(2, 9)}`;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", starSizePx);
      svg.setAttribute("height", starSizePx);
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.innerHTML = `
        <defs>
          <linearGradient id="${gradId}" x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stop-color="gold"/>
            <stop offset="50%" stop-color="#555"/>
          </linearGradient>
        </defs>
        <polygon points="12,2 15,8.5 22,9.3 17,14.1 18.5,21 12,17.8 5.5,21 7,14.1 2,9.3 9,8.5" fill="url(#${gradId})"/>
      `;
      container.appendChild(svg);
    }

    return container;
  }

  function renderYears(groupedData) {
    container.innerHTML = "";
    const years = Object.keys(groupedData).sort((a, b) => b - a);

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
        collapseDiv.style.display = "none";
        collapseDiv.style.flexWrap = "wrap";
        collapseDiv.style.gap = "10px";
        collapseDiv.style.marginTop = "5px";

        months[month].forEach(book => {
          const coverDiv = document.createElement("div");
          coverDiv.classList.add("cover-container");
          coverDiv.style.display = "flex";
          coverDiv.style.flexDirection = "column";
          coverDiv.style.alignItems = "center";
          coverDiv.style.gap = "2px";

          const img = document.createElement("img");
          img.src = book.Cover;
          img.alt = book.Buch;
          img.style.width = "77px";
          img.style.height = "125px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "6px";
          coverDiv.appendChild(img);

          const sterne = parseFloat(book.Sterne.replace(",", ".")) || 0;
          const starsContainer = createStarsDOM(sterne, 70);
          coverDiv.appendChild(starsContainer);

          collapseDiv.appendChild(coverDiv);
        });

        monthBtn.addEventListener("click", () => {
          monthCollapses.forEach(div => {
            if (div !== collapseDiv) {
              div.style.display = "none";
              const btn = div.previousElementSibling;
              if (btn) btn.classList.remove("active");
            }
          });

          if (collapseDiv.style.display === "flex") {
            collapseDiv.style.display = "none";
            monthBtn.classList.remove("active");
          } else {
            collapseDiv.style.display = "flex";
            monthBtn.classList.add("active");
          }
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
