async function loadAverage() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1697607939&single=true&output=csv';

  try {
    const response = await fetch(url);
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      skipEmptyLines: true
    });

    const data = parsed.data;
    const valueE2 = data[1][4]; // Zeile 2, Spalte E

    const averageDiv = document.getElementById('average');
    if (averageDiv) {
      averageDiv.textContent = valueE2;
    } else {
      console.warn('ID "average" nicht gefunden.');
    }

  } catch (error) {
    console.error('Fehler beim Laden oder Parsen:', error);
  }
}

window.addEventListener('load', loadAverage);
