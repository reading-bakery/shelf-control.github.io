document.addEventListener("DOMContentLoaded", () => {

    const covers = document.querySelectorAll(".lieblinge-cover");
    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popupTitle");
    const popupText = document.getElementById("popupText");
    const popupClose = document.getElementById("popupClose");

    covers.forEach(cover => {
        cover.addEventListener("click", () => {

            const title = cover.getAttribute("data-title") || "Titel fehlt";
            const text = cover.getAttribute("data-text") || "Kein Beschreibungstext vorhanden.";

            popupTitle.textContent = title;
            popupText.innerHTML = text;

            // JS: max. Höhe für Text setzen + Scrollen aktivieren
            const maxHeight = window.innerHeight * 0.6; // 60% der Viewport-Höhe
            popupText.style.maxHeight = maxHeight + "px";
            popupText.style.overflowY = "auto";

            popup.style.display = "flex";
        });
    });

    popupClose.addEventListener("click", () => {
        popup.style.display = "none";
    });

    popup.addEventListener("click", (event) => {
        if (event.target === popup) popup.style.display = "none";
    });

});
