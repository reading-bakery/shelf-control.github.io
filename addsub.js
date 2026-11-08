document.addEventListener("DOMContentLoaded", async () => {
  console.log("ADDMODAL LÄUFT");

  const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";
  const JSON_URL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/sub.json";
  
  const FORM_ENTRIES = {
    isbn: "entry.493642308",
    title: "entry.1995249053", 
    author: "entry.1794428850", 
    gender: "entry.1917256559", 
    umfang: "entry.989549743", 
    seiten: "entry.2099091970",
    genre: "entry.1441130368", 
    sprache: "entry.610782042", // Originalsprache
    status: "entry.680648898", 
    verlag: "entry.307032270",  
    cover: "entry.1309739909",
    format: "entry.63372831",
    preis: "entry.1974445901"
  };

  let subDatenbank = [];

  try {
    const response = await fetch(JSON_URL);
    const daten = await response.json();
    subDatenbank = daten.books || [];
  } catch (error) {
    console.warn("Konnte sub.json nicht für Cover-Match laden:", error);
  }

  const populateSelect = (elementId, options) => {
    const select = document.getElementById(elementId);
    if (!select) return;
    options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });
  };

  populateSelect("gender", ["Weiblich", "Männlich", "Mix", "Divers"]);
  populateSelect("genre", ["Roman", "Non Fiction", "Thriller/Krimi", "Erzählung", "Graphic Novel/Comic"]);
  populateSelect("publisher", ["Sonstiges", "ATB/Aufbau/RL/Blumenbar", "Atlantik", "Atrium", "Blanvalet", "btb", "Büchergilde", "Carlsen", "C.Bertelsmann", "CBJ", "C.H.Beck", "Diogenes", "dtv", "Dumont", "Ecco", "Eichborn", "Eisele", "Fischer", "Frankfurter Verlagsanstalt", "Goldmann", "Gutkind", "Hanser", "Harper Collins", "Heyne", "Insel", "Kampa", "Kein&Aber", "Knaur/Droemer", "Kjona", "KiWi", "Klett-Cotta", "Knesebeck", "Königskinder", "Limes", "Luchterhand", "Lübbe", "LYX", "Penguin", "Piper", "Pola", "Reclam", "Rowohlt/rororo", "Suhrkamp", "transcript", "Ullstein/List", "Verbrecher", "Zsolnay"]);
  populateSelect("language", ["Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch", "Portugiesisch", "Koreanisch", "Japanisch", "Chinesisch", "Niederländisch", "Hebräisch", "Türkisch", "Russisch", "Schwedisch", "Norwegisch", "Dänisch", "Finnisch", "Polnisch", "Tschechisch", "Griechisch", "Arabisch", "Englisch Original", "Französisch Original", "Spanisch Original"]);
  populateSelect("format", ["Softcover", "Hardcover", "eBook", "Hörbuch"]);

  const subModal = document.getElementById("subModal");
  const addSubBtn = document.getElementById("addSub");

  addSubBtn?.addEventListener("click", () => {
    if (subModal) subModal.classList.add("active");
  });

  document.querySelectorAll(".modal-cancel").forEach(btn => {
    btn.addEventListener("click", () => {
      if (subModal) subModal.classList.remove("active");
    });
  });

  const titleInput = document.getElementById("title");
  titleInput?.addEventListener("blur", () => {
    const val = titleInput.value.trim();
    if (!val) return;
    const treffer = subDatenbank.find(b => b.title.toLowerCase().trim() === val.toLowerCase().trim());
    if (treffer && treffer.cover) {
      window.matchedCoverUrl = `https://github.com/reading-bakery/shelf-control.github.io/blob/main/images/sub/${treffer.cover}?raw=true`;
    } else {
      window.matchedCoverUrl = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/default-cover.jpg";
    }
  });

  const saveBtn = document.querySelector("#subModal .modal-save");
  saveBtn?.addEventListener("click", async () => {
    const titleVal = document.getElementById("title")?.value.trim();
    if (!titleVal) {
      alert("Bitte gib einen Buchtitel ein.");
      return;
    }

    const isbnVal = document.getElementById("isbnnumber")?.value || "";
    const authorVal = document.getElementById("author")?.value || "";
    const pagesVal = document.getElementById("pages")?.value || "0";
    const priceVal = document.getElementById("price")?.value || "0";
    const genderVal = document.getElementById("gender")?.value || "";
    const genreVal = document.getElementById("genre")?.value || "";
    const publisherVal = document.getElementById("publisher")?.value || "";
    const languageVal = document.getElementById("language")?.value || "";
    const formatVal = document.getElementById("format")?.value || "";
    
    let umfangVal = "";
    const pNum = parseInt(pagesVal, 10);
    if (pNum > 0) {
      if (pNum <= 300) umfangVal = "bis 300";
      else if (pNum <= 500) umfangVal = "301-500";
      else umfangVal = "ab 501";
    }

    const coverVal = window.matchedCoverUrl || "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/default-cover.jpg";

    const fd = new FormData();
    fd.append(FORM_ENTRIES.isbn, isbnVal);
    fd.append(FORM_ENTRIES.title, titleVal);
    fd.append(FORM_ENTRIES.author, authorVal);
    fd.append(FORM_ENTRIES.gender, genderVal);
    fd.append(FORM_ENTRIES.umfang, umfangVal);
    fd.append(FORM_ENTRIES.seiten, pagesVal);
    fd.append(FORM_ENTRIES.genre, genreVal);
    fd.append(FORM_ENTRIES.sprache, languageVal);
    fd.append(FORM_ENTRIES.status, "SuB");
    fd.append(FORM_ENTRIES.verlag, publisherVal);
    fd.append(FORM_ENTRIES.cover, coverVal);
    fd.append(FORM_ENTRIES.format, formatVal);
    fd.append(FORM_ENTRIES.preis, priceVal);

    try {
      await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: fd });
      
      if (subModal) subModal.classList.remove("active");
      
      const successModal = document.getElementById("successAddModal");
      if (successModal) {
        successModal.classList.add("active");
        const okBtn = document.getElementById("btnSuccessAddOk");
        if (okBtn) {
          okBtn.onclick = () => location.reload();
        }
      } else {
        alert("Buch wurde erfolgreich hinzugefügt! 🚀");
        location.reload();
      }

    } catch (err) {
      alert("Fehler beim Speichern: " + err);
    }
  });
});