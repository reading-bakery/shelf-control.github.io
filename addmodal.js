document.addEventListener("DOMContentLoaded", () => {
  console.log("ADDMODAL LÄUFT");

  const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";

  const FORM_ENTRIES = {
    start: "entry.231863637", title: "entry.554995646", author: "entry.890797774", 
    gender: "entry.1685694101", umfang: "entry.436245051", seiten: "entry.1082451600",
    minuten: "entry.1433991187", genre: "entry.1105252862", sprache: "entry.807495643",
    Format: "entry.9727566", status: "entry.914730295", verlag: "entry.1674035100"
  };

  const bookData = {
    start: "", title: "", author: "", gender: "", 
    umfang: "", seiten: "", minuten: "", genre: "", 
    sprache: "", Format: "", status: "", verlag: ""
  };

  // --- Hilfsfunktionen für Validierung & Anzeige ---
  function showError(modal, message) {
    const modalContent = modal.querySelector(".modal-content");
    let errorMsg = modalContent.querySelector(".error-msg");
    if (!errorMsg) {
      errorMsg = document.createElement("div");
      errorMsg.className = "error-msg";
      errorMsg.style.color = "red";
      errorMsg.style.fontSize = "0.9em";
      errorMsg.style.marginTop = "8px";
      modal.querySelector("h3").after(errorMsg);
    }
    errorMsg.textContent = message;
    modalContent.style.setProperty("border", "2px solid red", "important");
  }

  function clearError(modal) {
    const modalContent = modal.querySelector(".modal-content");
    const errorMsg = modalContent.querySelector(".error-msg");
    if (errorMsg) errorMsg.textContent = "";
    modalContent.style.border = "";
  }

  function validateStep(modalId, value, isRequired, errorText, nextModalId) {
    const modal = document.getElementById(modalId);
    if (isRequired && (!value || value.trim() === "")) {
      showError(modal, errorText);
      return false;
    }
    clearError(modal);
    if (nextModalId) {
        closeModal(modalId);
        openModal(nextModalId);
    }
    return true;
  }

  const renderOptions = (modalId, options, name) => {
    const modal = document.getElementById(modalId);
    const list = modal?.querySelector(".checkbox-list");
    if (!list) return;

    list.style.maxHeight = "250px";
    list.style.overflowY = "auto";
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.paddingRight = "5px";
    list.style.borderRadius = "8px";

    if (!modal.querySelector(".modal-search")) {
      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.placeholder = "Suchen...";
      searchInput.className = "modal-search";
      searchInput.style.width = "100%";
      searchInput.style.padding = "10px";
      searchInput.style.marginBottom = "10px";
      searchInput.style.boxSizing = "border-box";
      searchInput.style.borderRadius = "12px";
      searchInput.style.border = "1px solid #ccc";
      
      list.before(searchInput);
      
      searchInput.oninput = () => {
        const val = searchInput.value.toLowerCase();
        list.querySelectorAll("label").forEach(l => {
          l.style.display = l.textContent.toLowerCase().includes(val) ? "flex" : "none";
        });
      };
    }

    list.innerHTML = options.map(opt => `
      <label style="display: flex; align-items: center; cursor: pointer;">
        <input type="radio" name="${name}" value="${opt}"> ${opt}
      </label>
    `).join("");
  };

  // --- Modals initialisieren ---
  renderOptions("genderModal", ["Weiblich", "Männlich", "Mix", "Divers"], "gender");
  renderOptions("umfangModal", [">300", "301-500", "ab 501"], "umfang");
  renderOptions("genreModal", ["Roman", "Non Fiction", "Thriller/Krimi", "Kinder- und Jugendbuch", "Erzählung", "Graphic Novel/Comic"], "genre");
  renderOptions("spracheModal", ["Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch", "Portugiesisch", "Koreanisch", "Japanisch", "Chinesisch", "Niederländisch", "Hebräisch", "Türkisch", "Russisch", "Schwedisch", "Norwegisch", "Dänisch", "Finnisch", "Polnisch", "Tschechisch", "Griechisch", "Arabisch", "Englisch Original", "Französisch Original", "Spanisch Original"], "sprache");
  renderOptions("formatModal", ["Softcover", "Hardcover", "eBook", "Hörbuch"], "format");
  renderOptions("statusModal", ["Neuzugang", "SuB", "Ausgeliehen", "Rezensionsexemplar"], "status");
  renderOptions("verlagModal", ["Sonstiges", "ATB/Aufbau/RL/Blumenbar", "Atlantik", "Atrium", "Blanvalet", "btb", "Carlsen", "C.Bertelsmann", "CBJ", "C.H.Beck", "Diogenes", "dtv", "Dumont", "Ecco", "Eichborn", "Eisele", "Fischer", "Frankfurter Verlagsanstalt", "Goldmann", "Hanser", "Harper Collins", "Heyne", "Insel", "Kampa", "Kein&Aber", "Knaur/Droemer", "KiWi", "Klett-Cotta", "Knesebeck", "Königskinder", "Limes", "Luchterhand", "Lübbe", "LYX", "Penguin", "Piper", "Pola", "Reclam", "Rowohlt/rororo", "Suhrkamp", "transcript", "Ullstein/List", "Verbrecher"], "verlag");

  function openModal(id) { document.getElementById(id).classList.add("active"); }
  function closeModal(id) { document.getElementById(id).classList.remove("active"); }

  // --- Event Listener Kette ---
  document.getElementById("manualAddBtn")?.addEventListener("click", () => openModal("modal-start"));

  document.querySelector("#modal-start .modal-save").addEventListener("click", () => {
    const val = document.getElementById("startdateInput").value;
    if (validateStep("modal-start", val, true, "Bitte Startdatum eintragen.", "titleModal")) bookData.start = val;
  });

  document.querySelector("#titleModal .modal-save").addEventListener("click", () => {
    const val = document.querySelector("#titleModal input").value;
    if (validateStep("titleModal", val, true, "Bitte Titel eintragen.", "authorModal")) bookData.title = val;
  });

  document.querySelector("#authorModal .modal-save").addEventListener("click", () => {
    const val = document.querySelector("#authorModal input").value;
    if (validateStep("authorModal", val, true, "Bitte Autor:in eintragen.", "genderModal")) bookData.author = val;
  });

  const setupRadioStep = (modalId, key, errorText, nextModalId) => {
    document.querySelector(`#${modalId} .modal-save`).addEventListener("click", () => {
      const val = document.querySelector(`#${modalId} input:checked`)?.value;
      if (validateStep(modalId, val, true, errorText, nextModalId)) bookData[key] = val;
    });
  };

  setupRadioStep("genderModal", "gender", "Bitte Geschlecht auswählen.", "umfangModal");
  setupRadioStep("umfangModal", "umfang", "Bitte Umfang auswählen.", "seitenModal");

  document.querySelector("#seitenModal .modal-save").addEventListener("click", () => {
    bookData.seiten = document.querySelector("#seitenModal input").value || "0";
    validateStep("seitenModal", bookData.seiten, false, "", "minutenModal");
  });

  document.querySelector("#minutenModal .modal-save").addEventListener("click", () => {
    bookData.minuten = document.querySelector("#minutenModal input").value || "0";
    validateStep("minutenModal", bookData.minuten, false, "", "genreModal");
  });

  setupRadioStep("genreModal", "genre", "Bitte Genre auswählen.", "spracheModal");
  setupRadioStep("spracheModal", "sprache", "Bitte Sprache auswählen.", "formatModal");
  setupRadioStep("formatModal", "Format", "Bitte Format auswählen.", "statusModal");
  setupRadioStep("statusModal", "status", "Bitte Status auswählen.", "verlagModal");

  // --- Letzter Schritt mit In-Modal Erfolgsmeldung ---
  document.querySelector("#verlagModal .modal-save").addEventListener("click", async () => {
    const val = document.querySelector("#verlagModal input:checked")?.value;
    const currentModal = document.getElementById("verlagModal");
    const modalContent = currentModal.querySelector(".modal-content");

    if (validateStep("verlagModal", val, true, "Bitte Verlag auswählen.", null)) {
      bookData.verlag = val;
      const fd = new FormData();
      Object.keys(FORM_ENTRIES).forEach(key => fd.append(FORM_ENTRIES[key], bookData[key]));
      
      try {
        // Senden an Google Forms
        await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: fd });
        
        // Modal-Inhalt leeren und Erfolgsmeldung anzeigen
        modalContent.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h3 style="color: #13c913;">Erfolg!</h3>
            <p style="font-size: 1.1em; margin: 20px 0;">
              <strong>${bookData.title}</strong> wurde erfolgreich hinzugefügt. ♥️
            </p>
            <button class="modal-save" style="width: 100%;">Super!</button>
          </div>
        `;

        // Bei Klick auf "Super!" Seite neu laden
        modalContent.querySelector("button").onclick = () => location.reload();

      } catch (err) { 
        showError(currentModal, "Fehler beim Senden: " + err); 
      }
    }
  });

  document.querySelectorAll(".modal-cancel").forEach(btn => {
    btn.addEventListener("click", (e) => closeModal(e.target.closest(".modal").id));
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) closeModal(e.target.id);
  });
});