document.querySelectorAll('.carousel').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  
  // Suche die Dots (vorausgesetzt .carousel-dots ist ein Geschwister-Element vor dem Carousel)
  const dotsContainer = carousel.previousElementSibling;
  const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

  let currentIndex = 0;
  let startX = 0;
  let isDragging = false;
  let deltaX = 0;

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;

    track.style.transition = 'transform 0.5s ease';
    track.style.transform = `translateX(-${index * 100}%)`;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      if (dots[i]) dots[i].classList.toggle('active', i === index);
    });

    currentIndex = index;
  }

  // Klick auf Dots wechselt Slide
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  // Swipe nur auf kleinen Bildschirmen aktivieren
  if (window.innerWidth <= 740) {
    carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      track.style.transition = 'none'; // Übergang aus, damit das mitgezogen wird
    });

    carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      deltaX = currentX - startX;
      track.style.transform = `translateX(calc(-${currentIndex * 100}% + ${deltaX}px))`;
    });

    carousel.addEventListener('touchend', (e) => {
      isDragging = false;
      track.style.transition = 'transform 0.5s ease';
      if (deltaX > 50) {
        goToSlide(currentIndex - 1); // Swipe nach rechts -> vorheriger Slide
      } else if (deltaX < -50) {
        goToSlide(currentIndex + 1); // Swipe nach links -> nächster Slide
      } else {
        goToSlide(currentIndex); // Swipe zu kurz -> bleib beim aktuellen Slide
      }
      deltaX = 0;
    });
  }

  // Initial
  goToSlide(0);
});
