const sheetId = "1Y6q--ao9QaY13fZSiIqNjPiOkYQiaQHdggKl0b_VaHE";
const sheetName = "Leseliste";

const urlSeiten = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&range=X2:X2&sheet=${sheetName}`;
const urlMinuten = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&range=X3:X3&sheet=${sheetName}`;

function ladeSeitenWert() {
  fetch(urlSeiten)
    .then(res => res.text())
    .then(text => {
      const jsonText = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
      const data = JSON.parse(jsonText);

      if (data.table.rows.length > 0 && data.table.rows[0].c && data.table.rows[0].c[0]) {
        const wert = data.table.rows[0].c[0].v;
        const formatted = wert.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        document.getElementById('seiten-summe').textContent = formatted;
      } else {
        document.getElementById('seiten-summe').textContent = "0";
      }
    })
    .catch(err => {
      console.error("Fehler beim Laden der Seiten-Daten:", err);
      document.getElementById('seiten-summe').textContent = "Fehler beim Laden";
    });
}

function ladeMinutenWert() {
  fetch(urlMinuten)
    .then(res => res.text())
    .then(text => {
      const jsonText = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
      const data = JSON.parse(jsonText);

      if (data.table.rows.length > 0 && data.table.rows[0].c && data.table.rows[0].c[0]) {
        const wert = data.table.rows[0].c[0].v;
        const formatted = wert.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        document.getElementById('minuten-summe').textContent = formatted;
      } else {
        document.getElementById('minuten-summe').textContent = "0";
      }
    })
    .catch(err => {
      console.error("Fehler beim Laden der Minuten-Daten:", err);
      document.getElementById('minuten-summe').textContent = "Fehler beim Laden";
    });
}

function ladeAlleWerte() {
  ladeSeitenWert();
  ladeMinutenWert();
}

ladeAlleWerte();
setInterval(ladeAlleWerte, 60000);
