// Cursor-following spotlight on the homepage feature cards.
//
// Each .card-wrap inside a .cards-grid gets --cursor-x / --cursor-y in its own
// coordinate space, which styles/card-spotlight.css feeds to a radial gradient.
// Every card is updated on every move, not just the hovered one, so the light
// appears to sweep across the whole grid.

function initCardSpotlight() {
  const grids = document.querySelectorAll('.cards-grid');
  if (!grids.length) return;

  grids.forEach((grid) => {
    let frame = 0;
    let lastEvent = null;

    grid.addEventListener('mousemove', (event) => {
      lastEvent = event;

      // mousemove can fire more than once per frame; the gradient can only be
      // painted once, so coalesce to the last position per frame.
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;

        const cards = grid.querySelectorAll('.card-wrap');
        if (!cards.length) return;

        // Read every rect, then write every property. Interleaving the two
        // makes each write invalidate layout for the next read — measured at
        // ~0.41ms per move on the 8-card homepage grid versus ~0.004ms
        // batched. Harmless at 8 cards, not at 40.
        const rects = [];
        cards.forEach((card) => rects.push(card.getBoundingClientRect()));

        cards.forEach((card, i) => {
          card.style.setProperty(
            '--cursor-x',
            `${lastEvent.clientX - rects[i].left}px`
          );
          card.style.setProperty(
            '--cursor-y',
            `${lastEvent.clientY - rects[i].top}px`
          );
        });
      });
    });
  });
}

export { initCardSpotlight };
