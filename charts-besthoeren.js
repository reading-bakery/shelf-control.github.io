async function loadBesthoeren() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv';

  try {
    const response = await fetch(url);
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      skipEmptyLines: true
    });

    const data = parsed.data;
    const minutenProTag = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const datum = row[0];
      const minuten = parseInt(row[3]) || 0; // Spalte D = Minuten (Index 3)

      if (!minutenProTag[datum]) {
        minutenProTag[datum] = 0;
      }

      minutenProTag[datum] += minuten;
    }

    let besterTag = '';
    let maxMinuten = 0;

    for (const datum in minutenProTag) {
      if (minutenProTag[datum] > maxMinuten) {
        maxMinuten = minutenProTag[datum];
        besterTag = datum;
      }
    }

    const target = document.getElementById('besthoeren-summe');
    if (target) {
      target.textContent = `${besterTag} ${maxMinuten} Min.`;
    } else {
      console.warn('Element mit ID "besthoeren-summe" nicht gefunden.');
    }

  } catch (error) {
    console.error('Fehler beim Laden oder Verarbeiten der Daten:', error);
    document.getElementById('besthoeren-summe').textContent = 'Fehler';
  }
}

window.addEventListener('load', loadBesthoeren);
