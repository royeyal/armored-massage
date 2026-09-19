// Staggered reveal for the FAQ cards on /pricing.
//
// Ported from a script that lived in that page's footer. Kept as-is in
// behaviour: one trigger on the first .card__with-border, with every card
// animating off that single entry rather than each on its own.
//
// This duplicates what content-reveal-scroll.js already does generically. It
// exists because the FAQ list carries no data-reveal-group attribute; adding
// that in the Designer would let this module be deleted outright.

function initFaqReveal() {
  const cards = document.querySelectorAll('.card__with-border');
  if (!cards.length) return;

  gsap.from(cards, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: 'power2.inOut',
    stagger: 0.15,
    scrollTrigger: {
      trigger: cards[0],
      start: 'top 75%',
      // `once` belongs to ScrollTrigger, not to the tween. In the original it
      // sat in the tween's vars, where it did nothing — the default
      // toggleActions happened to give play-once behaviour anyway. Here it is
      // in the right place, so the trigger also kills itself after firing.
      once: true,
    },
  });
}

export { initFaqReveal };
