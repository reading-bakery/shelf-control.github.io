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

  const buchDaten = {};

  async function ladeBuecherUndStände() {
    try {
      const [buchCsv, dailyCsv] = await Promise.all([
        fetch(`https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?gid=${gidBuecher}&single=true&output=csv`).then(res => res.text()),
        fetch(`https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?gid=${gidDaily}&single=true&output=csv`).then(res => res.text()),
      ]);

      const letzteStände = berechneLetzterStand(dailyCsv);
      parseBuchCsv(buchCsv, letzteStände);
    } catch (error) {
      zeigeStatus('Fehler beim Laden: ' + error.message, true);
    }
  }

  function berechneLetzterStand(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const idxBuch = headers.indexOf('Buch');
    const idxSeite = headers.indexOf('Seiten');
    const idxMinuten = headers.indexOf('Minuten');

    const letzterStand = {};

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      const buch = row[idxBuch]?.trim();
      const seite = parseInt(row[idxSeite]?.trim(), 10);
      const minuten = parseInt(row[idxMinuten]?.trim(), 10);

      if (buch) {
        if (!letzterStand[buch]) letzterStand[buch] = { seite: 0, minuten: 0 };
        if (!isNaN(seite) && seite > letzterStand[buch].seite) letzterStand[buch].seite = seite;
        if (!isNaN(minuten) && minuten > letzterStand[buch].minuten) letzterStand[buch].minuten = minuten;
      }
    }
    return letzterStand;
  }

  function parseBuchCsv(csv, letzterStand) {
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
        buchDaten[titel] = {
          format: format,
          maxSeiten: isNaN(maxSeiten) ? Infinity : maxSeiten,
          maxMinuten: isNaN(maxMinuten) ? Infinity : maxMinuten,
          letzterStand: letzterStand[titel] || { seite: 0, minuten: 0 }
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

    // Datum hinzufügen
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

    // Summe aller bisherigen Einträge berechnen
    const dailyCsv = await fetch(`https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?gid=${gidDaily}&single=true&output=csv`).then(res => res.text());
    const lines = dailyCsv.trim().split('\n');
    const headers = lines[0].split(',');
    const idxBuch = headers.indexOf('Buch');
    const idxSeiten = headers.indexOf('Seiten');
    const idxMinuten = headers.indexOf('Minuten');

    let sumSeiten = 0;
    let sumMinuten = 0;
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row[idxBuch]?.trim() === titel) {
            const s = parseInt(row[idxSeiten]?.trim(), 10);
            const m = parseInt(row[idxMinuten]?.trim(), 10);
            if (!isNaN(s)) sumSeiten += s;
            if (!isNaN(m)) sumMinuten += m;
        }
    }

    let differenz;
    if (['Softcover', 'Hardcover', 'eBook'].includes(daten.format)) {
        differenz = neuerWert - sumSeiten;
    } else {
        differenz = neuerWert - sumMinuten;
    }

    // Heutiges Datum im Format YYYY-MM-DD
    const heute = new Date();
    const datumString = heute.toISOString().split('T')[0];

    try {
        await sendeEintrag(titel, differenz, datumString);
        await sendeLetzterStand(titel, neuerWert);

        buchDaten[titel].letzterStand = {
            seite: ['Softcover', 'Hardcover', 'eBook'].includes(daten.format) ? neuerWert : daten.letzterStand.seite,
            minuten: daten.format === 'Hörbuch' ? neuerWert : daten.letzterStand.minuten
        };

        zeigeStatus('Eintrag erfolgreich gespeichert. 😍', false);
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
