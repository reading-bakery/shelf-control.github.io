const openScanner = document.getElementById("openScanner");
const overlay = document.getElementById("scannerOverlay");
const closeScanner = document.getElementById("closeScanner");

const codeReader = new ZXing.BrowserMultiFormatReader();

let activeStream = null;

openScanner.addEventListener("click", async () => {
  overlay.classList.remove("hidden");

  try {
    const videoElement = document.getElementById("video");

    const result = await codeReader.decodeFromVideoDevice(
      null,
      videoElement,
      (result, err) => {
        if (result) {
          const code = result.getText();

          console.log("Barcode erkannt:", code);

          stopScanner();

          document.getElementById("title").value = code;
          document.getElementById("seitentotal").focus();
        }
      }
    );

    activeStream = result;
  } catch (err) {
    console.error(err);
    alert("Scanner konnte nicht gestartet werden");
  }
});

function stopScanner() {
  codeReader.reset();
  overlay.classList.add("hidden");
}

closeScanner.addEventListener("click", stopScanner);
