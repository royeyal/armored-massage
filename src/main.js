import './main.css';

import { initNavbarScroll } from './js/navbar.js';
import { initSplitTextHeadings } from './js/split-text-headings.js';
import { initContentRevealScroll } from './js/content-reveal-scroll.js';
import { initCardSpotlight } from './js/card-spotlight.js';
import { initFaqReveal } from './js/faq-reveal.js';

// GSAP, ScrollTrigger and SplitText are globals from Webflow's own script
// tags — see docs/webflow-custom-code.md. If Webflow's GSAP setting is ever
// turned off, every module here goes silent rather than throwing a confusing
// error deep inside an animation, so say so once and stop.
function hasGsap() {
  if (typeof gsap === 'undefined') {
    console.error(
      '[armored-massage] GSAP is not loaded — Webflow custom code skipped.'
    );
    return false;
  }
  return true;
}

function init() {
  // No GSAP dependency, so it runs even if the check below bails.
  initCardSpotlight();

  if (!hasGsap()) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);

  initNavbarScroll();
  initSplitTextHeadings();
  initContentRevealScroll();
  initFaqReveal();
}

// Waiting on document.fonts as well as DOM: SplitText measures line boxes, and
// splitting before the webfont swaps in produces lines broken at the fallback
// font's metrics, which then visibly reflow.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.fonts.ready.then(init);
  });
} else {
  document.fonts.ready.then(init);
}

export { init };
