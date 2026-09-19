// Elements reveal on scroll.
//
// Opt in from Webflow with attributes, no per-section JS:
//   [data-reveal-group]         container whose direct children animate in
//   [data-reveal-group-nested]  a second level, staggered inside its slot
//   data-stagger="120"          ms between siblings (default 100)
//   data-distance="2em"         travel distance (default 2em)
//   data-start="top 80%"        ScrollTrigger start (default top 80%)
//   data-ignore="false"         also animate the nested group's parent
//
// A "slot" is one beat of the parent timeline: either a single child, or a
// nested group whose own children then stagger within that beat. That is what
// keeps a card grid inside a section from restarting the stagger from zero.

function initContentRevealScroll() {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const ctx = gsap.context(() => {
    document.querySelectorAll('[data-reveal-group]').forEach((groupEl) => {
      const groupStaggerSec =
        (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000;
      const groupDistance = groupEl.getAttribute('data-distance') || '2em';
      const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';

      const animDuration = 0.8;
      const animEase = 'power4.inOut';

      // Reduced motion: show everything immediately, animate nothing.
      if (prefersReduced) {
        gsap.set(groupEl, {
          clearProps: 'transform,opacity,visibility',
          y: 0,
          autoAlpha: 1,
        });
        return;
      }

      const directChildren = Array.from(groupEl.children).filter(
        (el) => el.nodeType === 1
      );

      // No children to stagger — animate the group itself.
      if (!directChildren.length) {
        gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: groupEl,
          start: triggerStart,
          once: true,
          onEnter: () =>
            gsap.to(groupEl, {
              y: 0,
              autoAlpha: 1,
              duration: animDuration,
              ease: animEase,
              onComplete: () =>
                gsap.set(groupEl, {
                  clearProps: 'transform,opacity,visibility',
                }),
            }),
        });
        return;
      }

      const slots = [];
      directChildren.forEach((child) => {
        const nestedGroup = child.matches('[data-reveal-group-nested]')
          ? child
          : child.querySelector(':scope [data-reveal-group-nested]');

        if (nestedGroup) {
          const includeParent =
            child.getAttribute('data-ignore') === 'false' ||
            nestedGroup.getAttribute('data-ignore') === 'false';
          slots.push({
            type: 'nested',
            parentEl: child,
            nestedEl: nestedGroup,
            includeParent,
          });
        } else {
          slots.push({ type: 'item', el: child });
        }
      });

      // Hidden starting state.
      slots.forEach((slot) => {
        if (slot.type === 'item') {
          // A child that is itself a nested group still travels the group's
          // distance — its own data-distance governs its children, not itself.
          const isNestedSelf = slot.el.matches('[data-reveal-group-nested]');
          const d = isNestedSelf
            ? groupDistance
            : slot.el.getAttribute('data-distance') || groupDistance;
          gsap.set(slot.el, { y: d, autoAlpha: 0 });
        } else {
          if (slot.includeParent) {
            gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
          }
          const nestedD =
            slot.nestedEl.getAttribute('data-distance') || groupDistance;
          Array.from(slot.nestedEl.children).forEach((target) =>
            gsap.set(target, { y: nestedD, autoAlpha: 0 })
          );
        }
      });

      ScrollTrigger.create({
        trigger: groupEl,
        start: triggerStart,
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();

          slots.forEach((slot, slotIndex) => {
            const slotTime = slotIndex * groupStaggerSec;

            if (slot.type === 'item') {
              tl.to(
                slot.el,
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  // Only the props this module set — clearProps:'all' would
                  // also wipe transforms Webflow's own interactions applied.
                  onComplete: () =>
                    gsap.set(slot.el, {
                      clearProps: 'transform,opacity,visibility',
                    }),
                },
                slotTime
              );
            } else {
              if (slot.includeParent) {
                tl.to(
                  slot.parentEl,
                  {
                    y: 0,
                    autoAlpha: 1,
                    duration: animDuration,
                    ease: animEase,
                    onComplete: () =>
                      gsap.set(slot.parentEl, {
                        clearProps: 'transform,opacity,visibility',
                      }),
                  },
                  slotTime
                );
              }

              const nestedMs = parseFloat(
                slot.nestedEl.getAttribute('data-stagger')
              );
              const nestedStaggerSec = isNaN(nestedMs)
                ? groupStaggerSec
                : nestedMs / 1000;

              Array.from(slot.nestedEl.children).forEach(
                (nestedChild, nestedIndex) => {
                  tl.to(
                    nestedChild,
                    {
                      y: 0,
                      autoAlpha: 1,
                      duration: animDuration,
                      ease: animEase,
                      onComplete: () =>
                        gsap.set(nestedChild, {
                          clearProps: 'transform,opacity,visibility',
                        }),
                    },
                    slotTime + nestedIndex * nestedStaggerSec
                  );
                }
              );
            }
          });
        },
      });
    });
  });

  return () => ctx.revert();
}

export { initContentRevealScroll };
