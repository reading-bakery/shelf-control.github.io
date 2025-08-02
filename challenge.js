document.addEventListener("DOMContentLoaded", () => {
  const covers = document.querySelectorAll(".covers");

  covers.forEach((cover, index) => {
    const img = cover.querySelector("img");
    const svg = cover.querySelector("svg");

    const key = `svg-active-${index}`; // eindeutiger Key pro SVG

    // Zustand aus localStorage laden
    const saved = localStorage.getItem(key);
    if (saved === "true") {
      svg.classList.add("active");
      svg.style.fill = "#ff7256";
    }

    img.addEventListener("click", () => {
      if (svg.classList.contains("active")) {
        svg.classList.remove("active");
        svg.style.fill = "currentColor";
        localStorage.setItem(key, "false");
      } else {
        svg.classList.add("active");
        svg.style.fill = "#ff7256";
        localStorage.setItem(key, "true");
      }
    });
  });
});
