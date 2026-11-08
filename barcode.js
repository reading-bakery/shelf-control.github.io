document.addEventListener("DOMContentLoaded", () => {
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse";
    const FORM_ENTRIES = {
        start: "entry.231863637", 
        title: "entry.554995646", 
        author: "entry.890797774", 
        gender: "entry.1685694101", 
        poc: "entry.1600060751",
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

    const SUB_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=314687961&single=true&output=csv";
    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = `https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/sub.json?t=${new Date().getTime()}`;

    let bookData = {}; 
    const codeReader = new ZXing.BrowserMultiFormatReader();

    // Hilfsfunktion: CSV-Zeile sauber parsen
    const parseCSVLine = (text) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (c === '"') {
                if (inQuotes && text[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c === ',' && !inQuotes) {
                result.push(cur.trim());
                cur = '';
            } else {
                cur += c;
            }
        }
        result.push(cur.trim());
        return result;
    };

    const cleanIsbn = (str) => (str || '').replace(/[^0-9Xx]/g, '');
    const normalizeTitle = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // --- 1. SCANNER START ---
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

    // --- 2. MANUELLE ISBN EINGABE ---
    const isbnInputField = document.getElementById("isbnInput");
    isbnInputField?.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            const manualIsbn = isbnInputField.value.trim();
            if (manualIsbn) {
                await fetchBookData(manualIsbn);
                isbnInputField.value = ""; 
            }
        }
    });

    // --- 3. DATEN AUS GOOGLE TABELLE & JSON LADEN ---
    async function fetchBookData(rawInput) {
        const cleanScanIsbn = cleanIsbn(rawInput);
        const notFoundModal = document.getElementById("notFoundModal");
        const previewBox = document.getElementById("previewBox");

        try {
            // A) JSON für Cover-Zuordnung laden
            const jsonRes = await fetch(jsonURL);
            const jsonDaten = jsonRes.ok ? await jsonRes.json() : { books: [] };
            
            const isbnToCoverMap = {};
            (jsonDaten.books || []).forEach(b => {
                if (b.cover && b.isbn) {
                    b.isbn.split(',').forEach(raw => {
                        const cleaned = cleanIsbn(raw);
                        if (cleaned) isbnToCoverMap[cleaned] = b.cover;
                    });
                }
            });

            // B) CSV aus Google Tabelle laden
            const csvRes = await fetch(SUB_CSV_URL);
            if (!csvRes.ok) throw new Error("Google Tabelle konnte nicht geladen werden.");
            const csvText = await csvRes.text();

            const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length === 0) return;

            const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
            const getIndex = (names) => headers.findIndex(h => names.some(n => h.includes(n)));

            const idxIsbn = getIndex(['isbn']);
            const idxTitle = getIndex(['titel', 'title']);
            const idxAuthor = getIndex(['autor', 'author']);
            const idxGender = getIndex(['geschlecht', 'gender']);
            const idxUmfang = getIndex(['umfang']);
            const idxSeiten = getIndex(['seiten', 'pages']);
            const idxGenre = getIndex(['genre']);
            const idxSprache = getIndex(['sprache', 'language']);
            const idxFormat = getIndex(['format']);
            const idxStatus = getIndex(['status']);
            const idxVerlag = getIndex(['verlag', 'publisher']);
            const idxPoc = getIndex(['poc']);

            let treffer = null;

            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVLine(lines[i]);
                const rowIsbn = idxIsbn !== -1 ? row[idxIsbn] : '';
                const cleanedRowIsbn = cleanIsbn(rowIsbn);

                if (cleanedRowIsbn && cleanedRowIsbn.includes(cleanScanIsbn)) {
                    const title = idxTitle !== -1 ? row[idxTitle] : '';
                    let cover = isbnToCoverMap[cleanedRowIsbn] || '';

                    // Fallback Cover über Titel falls ISBN in JSON abweicht
                    if (!cover && title) {
                        const foundInJson = jsonDaten.books.find(b => normalizeTitle(b.cover.replace(/\.[^/.]+$/, '')) === normalizeTitle(title));
                        if (foundInJson) cover = foundInJson.cover;
                    }

                    const coverURL = cover ? `${baseURL}${cover}` : "";

                    treffer = {
                        title: title,
                        author: idxAuthor !== -1 ? row[idxAuthor] : '',
                        poc: idxPoc !== -1 ? row[idxPoc] : '',
                        gender: idxGender !== -1 ? row[idxGender] : '',
                        umfang: idxUmfang !== -1 ? row[idxUmfang] : '',
                        seiten: idxSeiten !== -1 ? row[idxSeiten] : '',
                        genre: idxGenre !== -1 ? row[idxGenre] : '',
                        sprache: idxSprache !== -1 ? row[idxSprache] : '',
                        format: idxFormat !== -1 ? row[idxFormat] : '',
                        status: idxStatus !== -1 ? row[idxStatus] : '', 
                        verlag: idxVerlag !== -1 ? row[idxVerlag] : '',
                        cover: coverURL,
                        githubCoverLink: cover ? `${baseURL}${cover}?raw=true` : ""
                    };
                    break;
                }
            }

            if (treffer) {
                bookData = {
                    start: new Date().toISOString().split('T')[0],
                    title: treffer.title,
                    author: treffer.author,
                    poc: treffer.poc,
                    gender: treffer.gender,
                    umfang: treffer.umfang,
                    seiten: treffer.seiten,
                    minuten: " ",
                    genre: treffer.genre,
                    sprache: treffer.sprache,
                    format: treffer.format,
                    status: treffer.status, 
                    verlag: treffer.verlag,
                    cover: treffer.githubCoverLink
                };

                document.getElementById("pTitle").textContent = bookData.title;
                document.getElementById("pAuthor").textContent = bookData.author;
                const coverImg = document.getElementById("pCover");
                if (coverImg) {
                    coverImg.src = treffer.cover;
                    coverImg.style.display = treffer.cover ? "block" : "none";
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

    // --- 4. BESTÄTIGEN & SENDEN ---
    document.getElementById("confirmSend")?.addEventListener("click", async () => {
        const confirmBtn = document.getElementById("confirmSend");
        const previewBox = document.getElementById("previewBox");
        
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Wird gesendet...";

        const fd = new FormData();
        Object.keys(FORM_ENTRIES).forEach(key => fd.append(FORM_ENTRIES[key], bookData[key] || ""));
        
        try {
            await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: fd });
            
            previewBox.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="font-family: 'Dosis', sans-serif; text-transform: none; margin-bottom: 15px;">
                        Buch erfolgreich hinzugefügt! 🚀
                    </h3>
                    <button id="btnSuccessAddOk" class="modal-save">Super!</button>
                </div>
            `;

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

    // --- 5. CLOSE EVENTS ---
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