document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.monat-btn');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const monat = button.textContent.trim();
      const collapseDiv = document.getElementById(monat);
      if (!collapseDiv) return;

      const isOpen = collapseDiv.style.maxHeight && collapseDiv.style.maxHeight !== "0px";

      // Alle schließen und alle Buttons inaktiv machen
      buttons.forEach(btn => {
        const id = btn.textContent.trim();
        const div = document.getElementById(id);
        if (div) {
          div.style.maxHeight = null;
          div.style.padding = null;
        }
        btn.classList.remove('active');
      });

      // Wenn vorher nicht offen war, jetzt öffnen und aktivieren
      if (!isOpen) {
        collapseDiv.style.maxHeight = collapseDiv.scrollHeight + "px";
        collapseDiv.style.padding = "10px";
        button.classList.add('active');
      }
      // Wenn offen war, bleibt jetzt alles geschlossen (weil oben zu)
    });
  });
});
