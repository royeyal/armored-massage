document.addEventListener("DOMContentLoaded", () => {
	gsap.registerPlugin(ScrollTrigger, SplitText);
	initializeSplitText_H2();
	initializeSplitText_H1();

	ScrollTrigger.create({
		start: "top -100",
		end: 99999,
		toggleClass: {
			className: "is-sticky",
			targets: ".w-nav",
		},
	});
});

function initializeSplitText_H1() {
	const h1_titles = document.querySelectorAll(".heading-style-h1");
	h1_titles.forEach((h1_title) => {
		const split = new SplitText(h1_title, {
			type: "words,lines",
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
			yPercent: 100,
			stagger: 0.05,
			opacity: 0,
			blur: 10,
			skewY: -3,
			ease: "power3.out",
			onComplete: () => split.revert(), // Clean up spans after animation
		});

		ScrollTrigger.create({
			trigger: h1_title,
			start: "top bottom",
			end: "top bottom",
			animation: tl,
			toggleActions: "none play none reset",
			//markers: true,
		});
	});
}

function initializeSplitText_H2() {
	const h2_titles = document.querySelectorAll(".heading-style-h2");
	h2_titles.forEach((h2_title) => {
		const split = new SplitText(h2_title, {
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
			trigger: h2_title,
			start: "top bottom",
			end: "bottom 95%",
			animation: tl,
			toggleActions: "none play none reset",
		});
	});
}