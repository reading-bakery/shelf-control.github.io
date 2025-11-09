document.addEventListener('DOMContentLoaded', () => {
  const spreadsheetId = '2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck';
  const gidBuecher = '1702643479';
  const gidDaily = '1783910348';

  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe58QnLhT5Kujn2Wv-nF5uJqUM6JWQJ7NxDJT-iRNJiwXOEzg/formResponse';
  const formUrlLetzterStand = 'https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse';

  const feldIdBuch = 'entry.1952704878';
  const feldIdSeiten = 'entry.1828547420';
  const feldIdMinuten = 'entry.1811867671';
  const feldIdBuchLetzterStand = 'entry.1217511174';
  const feldIdNeuerStand = 'entry.1273432895';
  const feldIdDate = 'entry.1557582300';

  const selectBuch = document.getElementById('buch');
  const inputFortschritt = document.getElementById('bisSeite');
  const form = document.getElementById('trackerForm');
  const statusDiv = document.getElementById('status');

  const buchDaten = {}; // enthält maxSeiten, maxMinuten, letzte Tageswerte, kumulierte Summe

  async function ladeBuecherUndStände() {
    try {
      const [buchCsv, dailyCsv] = await Promise.all([
        fetch(`https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?gid=${gidBuecher}&single=true&output=csv`).then(res => res.text()),
        fetch(`https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?gid=${gidDaily}&single=true&output=csv`).then(res => res.text()),
      ]);

      const tageBuch = parseDailyCsv(dailyCsv);
      parseBuchCsv(buchCsv, tageBuch);
    } catch (error) {
      zeigeStatus('Fehler beim Laden: ' + error.message, true);
    }
  }

  // Lese alle Einträge aus Daily CSV und bilde pro Buch die Historie nach Datum
  function parseDailyCsv(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const idxBuch = headers.indexOf('Buch');
    const idxSeite = headers.indexOf('Seiten');
    const idxMinuten = headers.indexOf('Minuten');
    const idxDate = headers.indexOf('Datum');

    const tageBuch = {}; // tageBuch[Buch][Datum] = Wert
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      const buch = row[idxBuch]?.trim();
      const seite = parseInt(row[idxSeite]?.trim(), 10);
      const minuten = parseInt(row[idxMinuten]?.trim(), 10);
      const datum = row[idxDate]?.trim();

      if (!buch || !datum) continue;

      if (!tageBuch[buch]) tageBuch[buch] = {};
      if (!tageBuch[buch][datum]) tageBuch[buch][datum] = { seite: 0, minuten: 0 };

      if (!isNaN(seite)) tageBuch[buch][datum].seite += seite;
      if (!isNaN(minuten)) tageBuch[buch][datum].minuten += minuten;
    }

    return tageBuch;
  }

  function parseBuchCsv(csv, tageBuch) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');

    const idxTitel = headers.indexOf('Titel');
    const idxSeiten = headers.indexOf('Seitenzahl total');
    const idxMinuten = headers.indexOf('Minuten total');
    const idxFormat = headers.indexOf('Format');
    const idxEnde = headers.indexOf('Ende');

    selectBuch.innerHTML = '<option value="">Bitte wählen</option>';

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      const titel = row[idxTitel]?.trim();
      const maxSeiten = parseInt(row[idxSeiten]?.trim(), 10);
      const maxMinuten = parseInt(row[idxMinuten]?.trim(), 10);
      const format = row[idxFormat]?.trim();
      const beendet = row[idxEnde]?.trim();

      if (titel && beendet === '') {
        // Berechne kumulierte Summe über alle Tage
        let sumSeiten = 0;
        let sumMinuten = 0;
        if (tageBuch[titel]) {
          for (const datum in tageBuch[titel]) {
            sumSeiten += tageBuch[titel][datum].seite;
            sumMinuten += tageBuch[titel][datum].minuten;
          }
        }

        // Letzter Stand für Validierung (letzter Tag)
        let letzterSeitenStand = 0;
        let letzterMinutenStand = 0;
        if (tageBuch[titel]) {
          const daten = Object.keys(tageBuch[titel]).sort();
          const letzterTag = daten[daten.length - 1];
          letzterSeitenStand = tageBuch[titel][letzterTag].seite;
          letzterMinutenStand = tageBuch[titel][letzterTag].minuten;
        }

        buchDaten[titel] = {
          format,
          maxSeiten: isNaN(maxSeiten) ? Infinity : maxSeiten,
          maxMinuten: isNaN(maxMinuten) ? Infinity : maxMinuten,
          summe: { seite: sumSeiten, minuten: sumMinuten },
          letzterStand: { seite: letzterSeitenStand, minuten: letzterMinutenStand }
        };

        const option = document.createElement('option');
        option.value = titel;
        option.textContent = titel;
        selectBuch.appendChild(option);
      }
    }
  }

  function validateForm() {
    const titel = selectBuch.value;
    const daten = buchDaten[titel];
    const neuerWert = parseInt(inputFortschritt.value, 10);

    if (!titel) {
      zeigeStatus('Bitte ein Buch auswählen. 😊', true);
      return false;
    }
    if (isNaN(neuerWert) || neuerWert < 1) {
      zeigeStatus('Bitte gültigen Wert eingeben. 🧐', true);
      return false;
    }

    if (['Softcover', 'Hardcover', 'eBook'].includes(daten.format)) {
      if (neuerWert > daten.maxSeiten) {
        zeigeStatus(`Maximale Seitenzahl überschritten (${daten.maxSeiten}). 😭`, true);
        return false;
      }
      if (neuerWert <= daten.letzterStand.seite) {
        zeigeStatus(`Der neue Stand muss über dem bisherigen liegen (${daten.letzterStand.seite}). 🥴`, true);
        return false;
      }
    } else if (daten.format === 'Hörbuch') {
      if (neuerWert > daten.maxMinuten) {
        zeigeStatus(`Maximale Minutenzahl überschritten (${daten.maxMinuten}). 😭`, true);
        return false;
      }
      if (neuerWert <= daten.letzterStand.minuten) {
        zeigeStatus(`Der neue Stand muss über dem bisherigen liegen (${daten.letzterStand.minuten}). 🥴`, true);
        return false;
      }
    } else {
      zeigeStatus('Unbekanntes Format. 🤔', true);
      return false;
    }

    return true;
  }

  async function sendeEintrag(titel, differenz, datumString) {
    const daten = buchDaten[titel];
    const formData = new URLSearchParams();
    formData.append(feldIdBuch, titel);

    if (['Softcover', 'Hardcover', 'eBook'].includes(daten.format)) {
      formData.append(feldIdSeiten, differenz);
    } else {
      formData.append(feldIdMinuten, differenz);
    }

    formData.append(feldIdDate, datumString);

    await fetch(formUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
  }

  async function sendeLetzterStand(titel, neuerWert) {
    const formData = new URLSearchParams();
    formData.append(feldIdBuchLetzterStand, titel);
    formData.append(feldIdNeuerStand, neuerWert);

    await fetch(formUrlLetzterStand, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    zeigeStatus('Speichere...', false);
    if (!validateForm()) return;

    const titel = selectBuch.value;
    const daten = buchDaten[titel];
    const neuerWert = parseInt(inputFortschritt.value, 10);

    // Differenz berechnen für neuen Tageswert
    const letzterWert = ['Softcover', 'Hardcover', 'eBook'].includes(daten.format)
      ? daten.letzterStand.seite
      : daten.letzterStand.minuten;

    const differenz = neuerWert - letzterWert;

    const heute = new Date();
    const datumString = heute.toISOString().split('T')[0];

    try {
      await sendeEintrag(titel, differenz, datumString);
      await sendeLetzterStand(titel, neuerWert);

      // Lokale Daten aktualisieren
      if (['Softcover', 'Hardcover', 'eBook'].includes(daten.format)) {
        daten.summe.seite += differenz;
        daten.letzterStand.seite = neuerWert;
      } else {
        daten.summe.minuten += differenz;
        daten.letzterStand.minuten = neuerWert;
      }

      zeigeStatus(`Eintrag erfolgreich gespeichert. 🥳 Gesamt: ${daten.summe.seite || daten.summe.minuten}`, false);
      form.reset();
    } catch (error) {
      zeigeStatus('Fehler beim Senden: ' + error.message, true);
    }
  });

  function zeigeStatus(text, isError) {
    statusDiv.textContent = text;
    statusDiv.classList.toggle('error', isError);
    statusDiv.style.display = text ? 'block' : 'none';
  }

  ladeBuecherUndStände();
});
