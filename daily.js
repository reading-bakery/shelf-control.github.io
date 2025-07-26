document.addEventListener('DOMContentLoaded', () => {
  const spreadsheetId = '2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck';
  const gidBuecher = '1702643479';
  const gidDaily = '1783910348';

  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe58QnLhT5Kujn2Wv-nF5uJqUM6JWQJ7NxDJT-iRNJiwXOEzg/formResponse';
  const formUrlLetzterStand = 'https://docs.google.com/forms/d/e/1FAIpQLSeIzO8sX1GrQIBuBK8tclYRrrRcgqlukN4haElwdSXMOrIZ2Q/formResponse';


  const feldIdBuch = 'entry.1952704878';
  const feldIdBisSeite = 'entry.1828547420';
  const feldIdBuchLetzterStand = 'entry.1217511174';  // Titel für „Neues Buch hinzufügen“
  const feldIdNeuerStand = 'entry.1273432895';        // Letzter Stand

  const selectBuch = document.getElementById('buch');
  const inputBisSeite = document.getElementById('bisSeite');
  const form = document.getElementById('trackerForm');
  const statusDiv = document.getElementById('status');


  const buchDaten = {};

  async function ladeBuecherUndStände() {
    try {
      const [buchCsv, dailyCsv] = await Promise.all([
        fetch(`https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv`).then(res => res.text()),
        fetch(`https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv`).then(res => res.text()),
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
    const idxBuch = headers.findIndex(h => h === 'Buch');
    const idxSeite = headers.findIndex(h => h === 'Seiten');

    const letzterStand = {};

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      const buch = row[idxBuch]?.trim();
      const seite = parseInt(row[idxSeite]?.trim(), 10);
      if (buch && !isNaN(seite)) {
        if (!letzterStand[buch] || seite > letzterStand[buch]) {
          letzterStand[buch] = seite;
        }
      }
    }
    return letzterStand;
  }

  function parseBuchCsv(csv, letzterStand) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');

    const idxTitel = headers.findIndex(h => h === 'Titel');
    const idxSeiten = headers.findIndex(h => h === 'Seitenzahl total');
    const idxEnde = headers.findIndex(h => h === 'Ende');
    const idxLetzterStand = headers.findIndex(h => h === 'Letzter Stand');


    selectBuch.innerHTML = '<option value="">Bitte wählen</option>';

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      const titel = row[idxTitel]?.trim();
      const maxSeiten = parseInt(row[idxSeiten]?.trim(), 10);
      const beendet = row[idxEnde]?.trim();

      if (titel && beendet === '') {
        buchDaten[titel] = {
          maxSeiten: isNaN(maxSeiten) ? Infinity : maxSeiten,
          letzterStand: letzterStand[titel] || 0
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
    if (!titel) {
      zeigeStatus('Bitte ein Buch auswählen.', true);
      return false;
    }
    const daten = buchDaten[titel];
    const neuerStand = parseInt(inputBisSeite.value, 10);

    if (isNaN(neuerStand) || neuerStand < 1) {
      zeigeStatus('Bitte gültige Seitenzahl eingeben. 😵', true);
      return false;
    }
    if (neuerStand > daten.maxSeiten) {
      zeigeStatus(`Maximale Seitenzahl überschritten (${daten.maxSeiten}). 😭`, true);
      return false;
    }
    if (neuerStand <= daten.letzterStand) {
      zeigeStatus(`Der neue Stand muss über dem bisherigen liegen (${daten.letzterStand}). 😬`, true);
      return false;
    }
    return true;
  }

  async function sendeAnDaily(titel, seitenDifferenz) {
    const formData = new URLSearchParams();
    formData.append(feldIdBuch, titel);
    formData.append(feldIdBisSeite, seitenDifferenz);

    await fetch(formUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
  }

  async function sendeLetzterStand(titel, neuerStand) {
    const formData = new URLSearchParams();
    formData.append(feldIdBuchLetzterStand, titel);
    formData.append(feldIdNeuerStand, neuerStand);

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
    const neuerStand = parseInt(inputBisSeite.value, 10);
    const letzterStand = buchDaten[titel].letzterStand;

    const differenz = neuerStand - letzterStand;

    try {
      await sendeAnDaily(titel, differenz);
      await sendeLetzterStand(titel, neuerStand);
      buchDaten[titel].letzterStand = neuerStand; // Lokaler Stand aktualisieren
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
