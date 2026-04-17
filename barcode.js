document.addEventListener("DOMContentLoaded", () => {
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";
    const FORM_ENTRIES = {
        start: "entry.231863637", 
        title: "entry.554995646", 
        author: "entry.890797774", 
        gender: "entry.1685694101", 
        umfang: "entry.436245051", 
        seiten: "entry.1082451600",
        minuten: "entry.1433991187", 
        genre: "entry.1105252862", 
        sprache: "entry.807495643",
        format: "entry.9727566", 
        status: "entry.914730295", 
        verlag: "entry.1674035100",  
        cover: "entry.952453014"
    };

    let bookData = {}; 
    const codeReader = new ZXing.BrowserMultiFormatReader();

    // --- SCANNER START ---
    document.getElementById("openScanner")?.addEventListener("click", () => {
        const overlay = document.getElementById("scannerOverlay");
        if (overlay) {
            overlay.classList.remove("hidden");
            overlay.style.display = "flex";
        }
        
        codeReader.decodeFromVideoDevice(null, document.getElementById("video"), async (result) => {
            if (result) {
                codeReader.reset();
                overlay.classList.add("hidden");
                overlay.style.display = "none";
                await fetchBookData(result.getText());
            }
        });
    });

    // --- DATEN AUS JSON LADEN ---
    async function fetchBookData(rawInput) {
        const cleanScanIsbn = String(rawInput).replace(/[^0-9Xx]/g, "").trim();
        const JSON_URL = `https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/sub.json?t=${new Date().getTime()}`;
        
        const notFoundModal = document.getElementById("notFoundModal");
        const previewBox = document.getElementById("previewBox");

        try {
            const res = await fetch(JSON_URL);
            const data = await res.json();
            const treffer = (data.books || []).find(b => 
                String(b.isbn || "").replace(/[^0-9Xx]/g, "").includes(cleanScanIsbn)
            );

            if (treffer) {
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

                document.getElementById("pTitle").textContent = bookData.title;
                document.getElementById("pAuthor").textContent = bookData.author;
                const coverImg = document.getElementById("pCover");
                if(coverImg) {
                    coverImg.src = coverURL;
                    coverImg.style.display = coverURL ? "block" : "none";
                }

                previewBox?.classList.remove("hidden");
                previewBox.style.display = "block";
            } else {
                if (notFoundModal) {
                    notFoundModal.style.display = "flex";
                    notFoundModal.style.opacity = "1";
                    notFoundModal.style.pointerEvents = "auto";
                }
            }
        } catch (err) { 
            console.error("Fehler beim Laden:", err); 
        }
    }

    // --- BESTÄTIGEN & SENDEN ---
    document.getElementById("confirmSend")?.addEventListener("click", async () => {
        const confirmBtn = document.getElementById("confirmSend");
        const previewBox = document.getElementById("previewBox");
        
        // Feedback: Senden-Status
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Wird gesendet...";

        const fd = new FormData();
        Object.keys(FORM_ENTRIES).forEach(key => fd.append(FORM_ENTRIES[key], bookData[key] || ""));
        
        try {
            await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: fd });
            
            // Erfolg: PreviewBox Inhalt ersetzen (wie in sub.js)
            previewBox.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="font-family: 'Dosis', sans-serif; text-transform: none; margin-bottom: 15px;">
                        Buch erfolgreich hinzugefügt! 🚀
                    </h3>
                    <button id="btnSuccessAddOk" class="modal-save">Super!</button>
                </div>
            `;

            // Reload bei Klick auf "Super!"
            document.getElementById("btnSuccessAddOk").onclick = () => {
                location.reload();
            };

        } catch (err) { 
            console.error("Fehler beim Senden:", err);
            confirmBtn.disabled = false;
            confirmBtn.textContent = "Hinzufügen";
            alert("Fehler beim Senden."); 
        }
    });

    // --- CLOSE EVENTS ---
    document.getElementById("closeNotFound")?.addEventListener("click", () => {
        const modal = document.getElementById("notFoundModal");
        if (modal) {
            modal.style.display = "none";
            modal.style.opacity = "0";
            modal.style.pointerEvents = "none";
        }
    });

    document.getElementById("cancelSend")?.addEventListener("click", () => {
        const pb = document.getElementById("previewBox");
        if (pb) {
            pb.classList.add("hidden");
            pb.style.display = "none";
        }
    });

    document.getElementById("closeScanner")?.addEventListener("click", () => {
        codeReader.reset();
        const overlay = document.getElementById("scannerOverlay");
        if (overlay) {
            overlay.classList.add("hidden");
            overlay.style.display = "none";
        }
    });
});