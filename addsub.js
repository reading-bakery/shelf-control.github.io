document.addEventListener('DOMContentLoaded', () => {
    const addSubBtn = document.getElementById('addSub');
    const modal = document.getElementById('subModal');
    const closeBtn = document.querySelector('.close-modal');

    // Modal öffnen
    addSubBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Modal schließen (X-Button)
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Modal schließen (Klick außerhalb des Fensters)
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});