document.addEventListener("DOMContentLoaded", () => {
	gsap.registerPlugin(ScrollTrigger, SplitText);
	initializeSplitText_H2();

	ScrollTrigger.create({
		start: "top -100",
		end: 99999,
		toggleClass: {
			className: "is-sticky",
			targets: ".w-nav",
		},
	});
});

function initializeSplitText_H2() {
	const titles = document.querySelectorAll(".heading-style-h2");
	titles.forEach((title) => {
		const split = new SplitText(title, {
			type: "lines",
			linesClass: "split-line",
		});
		split.lines.forEach((line) => {
			const wrapper = document.createElement("div");
			wrapper.style.overflow = "hidden";
			line.parentNode.insertBefore(wrapper, line);
			wrapper.appendChild(line);
		});

		const tl = gsap.timeline({
			paused: true,
		});

		tl.from(split.lines, {
			duration: 1.5,
			yPercent: 150,
			ease: "power4.out",
			skewY: -3,
			stagger: 0.1,
			onComplete: () => split.revert(), // Clean up spans after animation
		});

		ScrollTrigger.create({
			trigger: title,
			start: "top bottom",
			end: "bottom 95%",
			animation: tl,
			toggleActions: "none play none reset",
		});
	});
}