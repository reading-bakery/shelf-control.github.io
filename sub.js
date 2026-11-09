document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".sub");
    const searchInput = document.getElementById("sub-search");
    const bookCountEl = document.getElementById("sub-book-count");
    const totalPriceEl = document.getElementById("sub-total-price");

    // --- KONFIGURATION ---
    const baseURL = "https://raw.githubusercontent.com/reading-bakery/shelf-control.github.io/main/images/sub/";
    const jsonURL = baseURL + "sub.json";
    
    // SuB-Bücher Tabelle als CSV
    const SUB_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=314687961&single=true&output=csv";
    
    // Status-Abgleich
    const SHEET_TSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=tsv"; 
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
        cover: "entry.952453014",
        poc: "entry.1600060751"
    };

    let alleBuecher = [];
    let bereitsGeleseneCover = "";

    // --- MODAL ELEMENTE ---
    const modal = document.getElementById("book-modal");
    const closeBtn = document.getElementById("modal-cancel");
    const confirmBtn = document.getElementById("modal-confirm");

    // CSV-Zeile sauber parsen
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

    // Hilfsfunktion: Preis in Float umwandeln (z.B. "12,99 €" -> 12.99)
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(',', '.').replace(/[^0-9.]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    };

    // ANIMATION: Zahlen sanft hochzählen lassen
    const animateValue = (element, start, end, duration, isCurrency = false) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = start + progress * (end - start);
            
            if (isCurrency) {
                element.textContent = current.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
            } else {
                element.textContent = Math.floor(current);
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Bei Abschluss exakten Endwert setzen & Bumb-Effekt ausführen
                if (isCurrency) {
                    element.textContent = end.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
                } else {
                    element.textContent = end;
                }
                element.classList.add("bump");
                setTimeout(() => element.classList.remove("bump"), 300);
            }
        };
        window.requestAnimationFrame(step);
    };

    const ladeGeleseneStatus = async () => {
        try {
            const response = await fetch(SHEET_TSV_URL);
            if (!response.ok) throw new Error();
            bereitsGeleseneCover = await response.text();
        } catch (e) {
            bereitsGeleseneCover = "";
        }
    };

    function openSuccessAddModal() {
        return new Promise(resolve => {
            const successModal = document.getElementById("successAddModal");
            const btnOk = document.getElementById("btnSuccessAddOk");
            successModal.style.display = "flex";
            const onOk = () => {
                successModal.style.display = "none";
                btnOk.removeEventListener("click", onOk);
                resolve();
            };
            btnOk.addEventListener("click", onOk);
        });
    }

    const updateStats = (buecherListe) => {
        const sichtbareBuecher = buecherListe.filter(b => b.cover && !bereitsGeleseneCover.includes(b.cover));
        const count = sichtbareBuecher.length;
        const total = sichtbareBuecher.reduce((sum, b) => sum + parsePrice(b.price), 0);

        const currentCount = parseInt(bookCountEl.textContent) || 0;
        const currentPrice = parsePrice(totalPriceEl.textContent);

        animateValue(bookCountEl, currentCount, count, 800, false);
        animateValue(totalPriceEl, currentPrice, total, 800, true);
    };

    const addToGoogleSheets = (buch, element) => {
        document.getElementById("modal-cover").src = baseURL + buch.cover;
        document.getElementById("modal-title").textContent = buch.title;
        document.getElementById("modal-author").textContent = buch.author;

        modal.style.display = "flex";
        closeBtn.onclick = () => { modal.style.display = "none"; };

        confirmBtn.onclick = async () => {
            confirmBtn.disabled = true;
            confirmBtn.textContent = "Wird gesendet...";

            const githubLink = `https://github.com/reading-bakery/shelf-control.github.io/blob/main/images/sub/${buch.cover}?raw=true`;
            const formData = new FormData();
            const today = new Date().toISOString().split('T')[0];

            formData.append(FORM_ENTRIES.start, today);
            formData.append(FORM_ENTRIES.title, buch.title || "");
            formData.append(FORM_ENTRIES.author, buch.author || "");
            formData.append(FORM_ENTRIES.gender, buch.gender || "");
            formData.append(FORM_ENTRIES.umfang, buch.umfang || "");
            formData.append(FORM_ENTRIES.seiten, buch.seiten || "");
            formData.append(FORM_ENTRIES.minuten, ""); 
            formData.append(FORM_ENTRIES.genre, buch.genre || "");
            formData.append(FORM_ENTRIES.sprache, buch.sprache || "");
            formData.append(FORM_ENTRIES.format, buch.format || "");
            formData.append(FORM_ENTRIES.status, buch.status || "");
            formData.append(FORM_ENTRIES.verlag, buch.verlag || "");
            formData.append(FORM_ENTRIES.poc, buch.poc || "");
            formData.append(FORM_ENTRIES.cover, githubLink);

            try {
                await fetch(FORM_URL, { method: "POST", mode: "no-cors", body: formData });
                modal.style.display = "none";
                await openSuccessAddModal();

                element.style.transition = "all 0.5s ease";
                element.style.opacity = "0";
                element.style.transform = "translateY(-20px) scale(0.8)";
                
                setTimeout(() => {
                    element.remove();
                    alleBuecher = alleBuecher.filter(b => b.cover !== buch.cover);
                    updateStats(alleBuecher); // Stats neu berechnen & animieren
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = "Hinzufügen";
                }, 500);

            } catch (error) {
                console.error("Fehler beim Senden:", error);
                alert("Fehler beim Hinzufügen. Bitte erneut versuchen.");
                confirmBtn.disabled = false;
                confirmBtn.textContent = "Hinzufügen";
            }
        };
    };

    const renderBooks = (buecherListe) => {
        container.innerHTML = "";

        if (buecherListe.length === 0) {
            container.textContent = "Keine Bücher gefunden.";
            updateStats([]);
            return;
        }

        buecherListe.forEach(buch => {
            if (buch.cover && !bereitsGeleseneCover.includes(buch.cover)) {
                const wrapper = document.createElement("div");
                wrapper.classList.add("buch-wrapper");

                const img = document.createElement("img");
                img.src = baseURL + buch.cover;
                img.alt = buch.title || "Buchcover";
                img.loading = "lazy";
                img.classList.add("sub-bild");

                const overlay = document.createElement("div");
                overlay.classList.add("plus-overlay");
                overlay.textContent = "+";
                
                overlay.addEventListener("click", () => addToGoogleSheets(buch, wrapper));

                wrapper.appendChild(img);
                wrapper.appendChild(overlay);
                container.appendChild(wrapper);
            }
        });

        updateStats(buecherListe);
    };

    const init = async () => {
        await ladeGeleseneStatus();
        
        try {
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

            const csvRes = await fetch(SUB_CSV_URL);
            if (!csvRes.ok) throw new Error("Google Tabelle CSV konnte nicht geladen werden.");
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
            const idxPrice = getIndex(['preis', 'price', 'wert']); // Preis Spalte identifizieren
            const idxGenre = getIndex(['genre']);
            const idxSprache = getIndex(['sprache', 'language']);
            const idxFormat = getIndex(['format']);
            const idxStatus = getIndex(['status']);
            const idxVerlag = getIndex(['verlag', 'publisher']);
            const idxPoc = getIndex(['poc']);
            const idxCoverCol = getIndex(['cover']);

            alleBuecher = [];

            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVLine(lines[i]);
                const rawIsbn = idxIsbn !== -1 ? row[idxIsbn] : '';
                const title = idxTitle !== -1 ? row[idxTitle] : '';
                const cleanedIsbn = cleanIsbn(rawIsbn);

                let cover = '';
                if (idxCoverCol !== -1 && row[idxCoverCol]) {
                    cover = row[idxCoverCol];
                } else {
                    cover = isbnToCoverMap[cleanedIsbn] || '';
                    if (!cover && title) {
                        const foundInJson = jsonDaten.books.find(b => normalizeTitle(b.cover.replace(/\.[^/.]+$/, '')) === normalizeTitle(title));
                        if (foundInJson) cover = foundInJson.cover;
                    }
                }

                const buch = {
                    isbn: rawIsbn,
                    title: title,
                    author: idxAuthor !== -1 ? row[idxAuthor] : '',
                    gender: idxGender !== -1 ? row[idxGender] : '',
                    umfang: idxUmfang !== -1 ? row[idxUmfang] : '',
                    seiten: idxSeiten !== -1 ? row[idxSeiten] : '',
                    price: idxPrice !== -1 ? row[idxPrice] : '0',
                    genre: idxGenre !== -1 ? row[idxGenre] : '',
                    sprache: idxSprache !== -1 ? row[idxSprache] : '',
                    format: idxFormat !== -1 ? row[idxFormat] : '',
                    status: idxStatus !== -1 ? row[idxStatus] : '',
                    verlag: idxVerlag !== -1 ? row[idxVerlag] : '',
                    poc: idxPoc !== -1 ? row[idxPoc] : '',
                    cover: cover
                };

                if (buch.title) {
                    alleBuecher.push(buch);
                }
            }

            renderBooks(alleBuecher);

        } catch (error) {
            console.error("Fehler beim Laden:", error);
            container.textContent = "Bücher konnten nicht geladen werden.";
        }
    };

    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        const gefiltert = alleBuecher.filter(b => 
            (b.title || "").toLowerCase().includes(term) || 
            (b.author || "").toLowerCase().includes(term) || 
            (b.isbn || "").toLowerCase().includes(term) || 
            (b.genre || "").toLowerCase().includes(term)
        );
        renderBooks(gefiltert);
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    init();
});