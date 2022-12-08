import { Component, Entity } from "./entity";
import * as CANNON from "cannon-es";
import * as THREE from "three";

class PhysicsComponentForCharacters extends Component {
	body: CANNON.Body;

	constructor(params) {
		super();
		//  this.name = "PhysicsComponent";
		// this.Parent.Position
		this.mass = params.mass;
		this.input= params.input;


	
		const colliderShape = new CANNON.Sphere(0.15);
		this.body = new CANNON.Body({ mass:180.1 });
		this.body.addShape(colliderShape, new CANNON.Vec3(0, 0.10, 0));

		//this.body.addShape(colliderShape, new CANNON.Vec3(0, 2, 0));

		//this.body.addShape(colliderShape, new CANNON.Vec3(0, -0.5, 0));

	
		this.body.position.set(0, 10, 0);
		this.body.linearDamping = 0.9;
		this.body.angularFactor.set(0, 1, 0); // prevents rotation X,Z axis
		this.body.fixedRotation = true;

		//this.body.position.set(this.Parent.Position.x, this.Parent.Position.y + 1, this.Parent.Position.z);



		//verify if the geometry is a box or a sphere

		// this.body = new CANNON.Body({
		// 	mass: 0.1,
		// 	shape: new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5)),
		// 	//	material: params.material,
		// });
		this.world = params.world;
		// //
		// this.body.position.set(
		// 	this.Parent.Position.x,
		// 	this.Parent.Position.y,
		// 	this.Parent.Position.z
		// );
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
		const vec = new THREE.Vector3(this.Parent.Position.x, this.body.position.y,this.body.position.z);
		this.Parent.SetPosition(vec);
		this.body.quaternion.setFromVectors( new CANNON.Vec3(0,0,1), new CANNON.Vec3(0,0,1));
		//this.Parent.SetQuaternion(this.body.quaternion);
		//this.body.angularFactor.set(0, 1, 0);

		//if space is released
		//if (this.input.keyDown(this.input.KeyboardKeys.space)) {
			if (this.input.pressed("space")  ) {
			this.body.velocity.y = 5;
			this.body.applyImpulse(new CANNON.Vec3(0, 1, 0), new CANNON.Vec3(0, 0, 0));
		}
		if (this.input.keyDown(this.input.KeyboardKeys.z)) {
			this.body.velocity.z = 5;
			this.body.applyImpulse(new CANNON.Vec3(0, 0, 1), new CANNON.Vec3(0, 0, 0));
		}

		if (this.input.keyDown(this.input.KeyboardKeys.q)) {
			this.body.velocity.x = 5;
			this.body.applyImpulse(new CANNON.Vec3(1, 0, 0), new CANNON.Vec3(0, 0, 0));
		}
		//if (this.input.keyDown(this.input.KeyboardKeys.w)) {



		// this.body.addEventListener("collide", function (e: any) {
		// //	console.log("collided");
		// //	console.log(e);
		// });

		//check if the body is colliding with the ground

		//check collision with ground body

		// if (this.body.position.y < 10.1) {
		// 	//apply a force up
		// 	 this.body.applyForce(new CANNON.Vec3(0, 80, 0), new CANNON.Vec3(0, 0, 0));
		// }
	}
	Destroy() {
		this.world.removeBody(this.body);
	}
}

export { PhysicsComponentForCharacters };
