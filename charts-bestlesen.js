async function loadBestlesen() {
      const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv';

      try {
        const response = await fetch(url);
        const csvText = await response.text();

        const parsed = Papa.parse(csvText, {
          skipEmptyLines: true
        });

        const data = parsed.data;
        const seitenProTag = {};

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const datum = row[5];
          const seiten = parseInt(row[2]) || 0; // Spalte C = Seiten (Index 2)

          if (!seitenProTag[datum]) {
            seitenProTag[datum] = 0;
          }

          seitenProTag[datum] += seiten;
        }

        let besterTag = '';
        let maxSeiten = 0;

        for (const datum in seitenProTag) {
          if (seitenProTag[datum] > maxSeiten) {
            maxSeiten = seitenProTag[datum];
            besterTag = datum;
          }
        }

        const target = document.getElementById('bestlesen-summe');
        if (target) {
          // Datum von YYYY-MM-TT zu TT.MM.JJJJ umwandeln
          let displayDatum = besterTag;
          if (/^\d{4}-\d{2}-\d{2}$/.test(besterTag)) {
            const [jahr, monat, tag] = besterTag.split('-');
            displayDatum = `${tag}.${monat}.${jahr}`;
          }
          target.textContent = `${displayDatum} ${maxSeiten} Seiten`;
        } else {
          console.warn('Element mit ID "bestlesen-summe" nicht gefunden.');
        }

      } catch (error) {
        console.error('Fehler beim Laden oder Verarbeiten der Daten:', error);
        document.getElementById('bestlesen-summe').textContent = 'Fehler';
      }
    }

    window.addEventListener('load', loadBestlesen);