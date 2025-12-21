document.addEventListener("DOMContentLoaded", async () => {

  const grid = document.getElementById("lieblingeGrid");
  const popup = document.getElementById("popup");
  const popupTitle = document.getElementById("popupTitle");
  const popupText = document.getElementById("popupText");
  const popupClose = document.getElementById("popupClose");

  // 🔹 JSON laden
  async function loadJSON() {
    const response = await fetch("lieblinge.json");
    if (!response.ok) {
      throw new Error("JSON konnte nicht geladen werden");
    }
    return response.json();
  }

  // 🔹 Cover erzeugen
  function createCover(book) {
    const div = document.createElement("div");
    div.className = "lieblinge-cover";

    const img = document.createElement("img");
    img.src = book.cover;
    img.alt = book.title;

    div.appendChild(img);

    div.addEventListener("click", () => openPopup(book));

    return div;
  }

  // 🔹 Popup öffnen
  function openPopup(book) {
    popupTitle.textContent = book.title;

    popupText.innerHTML = `
      <span class="label">${book.labels.autor}:</span>
      <span class="value">${book.autor}</span><br>

      <span class="label">Genre:</span>
      <span class="value">${book.genre}</span><br>

      <span class="label">Keywords:</span>
      <span class="value">${book.keywords}</span><br>

      <span class="label">Zum Buch:</span>
      <span class="value">${book.beschreibung}</span><br>

      <span class="label">Meine Meinung:</span>
      <span class="value">${book.meinung}</span><br>

      <span class="label">Für Fans von:</span>
      <span class="value">${book.fans}</span><br>

      <span class="label">Seiten:</span>
      <span class="value">${book.seiten}</span><br>

      <span class="label">Im Regal?</span>
      <span class="value">${book.regal}</span>
    `;

    popupText.style.maxHeight = window.innerHeight * 0.6 + "px";
    popupText.style.overflowY = "auto";

    popup.style.display = "flex";
  }

  // 🔹 Popup schließen
  popupClose.addEventListener("click", () => {
    popup.style.display = "none";
  });

  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.style.display = "none";
  });

  // 🔹 Initialisieren
  try {
    const books = await loadJSON();
    books.forEach(book => {
      grid.appendChild(createCover(book));
    });
  } catch (err) {
    console.error(err);
    grid.textContent = "Lieblinge konnten nicht geladen werden.";
  }

});
