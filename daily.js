const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv';

async function loadBooks() {
  const response = await fetch(sheetUrl);
  const csvText = await response.text();
  const rows = csvText.trim().split('\n').map(row => row.split(','));

  const header = rows[0];
  const data = rows.slice(1);

  const titelIndex = header.indexOf('Titel');
  const endeIndex = header.indexOf('Ende');

  const bookSelect = document.getElementById('buch');
  bookSelect.innerHTML = '<option value="">– Bitte wählen –</option>';

  data.forEach(row => {
    const titel = row[titelIndex];
    const ende = row[endeIndex];

    // Nur anzeigen, wenn "Ende" leer ist
    if (!ende || ende.trim() === '') {
      const option = document.createElement('option');
      option.value = titel;
      option.textContent = titel;
      bookSelect.appendChild(option);
    }
  });
}

document.addEventListener('DOMContentLoaded', loadBooks);
