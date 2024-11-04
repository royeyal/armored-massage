document.addEventListener("DOMContentLoaded", () => {
	gsap.registerPlugin(ScrollTrigger, SplitText);
	initializeSplitText_H1();
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
			//linesClass: "split-line",
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

function initializeSplitText_H1() {
	// Split the text into lines or words
	const headings = document.querySelectorAll(".heading-style-h1");
	headings.forEach((heading) => {
		const splitText = new SplitText(heading, { type: "words" }); // or "words" or "chars"
		gsap.from(splitText.words, {
			scrollTrigger: {
				trigger: heading,
				start: "top 100%", // Start the animation when 80% of viewport height reaches the heading
				toggleActions: "play none none reverse",
			},
			duration: 1.2,
			rotationZ: "10",
			yPercent: 100, // Slide up from below
			opacity: 0, // Fade in effect
			stagger: 0.1, // Add a stagger effect
			ease: "power4.out", // Customize easing as needed
			onComplete: () => splitText.revert(), // Clean up spans after animation
		});
	});
}
