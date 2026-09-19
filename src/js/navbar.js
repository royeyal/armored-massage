// Sticky navbar — adds .is-sticky to .w-nav once the page has scrolled past
// 100px. Styling lives in styles/navbar.css.

function initNavbarScroll() {
  const nav = document.querySelector('.w-nav');
  if (!nav) return;

  ScrollTrigger.create({
    // A plain number is a scroll position in px. There is no trigger element
    // here, so the element-relative form ("top -100") would resolve to this
    // same 100 while reading as though it measured something.
    start: 100,
    // Far past any real page height, so the class stays on for the whole
    // scroll rather than toggling off at the bottom of the document.
    end: 99999,
    toggleClass: {
      className: 'is-sticky',
      // The element itself, not the selector: a selector would re-query and
      // could class more elements than the guard above actually checked.
      targets: nav,
    },
  });
}

export { initNavbarScroll };
