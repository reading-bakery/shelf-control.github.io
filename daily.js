document.addEventListener('DOMContentLoaded', () => {
  const spreadsheetIdBuecher = '1Y6q--ao9QaY13fZSiIqNjPiOkYQiaQHdggKl0b_VaHE';
  const gidBuecher = '1702643479'; // Buchdaten aus diesem Tab laden
  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe58QnLhT5Kujn2Wv-nF5uJqUM6JWQJ7NxDJT-iRNJiwXOEzg/formResponse'; // <-- Hier Formular-URL einfügen

  // Feldeinträge des Google Formulars (bitte anpassen!)
  const feldIdBuch = 'entry.1952704878';      // z.B. entry.1234567890
  const feldIdBisSeite = 'entry.1828547420'; // z.B. entry.0987654321

  const selectBuch = document.getElementById('buch');
  const inputBisSeite = document.getElementById('bisSeite');
  const form = document.getElementById('trackerForm');
  const statusDiv = document.getElementById('status');

  const buchDaten = {}; // { Titel: { maxSeiten: Zahl } }

  async function ladeBuecher() {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetIdBuecher}/export?format=csv&gid=${gidBuecher}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fehler beim Laden der Buchdaten');
      const csvText = await res.text();
      parseCsvUndFuellen(csvText);
    } catch (error) {
      zeigeStatus('Fehler beim Laden der Bücher: ' + error.message, true);
    }
  }

  function parseCsvUndFuellen(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');

    const idxTitel = headers.findIndex(h => h.toLowerCase().includes('titel'));
    const idxSeitenTotal = headers.findIndex(h => h.toLowerCase().includes('seitenzahl total'));
    const idxEnde = headers.findIndex(h => h.toLowerCase().includes('ende'));

    if (idxTitel === -1 || idxSeitenTotal === -1 || idxEnde === -1) {
      zeigeStatus('CSV Formatfehler: Titel, Seitenzahl total oder Ende nicht gefunden.', true);
      return;
    }

    selectBuch.innerHTML = '<option value="">Bitte wählen</option>';

    for (let i = 1; i < lines.length; i++) {
      // CSV-Spalten mit Komma trennen, eventuell Zellen mit Komma in Anführungszeichen nicht korrekt, für einfache CSV geht das so
      const cols = lines[i].split(',');

      const titel = cols[idxTitel]?.trim() || '';
      const seitenTotalStr = cols[idxSeitenTotal]?.trim() || '';
      const ende = cols[idxEnde]?.trim() || '';

      if (titel !== '' && ende === '') {
        const seitenTotal = parseInt(seitenTotalStr, 10);
        buchDaten[titel] = { maxSeiten: isNaN(seitenTotal) ? Infinity : seitenTotal };

        const option = document.createElement('option');
        option.value = titel;
        option.textContent = titel;
        selectBuch.appendChild(option);
      }
    }
  }

  function validateForm() {
    const titel = selectBuch.value;
    if (!titel) {
      zeigeStatus('Bitte ein Buch auswählen.', true);
      return false;
    }
    const maxSeiten = buchDaten[titel]?.maxSeiten || Infinity;
    const bisSeite = parseInt(inputBisSeite.value, 10);
    if (isNaN(bisSeite) || bisSeite < 1) {
      zeigeStatus('Bitte eine gültige Seitenzahl eingeben. 😵', true);
      return false;
    }
    if (bisSeite > maxSeiten) {
      zeigeStatus(`Die Seitenzahl darf nicht größer sein als die maximale Seitenzahl (${maxSeiten}). 😭`, true);
      return false;
    }
    return true;
  }

  async function sendeDatenAnForm(titel, bisSeite) {
    const formData = new URLSearchParams();
    formData.append(feldIdBuch, titel);
    formData.append(feldIdBisSeite, bisSeite);

    try {
      await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      zeigeStatus('Eintrag erfolgreich gespeichert. 😍', false);
      form.reset();
    } catch (error) {
      zeigeStatus('Fehler beim Senden: ' + error.message, true);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    zeigeStatus('Speichere...', false);
    if (!validateForm()) return;

    const titel = selectBuch.value;
    const bisSeite = inputBisSeite.value;

    await sendeDatenAnForm(titel, bisSeite);
  });

function zeigeStatus(text, isError) {
  if (!text) {
    statusDiv.style.display = 'none';
    statusDiv.textContent = '';
    statusDiv.classList.remove('error');
  } else {
    statusDiv.textContent = text;
    statusDiv.classList.toggle('error', isError);
    statusDiv.style.display = 'block';
  }
}

  ladeBuecher();
});