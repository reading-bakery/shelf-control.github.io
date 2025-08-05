const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=282362445&single=true&output=csv";

function parseCSV(text) {
    const [headerLine, ...lines] = text.trim().split("\n");
    const headers = headerLine.split("\t");
    return lines.map(line => {
        const values = line.split("\t");
        return Object.fromEntries(headers.map((h, i) => [h.trim(), values[i]?.trim()]));
    });
}

function getValidNumber(value) {
    return parseInt(value.replace(/\D/g, ""), 10);
}

function createBookCard(book, label) {
    const container = document.createElement("div");
    const img = document.createElement("img");
    img.src = book["Cover"];
    img.alt = book["Titel"];
    img.style.maxHeight = "200px";
    img.style.borderRadius = "8px";
    img.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";

    const title = document.createElement("p");
    title.textContent = `${label}: ${book["Titel"]} (${book["Seitenzahl total"]} Seiten)`;
    title.style.marginTop = "10px";
    title.style.fontWeight = "bold";

    container.appendChild(img);
    container.appendChild(title);
    return container;
}

fetch(sheetURL)
    .then(response => response.text())
    .then(csvText => {
        const data = parseCSV(csvText).filter(row =>
            row["Seitenzahl total"] && !isNaN(getValidNumber(row["Seitenzahl total"]))
        );

        const sorted = [...data].sort((a, b) =>
            getValidNumber(a["Seitenzahl total"]) - getValidNumber(b["Seitenzahl total"])
        );

        const shortest = sorted[0];
        const longest = sorted[sorted.length - 1];

        document.getElementById("shortestBook").appendChild(createBookCard(shortest, "Kürzestes Buch"));
        document.getElementById("longestBook").appendChild(createBookCard(longest, "Längstes Buch"));
    })
    .catch(err => {
        console.error("Fehler beim Laden der Daten:", err);
    });
