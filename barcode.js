document.addEventListener("DOMContentLoaded", () => {
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";
    const FORM_ENTRIES = {
        start: "entry.231863637", title: "entry.554995646", author: "entry.890797774", 
        gender: "entry.1685694101", umfang: "entry.436245051", seiten: "entry.1082451600",
        minuten: "entry.1433991187", genre: "entry.1105252862", sprache: "entry.807495643",
        format: "entry.9727566", status: "entry.914730295", verlag: "entry.1674035100",  
        cover: "entry.952453014"
    };

    let bookData = {}; 
    const codeReader = new ZXing.BrowserMultiFormatReader();

    // --- SCANNER START ---
    document.getElementById("openScanner")?.addEventListener("click", () => {
        const overlay = document.getElementById("scannerOverlay");
        overlay?.classList.remove("hidden");
        
        codeReader.decodeFromVideoDevice(null, document.getElementById("video"), async (result) => {
            if (result) {
                codeReader.reset();
                overlay?.classList.add("hidden");
                await fetchBookData(result.getText());
            }
        });
    });

    // --- DATEN AUS JSON LADEN ---
    async function fetchBookData(rawInput) {
        const cleanScanIsbn = String(rawInput).replace(/[^0-9Xx]/g, "").trim();
        const JSON_URL = `https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/sub.json?t=${new Date().getTime()}`;
        
        try {
            const res = await fetch(JSON_URL);
            const data = await res.json();
            const treffer = (data.books || []).find(b => 
                String(b.isbn || "").replace(/[^0-9Xx]/g, "").includes(cleanScanIsbn)
            );

            if (treffer) {
                // Bild-Pfad bauen
                const coverURL = treffer.cover ? `https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/${treffer.cover}` : "";

                bookData = {
                    start: new Date().toISOString().split('T')[0],
                    title: treffer.title || "",
                    author: treffer.author || "",
                    gender: treffer.gender || "",
                    umfang: treffer.umfang || "",
                    seiten: treffer.seiten || "",
                    minuten: "0",
                    genre: treffer.genre || "",
                    sprache: treffer.sprache || "",
                    format: treffer.format || "",
                    status: "Gelesen", 
                    verlag: treffer.verlag || "",
                    cover: coverURL
                };

                // UI befüllen
                document.getElementById("pTitle").textContent = bookData.title;
                document.getElementById("pAuthor").textContent = bookData.author;
                
                const coverImg = document.getElementById("pCover");
                if(coverImg) {
                    coverImg.src = coverURL;
                    coverImg.style.display = coverURL ? "block" : "none";
                }

                document.getElementById("previewBox")?.classList.remove("hidden");
            } else {
                alert("Buch nicht in sub.json gefunden.");
            }
        } catch (err) { console.error(err); }
    }

    // --- BESTÄTIGEN & SENDEN ---
    document.getElementById("confirmSend")?.addEventListener("click", async () => {
        const fd = new FormData();
        Object.keys(FORM_ENTRIES).forEach(key => fd.append(FORM_ENTRIES[key], bookData[key] || ""));

        try {
            await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: fd });
            alert("Erfolgreich gespeichert!");
            location.reload();
        } catch (err) { alert("Fehler beim Senden."); }
    });

    document.getElementById("cancelSend")?.addEventListener("click", () => {
        document.getElementById("previewBox")?.classList.add("hidden");
    });

    document.getElementById("closeScanner")?.addEventListener("click", () => {
        codeReader.reset();
        document.getElementById("scannerOverlay")?.classList.add("hidden");
    });
});