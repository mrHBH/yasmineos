import { Object3D } from "three";
import { Component } from "./entity";

class ColliderComponent extends Component {
	object_: Object3D;
	constructor() {
		super();
	}
	InitEntity() {
		//     this.initialize()
		//console.log("ColliderComponent InitComponent");
		//console.log(this.Parent);
		this.Parent._mesh.userData.parent = this.Parent;
	}
	// initialize() {
	//     this.object_=  this.GetComponent("CharacterControllerComponent").target_;

	//     ;

	// }
	// Update(timeElapsed) {
	//     //console.log(this.object_)
	// }

	InitComponent() {
		// setInterval(() => {
		// 	this.Broadcast({
		// 		topic: "network.update",
		// 		transform: "d.transform",
		// 	});
		// }, 1200);
	}
}
export { ColliderComponent };
