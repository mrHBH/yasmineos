import * as THREE from "three";

let i = 0;
// setInterval(() => {
// 	//console.log(i++);
// 	i++;
// }, 10);

class UtilityWorker {
	constructor() {
		this.init();
		i=0;
	}
	init() {
		this.render();
	}

	render() {
	//	console.log("render");
		i++;
		postMessage(i);
		requestAnimationFrame(() => this.render());
		//this.render();
	}
}

onmessage = function (e) {
	console.log("Message received from main script");
	console.log(e.data);
	console.log(e);
	// //check if event name is start
	// if (e.data.name === "start") {
	// 	const worker = new UtilityWorker();
	// }
	//const utilityWorker = new UtilityWorker();
	//	timedCount();
};
// function timedCount() {
// 	i = i + 1;
// 	postMessage(i);
// 	setTimeout({ timedCount }, 500);
// 		console.log("incrementing"),

// 	)

// }

// //timedCount();
