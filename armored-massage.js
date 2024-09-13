let new_titleRegister = document.getElementById("titleRegister");
const arrayPlans = [
	"Bronze",
	"Iron",
	"Steel",
];

document
	.getElementById("button-01")
	.addEventListener("click", function () {
		var select = document.getElementById("select-plan");
		select.value = "Bronze"; // Change the selected option to value 2
		select.dispatchEvent(new Event("change")); // Trigger the change event
		new_titleRegister.innerHTML = arrayPlans[0];
	});

document
	.getElementById("button-02")
	.addEventListener("click", function () {
		var select = document.getElementById("select-plan");
		select.value = "Iron"; // Change the selected option to value 2
		select.dispatchEvent(new Event("change")); // Trigger the change event
		new_titleRegister.innerHTML = arrayPlans[1];
	});

document
	.getElementById("button-03")
	.addEventListener("click", function () {
		var select = document.getElementById("select-plan");
		select.value = "Steel"; // Change the selected option to value 2
		select.dispatchEvent(new Event("change")); // Trigger the change event
		new_titleRegister.innerHTML = arrayPlans[2];
	});
