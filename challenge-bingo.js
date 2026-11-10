document.addEventListener("DOMContentLoaded", () => {
  const bingoGrid = document.getElementById("bingo");
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1595827324&single=true&output=csv";

  // WICHTIG: Ersetze diesen Platzhalter mit der URL deines Bingo-Google-Formulars (endet auf /formResponse)
  const BINGO_FORM_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1595827324&single=true&output=csv/formResponse";
  const ENTRY_AUFGABE = "entry.711389681";
  const ENTRY_BUCH = "entry.1570798113";

  // Modal dynamisch im passenden Design erstellen
  let modalEl = document.getElementById("bingo-modal");
  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.id = "bingo-modal";
    modalEl.className = "weltreise-modal"; // Nutzt das bestehende CSS aus challenge.css
    modalEl.innerHTML = `
      <div class="weltreise-modal-content">
        <div class="weltreise-modal-header">
          <h4 id="bingo-modal-title">Bingo Aufgabe</h4>
          <button id="bingo-modal-close" class="modal-close-icon">&times;</button>
        </div>
        <div class="weltreise-modal-body">
          <label id="bingo-modal-label" for="bingo-book-input" style="margin-bottom: 12px; color: khaki;"></label>
          <input type="text" id="bingo-book-input" placeholder="Buchtitel eingeben..." autocomplete="off">
          <div id="bingo-modal-message" class="modal-message"></div>
        </div>
        <div class="weltreise-modal-footer">
          <button id="bingo-modal-cancel" class="modal-btn cancel">Abbrechen</button>
          <button id="bingo-modal-save" class="modal-btn">Speichern</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  const bookInput = document.getElementById("bingo-book-input");
  const modalTitle = document.getElementById("bingo-modal-title");
  const modalLabel = document.getElementById("bingo-modal-label");
  const modalMsg = document.getElementById("bingo-modal-message");
  const saveBtn = document.getElementById("bingo-modal-save");
  const cancelBtn = document.getElementById("bingo-modal-cancel");
  const closeBtn = document.getElementById("bingo-modal-close");

  let currentAufgabe = "";

  function openModal(aufgabe) {
    currentAufgabe = aufgabe;
    modalTitle.textContent = "Bingo Aufgabe";
    modalLabel.textContent = aufgabe;
    bookInput.value = "";
    modalMsg.textContent = "";
    modalMsg.className = "modal-message";
    modalEl.classList.add("active");
    setTimeout(() => bookInput.focus(), 100);
  }

  function closeModal() {
    modalEl.classList.remove("active");
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeModal();
  });

  saveBtn.addEventListener("click", async () => {
    const buchVal = bookInput.value.trim();
    if (!buchVal) {
      modalMsg.textContent = "Bitte gib einen Buchtitel ein.";
      modalMsg.className = "modal-message error";
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Wird gespeichert...";

    const formData = new URLSearchParams();
    formData.append(ENTRY_AUFGABE, currentAufgabe);
    formData.append(ENTRY_BUCH, buchVal);

    try {
      await fetch(BINGO_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });

      modalMsg.textContent = "Erfolgreich gespeichert! 🚀";
      modalMsg.className = "modal-message success";
      
      setTimeout(() => {
        closeModal();
        location.reload(); // Lädt die Seite neu, damit die aktualisierte CSV geladen wird
      }, 1000);

    } catch (err) {
      console.error("Fehler beim Senden:", err);
      modalMsg.textContent = "Fehler beim Speichern.";
      modalMsg.className = "modal-message error";
      saveBtn.disabled = false;
      saveBtn.textContent = "Speichern";
    }
  });

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
          container.classList.add("flipped"); // Automatisch geflippt, wenn ein Buch eingetragen ist
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

        // Klick-Logik:
        // - Wenn kein Buch eingetragen ist: Modal öffnet sich zur Eingabe
        // - Wenn bereits ein Buch eingetragen ist: Karte lässt sich wie gewohnt wenden
        container.addEventListener("click", () => {
          if (!buch.trim()) {
            openModal(aufgabe);
          } else {
            container.classList.toggle("flipped");
          }
        });

        bingoGrid.appendChild(container);
      }
    })
    .catch(err => {
      console.error("Fehler beim Laden der CSV:", err);
      bingoGrid.innerHTML = "<p>Fehler beim Laden der Daten.</p>";
    });
});