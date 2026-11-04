document.addEventListener('DOMContentLoaded', () => {
    // --- 1. KONFIGURATION ---
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxH5qweCK_CZRlPaIThVGAfqGhEGsvb3Hdl0LX2xBwgHrJT7HudznfXQ3B2CuziF0-v4w/exec";

    const setupData = {
        gender: ["Weiblich", "Männlich", "Divers", "Mix"],
        genre: ["Roman", "Non Fiction", "Thriller/Krimi", "Erzählung", "Graphic Novel/Comic"],
        languages: [
            "Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch", 
            "Portugiesisch", "Koreanisch", "Japanisch", "Chinesisch", 
            "Niederländisch", "Hebräisch", "Türkisch", "Russisch", 
            "Schwedisch", "Norwegisch", "Dänisch", "Finnisch", 
            "Polnisch", "Tschechisch", "Griechisch", "Arabisch", 
            "Englisch Original", "Französisch Original", "Spanisch Original"
        ],
        formats: ["Hardcover", "Softcover", "E-Book", "Hörbuch"],
        publishers: [
            "ATB/Aufbau/RL/Blumenbar", "Atlantik", "Atrium", "Blanvalet", "btb", 
            "Carlsen", "C.Bertelsmann", "CBJ", "C.H.Beck", "Diogenes", "dtv", 
            "Dumont", "Ecco", "Eichborn", "Eisele", "Fischer", 
            "Frankfurter Verlagsanstalt", "Goldmann", "Hanser", "Harper Collins", 
            "Heyne", "Insel", "Kampa", "Kein&Aber", "Knaur/Droemer", "Kjona", 
            "KiWi", "Klett-Cotta", "Knesebeck", "Königskinder", "Limes", 
            "Luchterhand", "Lübbe", "LYX", "Penguin", "Piper", "Pola", 
            "Reclam", "Rowohlt/rororo", "transcript", "Ullstein/List", 
            "Verbrecher", "Sonstiges"
        ]
    };

    // --- 2. ELEMENTE SELEKTIEREN ---
    const addSubBtn = document.getElementById('addSub');
    const inputModal = document.getElementById('subModal');
    const successModal = document.getElementById('successSubModal');
    const addSubForm = document.getElementById('addSubForm');

    const saveBtn = inputModal.querySelector('.modal-save');
    const cancelBtn = inputModal.querySelector('.modal-cancel');
    const successOkBtn = document.getElementById('btnSuccessSubOk');

    // --- 3. DYNAMISCHE LISTEN BEFÜLLEN ---
    const populateSelect = (id, options) => {
        const selectEl = document.getElementById(id);
        if (!selectEl) return;
        
        while (selectEl.options.length > 1) {
            selectEl.remove(1);
        }

        options.forEach(opt => {
            const el = document.createElement("option");
            el.value = opt;
            el.textContent = opt;
            selectEl.appendChild(el);
        });
    };

    populateSelect('gender', setupData.gender);
    populateSelect('genre', setupData.genre);
    populateSelect('language', setupData.languages);
    populateSelect('format', setupData.formats);
    populateSelect('publisher', setupData.publishers);

    // --- 4. MODAL STEUERUNG ---
    const closeAll = () => {
        inputModal.style.display = 'none';
        if (successModal) successModal.style.display = 'none';
        if (addSubForm) addSubForm.reset();
        saveBtn.disabled = false;
        saveBtn.innerText = "Speichern";
    };

    if (addSubBtn) {
        addSubBtn.onclick = (e) => {
            e.preventDefault();
            inputModal.style.display = 'flex';
        };
    }

    if (cancelBtn) cancelBtn.onclick = closeAll;
    if (successOkBtn) successOkBtn.onclick = closeAll;

    window.onclick = (event) => {
        if (event.target === inputModal || event.target === successModal) closeAll();
    };

    // --- 5. ABSENDEN AN GOOGLE APPS SCRIPT ---
    if (saveBtn) {
        saveBtn.onclick = async (e) => {
            e.preventDefault();

            const title = document.getElementById('title').value.trim();
            if (!title) {
                alert("Bitte gib einen Buchtitel ein!");
                return;
            }

            saveBtn.disabled = true;
            saveBtn.innerText = "Wird gespeichert...";

            const fileInput = document.getElementById('cover');
            const pages = parseInt(document.getElementById('pages').value) || 0;
            const price = parseFloat(document.getElementById('price').value) || 0;
            
            let umfangText = "";
            if (pages > 0 && pages <= 300) umfangText = "bis 300";
            else if (pages >= 301 && pages <= 500) umfangText = "301-500";
            else if (pages >= 501) umfangText = "ab 501";

            // Funktion zum Senden an das Apps Script
            const sendData = async (payload) => {
                try {
                    const response = await fetch(APPS_SCRIPT_URL, {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });

                    const resultText = await response.text();

                    if (resultText.includes("SUCCESS")) {
                        closeAll();
                        if (successModal) successModal.style.display = 'flex';
                    } else {
                        throw new Error(resultText || "Fehler beim Speichern");
                    }
                } catch (error) {
                    console.error("Fehler beim Upload:", error);
                    alert("Es gab ein Problem: " + error.message);
                    saveBtn.disabled = false;
                    saveBtn.innerText = "Speichern";
                }
            };

            // Prüfen, ob ein Cover ausgewählt wurde
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();

                reader.onload = async function() {
                    const base64String = reader.result.split(',')[1];
                    const payload = {
                        base64: base64String,
                        type: file.type,
                        name: file.name,
                        title: title,
                        author: document.getElementById('author').value,
                        isbn: document.getElementById('isbnnumber').value,
                        pages: pages,
                        umfang: umfangText,
                        price: price,
                        "entry.197444590": price,
                        gender: document.getElementById('gender').value,
                        genre: document.getElementById('genre').value,
                        language: document.getElementById('language').value,
                        format: document.getElementById('format').value,
                        publisher: document.getElementById('publisher').value
                    };
                    await sendData(payload);
                };

                reader.readAsDataURL(file);
            } else {
                // Ohne Bild absenden
                const payload = {
                    base64: "",
                    type: "",
                    name: "placeholder.png",
                    title: title,
                    author: document.getElementById('author').value,
                    isbn: document.getElementById('isbnnumber').value,
                    pages: pages,
                    umfang: umfangText,
                    price: price,
                    "entry.197444590": price,
                    gender: document.getElementById('gender').value,
                    genre: document.getElementById('genre').value,
                    language: document.getElementById('language').value,
                    format: document.getElementById('format').value,
                    publisher: document.getElementById('publisher').value
                };
                await sendData(payload);
            }
        };
    }
});