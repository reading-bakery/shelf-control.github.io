document.addEventListener("DOMContentLoaded", () => {
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxH5qweCK_CZRlPaIThVGAfqGhEGsvb3Hdl0LX2xBwgHrJT7HudznfXQ3B2CuziF0-v4w/exec";

  // Option-Daten inklusive PoC
  const optionsData = {
    poc: ["Ja", "Nein"],
    gender: ["Weiblich", "Männlich", "Mix", "Divers"],
    genre: ["Roman", "Non Fiction", "Thriller/Krimi", "Erzählung", "Graphic Novel/Comic"],
    language: ["Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch", "Portugiesisch", "Koreanisch", "Japanisch", "Chinesisch", "Niederländisch", "Hebräisch", "Türkisch", "Russisch", "Schwedisch", "Norwegisch", "Dänisch", "Finnisch", "Polnisch", "Tschechisch", "Griechisch", "Arabisch", "Englisch Original", "Französisch Original", "Spanisch Original"],
    format: ["Softcover", "Hardcover", "eBook", "Hörbuch"],
    status: ["Neuzugang", "SuB", "Ausgeliehen", "Rezensionsexemplar"],
    publisher: ["Sonstiges", "ATB/Aufbau/RL/Blumenbar", "Atlantik", "Atrium", "Blanvalet", "btb", "Büchergilde", "Carlsen", "C.Bertelsmann", "CBJ", "C.H.Beck", "Diogenes", "dtv", "Dumont", "Ecco", "Eichborn", "Eisele", "Fischer", "Frankfurter Verlagsanstalt", "Goldmann", "Gutkind", "Hanser", "Harper Collins", "Heyne", "Insel", "Kampa", "Kein&Aber", "Knaur/Droemer", "Kjona", "KiWi", "Klett-Cotta", "Knesebeck", "Königskinder", "Limes", "Luchterhand", "Lübbe", "LYX", "Penguin", "Piper", "Pola", "Reclam", "Rowohlt/rororo", "Suhrkamp", "transcript", "Ullstein/List", "Verbrecher", "Zsolnay"]
  };

  function populateSelect(elementId, options) {
    const select = document.getElementById(elementId);
    if (!select) return;

    const firstOption = select.querySelector("option[disabled]");
    select.innerHTML = "";
    if (firstOption) select.appendChild(firstOption);

    options.forEach(optText => {
      const opt = document.createElement("option");
      opt.value = optText;
      opt.textContent = optText;
      select.appendChild(opt);
    });
  }

  // Dropdowns befüllen
  populateSelect("poc", optionsData.poc);
  populateSelect("gender", optionsData.gender);
  populateSelect("genre", optionsData.genre);
  populateSelect("language", optionsData.language);
  populateSelect("format", optionsData.format);
  populateSelect("publisher", optionsData.publisher);
  populateSelect("status", optionsData.status);

  const form = document.getElementById("addSubForm");
  const addBtn = document.getElementById("addSub");
  const saveBtn = document.querySelector("#addSubForm .modal-save");
  const cancelBtn = document.querySelector("#addSubForm .modal-cancel");
  const subModal = document.getElementById("subModal");

  if (addBtn && subModal) {
    addBtn.addEventListener("click", () => {
      subModal.classList.add("active");
    });
  }

  if (cancelBtn && subModal) {
    cancelBtn.addEventListener("click", () => {
      subModal.classList.remove("active");
    });
  }

  if (!saveBtn) return;

  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title")?.value.trim();
    if (!title) {
      alert("Bitte gib mindestens einen Buchtitel ein!");
      return;
    }

    const isbn = document.getElementById("isbnnumber")?.value.trim() || "";
    const author = document.getElementById("author")?.value.trim() || "";
    const pages = document.getElementById("pages")?.value || 0;
    const price = document.getElementById("price")?.value || 0;

    const poc = document.getElementById("poc")?.value || "";
    const gender = document.getElementById("gender")?.value || "";
    const genre = document.getElementById("genre")?.value || "";
    const publisher = document.getElementById("publisher")?.value || "";
    const language = document.getElementById("language")?.value || "";
    const format = document.getElementById("format")?.value || "";
    const status = document.getElementById("status")?.value || "SuB";

    const coverInput = document.getElementById("cover");
    let base64Image = null;
    let imageName = null;
    let imageType = null;

    const readCoverImage = (file) => {
      return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result.split(",")[1];
          resolve({
            base64: base64String,
            name: file.name,
            type: file.type
          });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    try {
      saveBtn.disabled = true;
      saveBtn.textContent = "Speichere...";

      if (coverInput && coverInput.files.length > 0) {
        const imgData = await readCoverImage(coverInput.files[0]);
        if (imgData) {
          base64Image = imgData.base64;
          imageName = imgData.name;
          imageType = imgData.type;
        }
      }

      const payload = {
        title: title,
        isbn: isbn,
        author: author,
        poc: poc,
        gender: gender,
        format: format,
        umfang: pages > 500 ? "ab 501" : pages > 300 ? "301-500" : "bis 300",
        seiten: Number(pages),
        genre: genre,
        sprache: language,
        status: status,
        verlag: publisher,
        preis: Number(price),
        base64: base64Image,
        name: imageName,
        type: imageType
      };

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === "success") {
        const modalContent = subModal.querySelector(".modal-content-2");
        if (modalContent) {
          // Angepasstes Design für das Erfolgsfenster im Dark Theme
          modalContent.innerHTML = `
            <div style="text-align: center; padding: 10px; font-family: 'Dosis', sans-serif; color: whitesmoke;">
              <h3 style="font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: khaki; letter-spacing: 1px; border-bottom: 1px solid #353434; padding-bottom: 8px; margin-top: 0;">Erfolg!</h3>
              <p style="font-size: 1.1rem; margin: 20px 0;"><strong>${title}</strong> wurde erfolgreich hinzugefügt. 🚀</p>
              <div style="border-top: 1px solid #353434; padding-top: 15px; margin-top: 20px; display: flex; justify-content: center;">
                <button class="modal-save" id="btnSuccessAddOk" style="width: auto; min-width: 100px;">Super!</button>
              </div>
            </div>
          `;
          modalContent.querySelector("button").onclick = () => location.reload();
        } else {
          alert("Buch erfolgreich eingetragen!");
          location.reload();
        }
      } else {
        alert("Fehler beim Speichern: " + result.message);
        saveBtn.disabled = false;
        saveBtn.textContent = "Speichern";
      }
    } catch (err) {
      console.error("Fehler beim Übertragen:", err);
      alert("Fehler beim Senden der Daten: " + err.message);
      saveBtn.disabled = false;
      saveBtn.textContent = "Speichern";
    }
  });
});