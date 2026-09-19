// Scroll-triggered reveal for headings, driven by GSAP SplitText.
//
// Two treatments share one pass:
//   .heading-style-h1 — split into words, each rotating and fading up
//   .heading-style-h2 — split into lines, each wiped up out of a clipping
//                       wrapper with a slight skew
//
// The wrappers only exist for h2 because the lines need something with
// `overflow: hidden` to slide out of; words inherit that from the .word rule
// in styles/split-text.css.

function animateSplitTextHeadings(selectors) {
  const elements = document.querySelectorAll(selectors.join(','));

  elements.forEach((el) => {
    const isH1 = el.classList.contains('heading-style-h1');
    const splitType = isH1 ? 'words' : 'lines';
    const split = new SplitText(el, { type: splitType });

    const targets = isH1 ? split.words : split.lines;

    if (!isH1) {
      split.lines.forEach((line) => {
        const wrapper = document.createElement('div');
        wrapper.style.overflow = 'hidden';
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });
    }

    const animation = gsap.from(targets, {
      duration: isH1 ? 1.2 : 1.5,
      yPercent: isH1 ? 100 : 150,
      skewY: isH1 ? 0 : -3,
      rotationZ: isH1 ? 10 : 0,
      opacity: isH1 ? 0 : 1,
      stagger: 0.1,
      ease: 'power4.out',
      paused: true,
      // Putting the text back as real text nodes matters for selection,
      // find-in-page and screen readers, which all deal badly with a heading
      // shattered into per-word spans.
      onComplete: () => split.revert(),
    });

    ScrollTrigger.create({
      trigger: el,
      start: isH1 ? 'top 100%' : 'top bottom',
      end: isH1 ? null : 'bottom 95%',
      animation: animation,
      toggleActions: isH1 ? 'play none none reverse' : 'none play none reset',
    });
  });
}

function initSplitTextHeadings() {
  animateSplitTextHeadings(['.heading-style-h1', '.heading-style-h2']);
}

export { initSplitTextHeadings, animateSplitTextHeadings };
