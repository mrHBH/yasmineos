import * as THREE from "three";

import { Component } from "./entity";

class RenderComponent extends Component {
	group_: THREE.Group;
	params_: any;
	constructor(params: { model: THREE.Mesh ; scene: THREE.Scene; }) {
		super();
		this.group_ = new THREE.Group();
		this.params_ = params;
	}

	Destroy() {
		//   this.group_.traverse(c   => {
		//     if (c.material) {
		//       c.material.dispose();
		//     }
		//     if (c.geometry) {
		//       c.geometry.dispose();
		//     }
		//   });
		this.params_.scene.remove(this.group_);
	}

	InitEntity() {
		this._Init();
	}

	_Init() {
		if (this.params_.model) {
			this.group_.add(this.params_.model);
			this.parent_._mesh = this.params_.model;
		}
		this.params_.scene.add(this.group_);
	}

	InitComponent() {
		this._RegisterHandler("update.position", (m: any) => {
			this._OnPosition(m);
		});
		this._RegisterHandler("update.rotation", (m: any) => {
			this._OnRotation(m);
		});

		this._RegisterHandler("network.update", (m) => this._log(m));
	}

	_log(m) {
		console.log("hello From RenderComponent");
		console.log(m);
	}
	

	_OnPosition(m: { value: THREE.Vector3; }) {
		this.group_.position.copy(m.value);
	}

	_OnRotation(m: { value: THREE.Quaternion; }) {
		this.group_.quaternion.copy(m.value);
	}

	// Update(timeInSeconds) {}
}

export { RenderComponent };
