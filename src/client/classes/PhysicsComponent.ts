import { Component, Entity } from "./entity";
import * as CANNON from "cannon-es";

class PhysicsComponent extends Component {
	body: CANNON.Body;

	constructor(params) {
		super();
		//  this.name = "PhysicsComponent";
		// this.Parent.Position
		this.mass = params.mass;
		this.material = params.material;

		const geometry = params.geometry;
		if (geometry.type == "BoxGeometry") {
			//console.log("BOX ! ! ! geometry", geometry.parameters);
			this.body = new CANNON.Body({
				mass: this.mass,
				material: this.material,
				shape: new CANNON.Box(
					new CANNON.Vec3(
						geometry.parameters.width / 2,
						geometry.parameters.height / 2,
						geometry.parameters.depth / 2
					)
				),
			//	collisionFilterGroup:  4, // The bits of the collision groups to which the body belongs.
			});
		} else if (geometry.type == "SphereGeometry") {

			this.body = new CANNON.Body({
				mass: this.mass,
				shape: new CANNON.Sphere(geometry.parameters.radius),
			//	collisionFilterGroup:  4,
				material: this.material,
			
			});

		}

		this.world = params.world;		
		this.world.addBody(this.body);
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

	_OnPosition(m: { value: THREE.Vector3 }) {
		this.body.position.set(m.value.x, m.value.y, m.value.z);
		//this.group_.position.copy(m.value);
	}

	_OnRotation(m: { value: THREE.Quaternion }) {
		this.body.quaternion.set(m.value.x, m.value.y, m.value.z, m.value.w);
	}

	Update(dt: number) {
		//console.log(this.Parent.Position);

		this.Parent.SetPosition(this.body.position);
		this.Parent.SetQuaternion(this.body.quaternion);

		
	}
	Destroy() {
		this.world.removeBody(this.body);
	}
}

export { PhysicsComponent };
