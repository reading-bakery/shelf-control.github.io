const openScanner = document.getElementById("openScanner");
const overlay = document.getElementById("scannerOverlay");
const closeScanner = document.getElementById("closeScanner");

const codeReader = new ZXing.BrowserMultiFormatReader();

const form = document.querySelector("form");
const previewBox = document.getElementById("previewBox");

const pTitle = document.getElementById("pTitle");
const pAuthor = document.getElementById("pAuthor");

const confirmSend = document.getElementById("confirmSend");
const cancelSend = document.getElementById("cancelSend");



// ISBN Input (wichtig: muss existieren!)
const isbnInput = document.getElementById("isbn");

let allowSubmit = false;

/* ---------------------------
   SCANNER START
----------------------------*/
openScanner.addEventListener("click", async () => {
  overlay.classList.remove("hidden");

  try {
    const videoElement = document.getElementById("video");

    codeReader.decodeFromVideoDevice(
      null,
      videoElement,
      async (result) => {
        if (result) {
          const isbn = result.getText();
          console.log("📌 ISBN erkannt:", isbn);

          stopScanner();
          await fetchBookData(isbn);
        }
      }
    );
  } catch (err) {
    console.error(err);
    alert("Scanner konnte nicht gestartet werden");
  }
});

/* ---------------------------
   SCANNER STOP
----------------------------*/
function stopScanner() {
  codeReader.reset();
  overlay.classList.add("hidden");
}

closeScanner.addEventListener("click", stopScanner);

/* ---------------------------
   MANUELLE ISBN
----------------------------*/
isbnInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    fetchBookData(isbnInput.value);
  }
});

/* ---------------------------
   GOOGLE BOOKS API
----------------------------*/
async function fetchBookData(rawInput) {
  try {
    console.log("RAW INPUT:", rawInput);

    if (!rawInput) {
      alert("Keine ISBN eingegeben");
      return;
    }

    // ISBN CLEANING (WICHTIG!)
    const isbn = String(rawInput).replace(/[^0-9Xx]/g, "").trim();

    console.log("CLEAN ISBN:", isbn);

    if (isbn.length < 10) {
      alert("Ungültige ISBN: " + isbn);
      return;
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    console.log("REQUEST:", url);

    const res = await fetch(url);
    const data = await res.json();

    console.log("RESPONSE:", data);

    if (!data.items || data.items.length === 0) {
      alert("Buch nicht gefunden – bitte manuell eingeben");
      return;
    }

    const book = data.items[0].volumeInfo;

    const title = book.title || "Unbekannt";
    const author = (book.authors || []).join(", ");

    document.getElementById("title").value = title;
    document.getElementById("autor").value = author;

    showPreview(title, author);

  } catch (err) {
    console.error("❌ Fehler:", err);
    alert("Fehler beim Laden des Buches");
  }
}

/* ---------------------------
   PREVIEW
----------------------------*/
function showPreview(title, author) {
  pTitle.textContent = title;
  pAuthor.textContent = author;
  previewBox.classList.remove("hidden");
}

/* ---------------------------
   FORM CONTROL
----------------------------*/
form.addEventListener("submit", (e) => {
  if (!allowSubmit) {
    e.preventDefault();
  }
});

/* ---------------------------
   CONFIRM / CANCEL
----------------------------*/
confirmSend.addEventListener("click", () => {
  allowSubmit = true;
  previewBox.classList.add("hidden");
  form.submit();
  allowSubmit = false;
});

cancelSend.addEventListener("click", () => {
  previewBox.classList.add("hidden");
});

function openUniversalModal({ title, type = "text", options = [] }) {
  return new Promise(resolve => {

    const modal = document.getElementById("universalModal");
    const h3 = document.getElementById("modalTitle");
    const search = document.getElementById("modalSearch");
    const list = document.getElementById("modalList");
    const number = document.getElementById("modalNumber");
    const date = document.getElementById("modalDate");

    h3.textContent = title;

    // Reset
    search.style.display = "none";
    list.innerHTML = "";
    number.style.display = "none";
    date.style.display = "none";

    let value = null;

    // TYPE LOGIC
    if (type === "textlist") {
      search.style.display = "block";

      options.forEach(opt => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" value="${opt}"> ${opt}`;
        list.appendChild(label);
      });
    }

    if (type === "number") {
      number.style.display = "block";
    }

    if (type === "date") {
      date.style.display = "block";
    }

    modal.style.display = "flex";

    // SAVE
    const save = () => {

      if (type === "textlist") {
        value = Array.from(list.querySelectorAll("input:checked"))
          .map(i => i.value);
      }

      if (type === "number") {
        value = parseInt(number.value);
      }

      if (type === "date") {
        value = date.value;
      }

      modal.style.display = "none";
      cleanup();
      resolve(value);
    };

    const cancel = () => {
      modal.style.display = "none";
      cleanup();
      resolve(null);
    };

    function cleanup() {
      modal.querySelector(".modal-save").removeEventListener("click", save);
      modal.querySelector(".modal-cancel").removeEventListener("click", cancel);
    }

    modal.querySelector(".modal-save").addEventListener("click", save);
    modal.querySelector(".modal-cancel").addEventListener("click", cancel);
  });
}
