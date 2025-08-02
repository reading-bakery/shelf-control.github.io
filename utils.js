function updateCircle(containerId, current, goal, label) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const percentage = Math.min((current / goal) * 100, 100);
    const circumference = 2 * Math.PI * 45; // 45 ist der Radius des Kreises
    const offset = circumference - (percentage / 100) * circumference;

    const svgHtml = `
        <svg viewBox="0 0 100 100" class="progress-circle">
            <defs>
                <filter id="shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.25"/>
                </filter>
            </defs>
            <circle class="progress-circle-bg" cx="50" cy="50" r="45"></circle>
            <path class="progress-circle-path" 
                  d="M 50,50 m 0,-45 a 45,45 0 1,1 0,90 a 45,45 0 1,1 0,-90"
                  stroke-dasharray="${circumference}" 
                  stroke-dashoffset="${offset}"
                  filter="url(#shadow)"></path>
            <circle class="progress-circle-end" cx="50" cy="5" r="5" transform="rotate(${360 * percentage / 100} 50 50)"></circle>
            <g class="progress-info">
                <text class="progress-percent" x="50%" y="45%" text-anchor="middle" dominant-baseline="middle">${percentage.toFixed(0)}%</text>
                <text class="progress-text" x="50%" y="60%" text-anchor="middle" dominant-baseline="middle">${current} von ${goal} ${label}</text>
            </g>
        </svg>
    `;
    container.innerHTML = svgHtml;
}