(() => {

  'use strict';

  const TOTAL = 17;

  const ROOT = '/captain-gallery/';

  const images = Array.from(
    {length: TOTAL},
    (_, index) =>
      ROOT + 'captain-' +
      String(index + 1).padStart(2,'0') +
      '.webp'
  );

  let current = 0;

  const lightbox = document.getElementById('xagLightbox');
  const viewer = document.getElementById('xagViewer');
  const closeButton = document.getElementById('xagClose');
  const previousButton = document.getElementById('xagPrev');
  const nextButton = document.getElementById('xagNext');

  if (!lightbox || !viewer) return;

  function show(index) {

    current =
      ((index % TOTAL) + TOTAL) % TOTAL;

    viewer.src = images[current];

    viewer.alt =
      'X-AYAYI Captain Galerie Bild ' +
      (current + 1);

    lightbox.hidden = false;

    document.body.style.overflow = 'hidden';
  }

  function close() {

    lightbox.hidden = true;

    document.body.style.overflow = '';
  }

  document
    .querySelectorAll('[data-xag-open]')
    .forEach(button => {

      button.addEventListener('click', () => {

        const index =
          Number(button.dataset.xagOpen || 1) - 1;

        show(index);

      });

    });

  closeButton.addEventListener(
    'click',
    close
  );

  previousButton.addEventListener(
    'click',
    () => show(current - 1)
  );

  nextButton.addEventListener(
    'click',
    () => show(current + 1)
  );

  lightbox.addEventListener(
    'click',
    event => {

      if (event.target === lightbox) {
        close();
      }

    }
  );

  document.addEventListener(
    'keydown',
    event => {

      if (lightbox.hidden) return;

      if (event.key === 'Escape') {
        close();
      }

      if (event.key === 'ArrowLeft') {
        show(current - 1);
      }

      if (event.key === 'ArrowRight') {
        show(current + 1);
      }

    }
  );

  let touchStartX = 0;

  lightbox.addEventListener(
    'touchstart',
    event => {

      touchStartX =
        event.touches[0].clientX;

    },
    {passive:true}
  );

  lightbox.addEventListener(
    'touchend',
    event => {

      const touchEndX =
        event.changedTouches[0].clientX;

      const difference =
        touchEndX - touchStartX;

      if (Math.abs(difference) < 50) {
        return;
      }

      if (difference < 0) {
        show(current + 1);
      } else {
        show(current - 1);
      }

    },
    {passive:true}
  );

})();
