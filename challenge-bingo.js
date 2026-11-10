document.addEventListener("DOMContentLoaded", () => {
  const bingoGrid = document.getElementById("bingo");

  // Aktuelle CSV-Schnittstelle deiner Formular-Antworten (Form_Responses5)
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1595827324&single=true&output=csv";

  // DEINE GOOGLE FORMULAR SCHNITTSTELLE (Hier deinen Form-Link eintragen)
  const BINGO_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfGsPPRkT3OBYIsLD0DAGAIx6WH4RQP2mXtcnOXvmGdRYb7lQ/formResponse";
  const ENTRY_AUFGABE = "entry.711389681";
  const ENTRY_BUCH = "entry.1570798113";

  // Modal dynamisch im Design deiner challenge.css erstellen
  let modalEl = document.getElementById("bingo-modal");
  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.id = "bingo-modal";
    modalEl.className = "weltreise-modal";
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
        location.reload();
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
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));
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

      // Erstelle ein Nachschlage-Objekt aus den Antworten
      const buchMap = {};
      data.forEach(row => {
        const aufgabeName = row["Aufgabe"];
        const buchName = row["Buch"];
        if (aufgabeName) {
          buchMap[aufgabeName.trim()] = buchName ? buchName.trim() : "";
        }
      });

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
        const buch = buchMap[aufgabe] || item["Buch"] || "";

        if (!aufgabe) continue;

        const container = document.createElement("div");
        container.className = "flip-container";
        if (buch.trim()) {
          container.classList.add("flipped");
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