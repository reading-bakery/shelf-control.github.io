document.addEventListener('DOMContentLoaded', () => {
    // 1. Haupt-Elemente selektieren
    const addSubBtn = document.getElementById('addSub');
    const inputModal = document.getElementById('subModal');
    const successModal = document.getElementById('successAddModal');
    const addSubForm = document.getElementById('addSubForm');

    // Buttons innerhalb des Modals
    const saveBtn = document.querySelector('.modal-save');
    const cancelBtn = document.querySelector('.modal-cancel');
    const successOkBtn = document.getElementById('btnSuccessAddOk');

    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeWNpBj9ETdZZ3P08mmBPSi9UgBq_Qz7yIAz0xdrA7CKOg2Cw/formResponse";

    // --- FUNKTIONEN ---

    const openModal = () => {
        inputModal.style.display = 'flex';
    };

    const closeAll = () => {
        inputModal.style.display = 'none';
        successModal.style.display = 'none';
        if (addSubForm) addSubForm.reset();
    };

    // --- EVENT LISTENER ---

    // Modal öffnen wenn auf den Plus-Button geklickt wird
    if (addSubBtn) {
        addSubBtn.addEventListener('click', openModal);
    }

    // Abbrechen/Schließen
    if (cancelBtn) cancelBtn.addEventListener('click', closeAll);
    if (successOkBtn) successOkBtn.addEventListener('click', closeAll);

    // Schließen bei Klick außerhalb des Fenster-Inhalts
    window.addEventListener('click', (event) => {
        if (event.target === inputModal || event.target === successModal) {
            closeAll();
        }
    });

    // --- DATEN SENDEN ---

    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Verhindert Standard-Formular-Verhalten

            const title = document.getElementById('title').value;
            const pagesInput = document.getElementById('pages').value;
            const pages = parseInt(pagesInput) || 0;

            // Einfache Validierung
            if (!title) {
                alert("Bitte gib mindestens einen Buchtitel ein.");
                return;
            }

            // Umfang-Logik automatisch berechnen
            let umfangText = "";
            if (pages > 0 && pages <= 300) {
                umfangText = "bis 300";
            } else if (pages >= 301 && pages <= 500) {
                umfangText = "301-500";
            } else if (pages >= 501) {
                umfangText = "ab 501";
            }

            // FormData für Google Forms zusammenbauen
            const formData = new FormData();
            
            // Die Entry-IDs aus deinem Formular-Setup
            formData.append('entry.1995249053', title);
            formData.append('entry.1794428850', document.getElementById('author').value);
            formData.append('entry.2099091970', pages);
            formData.append('entry.989549743', umfangText); // Berechneter Umfang
            formData.append('entry.1917256559', document.getElementById('gender').value);
            formData.append('entry.1441130368', document.getElementById('genre').value);
            formData.append('entry.610782042', document.getElementById('language').value);
            formData.append('entry.63372831', document.getElementById('format').value);
            formData.append('entry.307032270', document.getElementById('publisher').value);
            formData.append('entry.493642308', document.getElementById('isbnnumber').value);
            
            // Standard-Werte
            formData.append('entry.680648898', 'SuB');
            
            // Cover-Handling (nur Dateiname)
            const coverFile = document.getElementById('cover').files[0];
            formData.append('entry.1309739909', coverFile ? coverFile.name : "");

            try {
                // Senden an Google (no-cors ist notwendig)
                await fetch(GOOGLE_FORM_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                });

                // Erfolg: Eingabe-Modal zu, Erfolgs-Modal auf
                inputModal.style.display = 'none';
                successModal.style.display = 'flex';
                addSubForm.reset();

            } catch (error) {
                console.error("Fehler beim Senden:", error);
                alert("Es gab ein Problem beim Speichern der Daten.");
            }
        });
    }
});