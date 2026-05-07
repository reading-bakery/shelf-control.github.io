document.addEventListener('DOMContentLoaded', () => {
    const addSubBtn = document.getElementById('addSub');
    const inputModal = document.getElementById('subModal');
    
    // Neue IDs hier:
    const successModal = document.getElementById('successSubModal');
    const successOkBtn = document.getElementById('btnSuccessSubOk');
    
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.modal-cancel');
    const saveBtn = document.querySelector('.modal-save');
    const addSubForm = document.getElementById('addSubForm');

    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeWNpBj9ETdZZ3P08mmBPSi9UgBq_Qz7yIAz0xdrA7CKOg2Cw/formResponse";

    // Modals öffnen/schließen
    addSubBtn.addEventListener('click', () => inputModal.style.display = 'flex');

    const closeAll = () => {
        inputModal.style.display = 'none';
        successModal.style.display = 'none';
        addSubForm.reset();
    };

    closeBtn.addEventListener('click', closeAll);
    cancelBtn.addEventListener('click', closeAll);
    successOkBtn.addEventListener('click', closeAll);

    window.addEventListener('click', (event) => {
        if (event.target === inputModal || event.target === successModal) closeAll();
    });

    // Speichern Logik
    saveBtn.addEventListener('click', async () => {
        const title = document.getElementById('title').value;
        if (!title) {
            alert("Buchtitel fehlt!");
            return;
        }

        const pages = parseInt(document.getElementById('pages').value) || 0;
        let umfang = pages <= 300 ? "bis 300" : (pages <= 500 ? "301-500" : "ab 501");

        const formData = new FormData();
        formData.append('entry.1995249053', title);
        formData.append('entry.1794428850', document.getElementById('author').value);
        formData.append('entry.2099091970', pages);
        formData.append('entry.989549743', umfang);
        formData.append('entry.1917256559', document.getElementById('gender').value);
        formData.append('entry.1441130368', document.getElementById('genre').value);
        formData.append('entry.610782042', document.getElementById('language').value);
        formData.append('entry.63372831', document.getElementById('format').value);
        formData.append('entry.307032270', document.getElementById('publisher').value);
        formData.append('entry.493642308', document.getElementById('isbnnumber').value);
        formData.append('entry.680648898', 'SuB');

        try {
            await fetch(GOOGLE_FORM_URL, { method: 'POST', mode: 'no-cors', body: formData });
            inputModal.style.display = 'none';
            successModal.style.display = 'flex'; // Zeigt dein neues Erfolgs-Modal
        } catch (e) {
            console.error(e);
        }
    });
});