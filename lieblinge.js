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
            popupText.textContent = text;

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
