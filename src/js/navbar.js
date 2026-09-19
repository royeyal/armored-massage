// Sticky navbar — adds .is-sticky to .w-nav once the page has scrolled past
// 100px. Styling lives in styles/navbar.css.

function initNavbarScroll() {
  const nav = document.querySelector('.w-nav');
  if (!nav) return;

  ScrollTrigger.create({
    start: 'top -100',
    // Far past any real page height, so the class stays on for the whole
    // scroll rather than toggling off at the bottom of the document.
    end: 99999,
    toggleClass: {
      className: 'is-sticky',
      targets: '.w-nav',
    },
  });
}

export { initNavbarScroll };
