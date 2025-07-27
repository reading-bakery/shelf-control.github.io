document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel-container');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const dots = Array.from(carousel.querySelectorAll('.carousel-dots .dot'));
    let currentIndex = 0;

    function updateSlidePosition() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    // Dot-Klicks
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentIndex = index;
        updateSlidePosition();
      });
    });

    // Swipe-Handling
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const diffX = currentX - startX;

      if (diffX > 50) {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlidePosition();
        isDragging = false;
      } else if (diffX < -50) {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlidePosition();
        isDragging = false;
      }
    });

    track.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Initial anzeigen
    updateSlidePosition();
  });
});
