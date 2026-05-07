document.addEventListener('DOMContentLoaded', () => {
    // --- 1. KONFIGURATION & DATEN ---
    const setupData = {
        gender: ["Weiblich", "Männlich", "Divers", "Mix"],
        genre: ["Roman", "Non Fiction", "Thriller/Krimi", "Erzählung", "Graphic Novel/Comic"],
        languages: ["Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch", "Portugiesisch", "Koreanisch", "Japanisch", "Chinesisch", "Niederländisch", "Hebräisch", "Türkisch", "Russisch", "Schwedisch", "Norwegisch", "Dänisch", "Finnisch", "Polnisch", "Tschechisch", "Griechisch", "Arabisch", "Englisch Original", "Französisch Original", "Spanisch Original"],
        formats: ["Hardcover", "Softcover", "E-Book", "Hörbuch"],
        publishers: ["ATB/Aufbau/RL/Blumenbar", "Atlantik", "Atrium", "Blanvalet", "btb", "Carlsen", "C.Bertelsmann", "CBJ", "C.H.Beck", "Diogenes", "dtv", "Dumont", "Ecco", "Eichborn", "Eisele", "Fischer", "Frankfurter Verlagsanstalt", "Goldmann", "Hanser", "Harper Collins", "Heyne", "Insel", "Kampa", "Kein&Aber", "Knaur/Droemer", "Kjona", "KiWi", "Klett-Cotta", "Knesebeck", "Königskinder", "Limes", "Luchterhand", "Lübbe", "LYX", "Penguin", "Piper", "Pola", "Reclam", "Rowohlt/rororo", "transcript", "Ullstein/List", "Verbrecher", "Sonstiges"] // Hier einfach erweitern
    };

    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeWNpBj9ETdZZ3P08mmBPSi9UgBq_Qz7yIAz0xdrA7CKOg2Cw/formResponse";

    // --- 2. ELEMENTE SELEKTIEREN ---
    const addSubBtn = document.getElementById('addSub');
    const inputModal = document.getElementById('subModal');
    const successModal = document.getElementById('successSubModal');
    const addSubForm = document.getElementById('addSubForm');

    // Buttons innerhalb der Modals
    const saveBtn = inputModal.querySelector('.modal-save');
    const cancelBtn = inputModal.querySelector('.modal-cancel');
    const successOkBtn = document.getElementById('btnSuccessSubOk');

    // --- 3. DYNAMISCHE LISTEN BEFÜLLEN ---
    const populateSelect = (id, options) => {
        const selectEl = document.getElementById(id);
        if (!selectEl) return;
        
        // Bestehende Optionen (außer dem Platzhalter) entfernen, falls nötig
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
        addSubForm.reset();
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

    // --- 5. ABSENDEN AN GOOGLE ---
    if (saveBtn) {
        saveBtn.onclick = async (e) => {
            e.preventDefault();

            const title = document.getElementById('title').value.trim();
            if (!title) {
                alert("Bitte gib einen Buchtitel ein!");
                return;
            }

            const pages = parseInt(document.getElementById('pages').value) || 0;
            
            // Logik für Umfang (entry.989549743)
            let umfangText = "";
            if (pages > 0 && pages <= 300) umfangText = "bis 300";
            else if (pages >= 301 && pages <= 500) umfangText = "301-500";
            else if (pages >= 501) umfangText = "ab 501";

            const formData = new FormData();
            formData.append('entry.1995249053', title);
            formData.append('entry.1794428850', document.getElementById('author').value);
            formData.append('entry.2099091970', pages);
            formData.append('entry.989549743', umfangText);
            formData.append('entry.1917256559', document.getElementById('gender').value);
            formData.append('entry.1441130368', document.getElementById('genre').value);
            formData.append('entry.610782042', document.getElementById('language').value);
            formData.append('entry.63372831', document.getElementById('format').value);
            formData.append('entry.307032270', document.getElementById('publisher').value);
            formData.append('entry.493642308', document.getElementById('isbnnumber').value);
            formData.append('entry.680648898', 'SuB'); // Status

            // Cover Name
            const coverFile = document.getElementById('cover').files[0];
            formData.append('entry.1309739909', coverFile ? coverFile.name : "");

            try {
                saveBtn.disabled = true;
                saveBtn.innerText = "Speichert...";

                await fetch(GOOGLE_FORM_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                });

                closeAll();
                successModal.style.display = 'flex';
            } catch (error) {
                console.error("Fehler:", error);
                alert("Fehler beim Speichern!");
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerText = "Speichern";
            }
        };
    }
});