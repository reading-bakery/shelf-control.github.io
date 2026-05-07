document.addEventListener('DOMContentLoaded', () => {
    // --- 1. KONFIGURATION ---
    // Ersetze diese URL mit deiner Web-App-URL aus Google Apps Script (endet auf /exec)
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzYl3rNcBsgLlS_ZhAg30l0VXmYYb64QdlJKG0RmbahLGiOx8LaaA4Px8KjPEf3p2596Q/exec";

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
        successModal.style.display = 'none';
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
            const fileInput = document.getElementById('cover');

            if (!title) {
                alert("Bitte gib einen Buchtitel ein!");
                return;
            }

            if (fileInput.files.length === 0) {
                alert("Bitte wähle ein Cover-Bild aus!");
                return;
            }

            // Button sperren für Feedback
            saveBtn.disabled = true;
            saveBtn.innerText = "Wird hochgeladen...";

            const file = fileInput.files[0];
            const reader = new FileReader();

            // Bild einlesen und abschicken
            reader.onload = async function() {
                const base64String = reader.result.split(',')[1];
                const pages = parseInt(document.getElementById('pages').value) || 0;
                
                // Umfang-Logik
                let umfangText = "";
                if (pages > 0 && pages <= 300) umfangText = "bis 300";
                else if (pages >= 301 && pages <= 500) umfangText = "301-500";
                else if (pages >= 501) umfangText = "ab 501";

                const payload = {
                    base64: base64String,
                    type: file.type,
                    name: file.name,
                    title: title,
                    author: document.getElementById('author').value,
                    isbn: document.getElementById('isbnnumber').value,
                    pages: pages,
                    umfang: umfangText,
                    gender: document.getElementById('gender').value,
                    genre: document.getElementById('genre').value,
                    language: document.getElementById('language').value,
                    format: document.getElementById('format').value,
                    publisher: document.getElementById('publisher').value
                };

                try {
                    const response = await fetch(APPS_SCRIPT_URL, {
                        method: 'POST',
                        // mode: 'no-cors' MUSS WEG oder durch 'cors' ersetzt werden
                        body: JSON.stringify(payload)
                    });

                    const result = await response.json();

                    if (result.status === "success") {
                        closeAll();
                        successModal.style.display = 'flex';
                    } else {
                        throw new Error(result.message || "Fehler beim Speichern");
                    }
                } catch (error) {
                    console.error("Fehler beim Upload:", error);
                    alert("Es gab ein Problem: " + error.message);
                    saveBtn.disabled = false;
                    saveBtn.innerText = "Speichern";
                }
            };

            reader.readAsDataURL(file);
        };
    }
});