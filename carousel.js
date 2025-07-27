document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  let currentIndex = 0;

  // Keine left-Positionen setzen, Flexbox regelt die Position

  // Beispiel: Automatisch Slide wechseln
  setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }, 3000);
});
