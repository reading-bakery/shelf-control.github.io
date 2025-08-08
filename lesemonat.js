document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".monat-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentlyActive = document.querySelector(".monat-btn.active");
      const currentlyShown = document.querySelector(".collapse.show");
      const collapse = btn.nextElementSibling;

      // Wenn ein anderer Button aktiv ist, deaktivieren
      if (currentlyActive && currentlyActive !== btn) {
        currentlyActive.classList.remove("active");
      }
      // Wenn ein anderer Inhalt sichtbar ist, ausblenden
      if (currentlyShown && currentlyShown !== collapse) {
        currentlyShown.classList.remove("show");
      }

      // Toggle aktuellen Button und Inhalt
      btn.classList.toggle("active");
      collapse.classList.toggle("show");
    });
  });
});
