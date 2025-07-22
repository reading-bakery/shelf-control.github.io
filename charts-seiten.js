const sheetId = "1Y6q--ao9QaY13fZSiIqNjPiOkYQiaQHdggKl0b_VaHE";
const sheetName = "Leseliste";
const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&range=X2:X2&sheet=${sheetName}`;

function ladeWert() {
  fetch(url)
    .then(res => res.text())
    .then(text => {
      const jsonText = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
      const data = JSON.parse(jsonText);
      const wert = data.table.rows[0].c[0].v;

     
      const formatted = wert.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      document.getElementById('seiten-summe').textContent = formatted;
    })
    .catch(err => console.error("Fehler beim Laden der Daten:", err));
}

ladeWert();
setInterval(ladeWert, 60000);
