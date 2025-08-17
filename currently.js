// currently.js
document.addEventListener("DOMContentLoaded", () => {
    const booksCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1702643479&single=true&output=csv";
    const dailyCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXx02YVtknMhVpTr2xZL6jVSdCZs4WN4xN98xmeG19i47mqGn3Qlt8vmqsJ_KG76_TNsO0yX0FBEck/pub?gid=1783910348&single=true&output=csv";

    // CSVs laden
    Promise.all([
        fetch(booksCsvUrl).then(res => res.text()),
        fetch(dailyCsvUrl).then(res => res.text())
    ]).then(([booksText, dailyText]) => {
        const books = Papa.parse(booksText, { header: true }).data;
        const daily = Papa.parse(dailyText, { header: true }).data;

        const container = document.getElementById("currently");
        container.innerHTML = "";

        books.forEach(book => {
            const start = book["Start"];
            const end = book["Ende"];
            if (start && !end) {
                const cover = book["Cover"];
                const totalPages = parseInt(book["Seitenzahl total"]) || 0;
                const totalMinutes = parseInt(book["Minuten total"]) || 0;
                const format = book["Format"];
                const title = book["Titel"] || book["Buch"] || "";

                // Fortschritt berechnen
                let progress = 0;
                daily.forEach(entry => {
                    if (entry["Buch"] === title) {
                        if (format === "Hörbuch") {
                            progress += parseInt(entry["Minuten"]) || 0;
                        } else {
                            progress += parseInt(entry["Seiten"]) || 0;
                        }
                    }
                });

                const total = format === "Hörbuch" ? totalMinutes : totalPages;
                const percentage = total ? Math.min((progress / total) * 100, 100) : 0;

                // HTML erstellen
                const bookDiv = document.createElement("div");
                bookDiv.classList.add("currently-book");
                bookDiv.innerHTML = `
                    <img src="${cover}" alt="" class="currently-cover">
                    <div class="currently-info">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${percentage}%;"></div>
                        </div>
                        <p>${progress} / ${total} ${format === "Hörbuch" ? "Minuten" : "Seiten"} <br> (${percentage.toFixed(0)}%)</p>
                    </div>
                `;
                container.appendChild(bookDiv);
            }
        });
    });
});