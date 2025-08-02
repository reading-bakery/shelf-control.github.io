const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqNu3uGrCzzhMshApOwukufr0eZjljl9rwSA0FOl-fzmeBCX8-J3Fw3mPrFPkrv61cFA/exec"; // deine URL

document.addEventListener("DOMContentLoaded", () => {
  const covers = document.querySelectorAll(".covers");

  // 1. Initial-Ladezustände aus dem Sheet
  fetch(SCRIPT_URL)
    .then(res => res.json())
    .then(statusData => {
      covers.forEach((cover, index) => {
        const svg = cover.querySelector("svg");
        const match = statusData.find(entry => entry.index == index);

        if (match && match.gelesen) {
          svg.classList.add("active");
          svg.style.fill = "#ff7256";
        }
      });
    });

  // 2. Klick-Handling & POST an das Script
  covers.forEach((cover, index) => {
    const img = cover.querySelector("img");
    const svg = cover.querySelector("svg");

    img.addEventListener("click", () => {
      const isActive = svg.classList.toggle("active");
      svg.style.fill = isActive ? "#ff7256" : "currentColor";

      fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          index: index,
          gelesen: isActive
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
    });
  });
});
