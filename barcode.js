const openScanner = document.getElementById("openScanner");
const overlay = document.getElementById("scannerOverlay");
const closeScanner = document.getElementById("closeScanner");

const codeReader = new ZXing.BrowserMultiFormatReader();

let currentBookData = null;
let currentISBN = null;

let activeScan = false;

/* =========================
   SCANNER ÖFFNEN
========================= */
openScanner.addEventListener("click", async () => {
  overlay.classList.remove("hidden");

  if (activeScan) return;

  try {
    const videoElement = document.getElementById("video");

    await codeReader.decodeFromVideoDevice(
      null,
      videoElement,
      (result, err) => {
        if (result) {
          const code = result.getText();

          console.log("ISBN erkannt:", code);

          stopScanner();

          fetchBookData(code);
        }
      }
    );

    activeScan = true;

  } catch (err) {
    console.error(err);
    alert("Scanner konnte nicht gestartet werden");
  }
});

/* =========================
   SCANNER STOP
========================= */
function stopScanner() {
  codeReader.reset();
  overlay.classList.add("hidden");
  activeScan = false;
}

closeScanner.addEventListener("click", stopScanner);

/* =========================
   GOOGLE BOOKS API
========================= */
async function fetchBookData(isbn) {
  try {
    currentISBN = isbn;

    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    const res = await fetch(url);
    const data = await res.json();

    console.log("API Antwort:", data);

    if (!data.items || data.items.length === 0) {
      alert("Kein Buch gefunden 😕");
      return;
    }

    const book = data.items[0].volumeInfo;
    currentBookData = book;

    // 👉 Vorschau füllen
    document.getElementById("pTitle").textContent = book.title || "";
    document.getElementById("pPages").textContent = book.pageCount || "";

    if (book.authors) {
      document.getElementById("pAuthor").textContent =
        book.authors.join(", ");
    } else {
      document.getElementById("pAuthor").textContent = "";
    }

    // 👉 Vorschau anzeigen
    document.getElementById("previewBox").classList.remove("hidden");

  } catch (err) {
    console.error(err);
    alert("Fehler beim Laden der Buchdaten");
  }
}

/* =========================
   BESTÄTIGEN → GOOGLE SHEETS
========================= */
document.getElementById("confirmSend").addEventListener("click", () => {
  if (!currentBookData) return;

  document.getElementById("title").value = currentBookData.title || "";

  if (currentBookData.authors) {
    document.getElementById("autor").value =
      currentBookData.authors.join(", ");
  }

  if (currentBookData.pageCount) {
    document.getElementById("seitentotal").value =
      currentBookData.pageCount;
  }

  // Vorschau schließen
  document.getElementById("previewBox").classList.add("hidden");

  // 👉 Formular an Google Sheets senden
  document.querySelector("form").submit();
});

/* =========================
   ABBRECHEN
========================= */
document.getElementById("cancelSend").addEventListener("click", () => {
  document.getElementById("previewBox").classList.add("hidden");

  currentBookData = null;
  currentISBN = null;
});
