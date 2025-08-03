(async () => {
  const url = "https://script.google.com/macros/s/AKfycbwqNu3uGrCzzhMshApOwukufr0eZjljl9rwSA0FOl-fzmeBCX8-J3Fw3mPrFPkrv61cFA/exec";
  const response = await fetch(url);
  const json = await response.json();
  const data = json.data;

  // Map: Buch → Status
  const statusMap = {};
  data.forEach(entry => {
    const title = entry.Buch?.trim();
    const status = entry.Gelesen?.trim();
    if (title && status) {
      statusMap[title] = status;
    }
  });

  const covers = document.querySelectorAll('#agatha-challenge .covers');

  covers.forEach(cover => {
    const title = cover.getAttribute("data-title");
    const status = statusMap[title];

    // Bild- und SVG-Elemente finden
    const img = cover.querySelector("img");
    const svg = cover.querySelector("svg");

    // Reset CSS
    img.style.filter = "";
    svg?.querySelectorAll("path").forEach(p => p.style.fill = "");

    if (status === "YES") {
      // Cover farbig, SVG rot
      img.style.filter = "none";
      svg?.querySelectorAll("path").forEach(p => p.style.fill = "red");
    } else if (status === "NO") {
      // Cover in Graustufen, SVG bleibt standard
      img.style.filter = "grayscale(100%)";
    } else if (status === "ABBR") {
      // Cover farbig, SVG grün
      img.style.filter = "none";
      svg?.querySelectorAll("path").forEach(p => p.style.fill = "green");
    }
  });

  // Legende unten einfügen
  const legend = document.createElement("div");
  legend.innerHTML = `
    <div style="font-family: 'Dosis', sans-serif; font-size: 12px; text-align: center; margin-top: 10px;">
      <span style="color: red;">●</span> Gelesen (YES) &nbsp;
      <span style="color: green;">●</span> Abgebrochen (ABBR) &nbsp;
      <span style="color: gray;">●</span> Noch nicht gelesen (NO)
    </div>
  `;
  document.getElementById("agatha-challenge").appendChild(legend);
})();
