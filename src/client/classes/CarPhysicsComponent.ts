import { Component, Entity } from "./entity";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import CannonUtils from "../utils/cannonUtils";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";

class CarPhysicsComponent extends Component {
	body: CANNON.Body;
	vehicle: CANNON.RaycastVehicle;
	steeringTween: any;
	input: CarInputComponent;
	maxForce = 100000;
	maxSteerVal =0.1;
	steerStep = 0.025;
	maxBreakForce = 2045;
	constructor(params) {
		super();
		
		//  this.name = "PhysicsComponent";
		// this.Parent.Position

		this.mass = params.mass;
		//this.input = params.input;
		
		this.scene = params.scene;
		this.steeringValue = 0;
		this.physicsManager = params.physicsManager;
		this.world = this.physicsManager.world;
		//wheel meshes
		this.wheelMeshes = params.wheelMeshes;
		this.wheelMaterial = this.physicsManager.wheelMaterial;
		this.group_ = new THREE.Group();

		this.maxForce = 1000;
		this.maxSteerVal = 0.4;
		

		this.CreateCar(params);


		// this.slipperyMaterial = new CANNON.Material("slipperyMaterial");
		// this.slippery_ground_cm = new CANNON.ContactMaterial(
		// 	this.groundMaterial,
		// 	this.slipperyMaterial,
		// 	{
		// 		friction: 0,
		// 		restitution: 0.3,
		// 		contactEquationStiffness: 1e8,
		// 		contactEquationRelaxation: 3,
		// 		frictionEquationStiffness: 1e8,
		// 	}
		// );
		// // Tweak contact properties.
		// // Contact stiffness - use to make softer/harder contacts
		// this.world.defaultContactMaterial.contactEquationStiffness = 1e7;

		// Stabilization time in number of timesteps
		//this.world.defaultContactMaterial.contactEquationRelaxation = 4;
		//this.world.addContactMaterial(this.slippery_ground_cm);

		// Add the ground

		// const sizeX = 15;
		// const sizeZ = 15;
		// const matrix = [];
		// for (let i = 0; i < sizeX; i++) {
		// 	matrix.push([]);
		// 	for (let j = 0; j < sizeZ; j++) {
		// 		if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
		// 			const height = 316;
		// 			matrix[i].push(height);
		// 			continue;
		// 		}

		// 		const height =
		// 			Math.cos((i / sizeX) * Math.PI * 5) *
		// 				Math.cos((j / sizeZ) * Math.PI * 5) *
		// 				2 +
		// 			2;

		// 		// 	//randomize height
		// 		//  height *= Math.random() * 14 - 2;

		// 		matrix[i].push(height);
		// // 		//
		// // 	}
		// }

		// //	const groundMaterial = new CANNON.Material("groundMaterial");
		// const heightfieldShape = new CANNON.Heightfield(matrix, {
		// 	elementSize: 150 / sizeX,

		// 	minValue: -10,
		// 	maxValue: 10,
		// });

		// const heightfieldBody = new CANNON.Body({
		// 	mass: 0,
		// 	material: groundMaterial,
		// });
		// heightfieldBody.addShape(heightfieldShape);
		// heightfieldBody.position.set(
		// 	// -((sizeX - 1) * heightfieldShape.elementSize) / 2,
		// 	-(sizeX * heightfieldShape.elementSize) / 2,
		// 	-1,
		// 	// ((sizeZ - 1) * heightfieldShape.elementSize) / 2
		// 	(sizeZ * heightfieldShape.elementSize) / 2
		// );
		// heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

		// //const geometry = new THREE.Geometry();
		// const geometry2 = new THREE.BufferGeometry();
		// const points = [];
		// const v0 = new CANNON.Vec3();
		// const v1 = new CANNON.Vec3();
		// const v2 = new CANNON.Vec3();

		// for (let xi = 0; xi < heightfieldShape.data.length - 1; xi++) {
		// 	for (let yi = 0; yi < heightfieldShape.data[xi].length - 1; yi++) {
		// 		for (let k = 0; k < 2; k++) {
		// 			heightfieldShape.getConvexTrianglePillar(xi, yi, k === 0);
		// 			v0.copy(heightfieldShape.pillarConvex.vertices[0]);
		// 			v1.copy(heightfieldShape.pillarConvex.vertices[2]);
		// 			v2.copy(heightfieldShape.pillarConvex.vertices[1]);
		// 			v0.vadd(heightfieldShape.pillarOffset, v0);
		// 			v1.vadd(heightfieldShape.pillarOffset, v1);
		// 			v2.vadd(heightfieldShape.pillarOffset, v2);

		// 			points.push(new THREE.Vector3(v0.x, v0.y, v0.z));
		// 			points.push(new THREE.Vector3(v1.x, v1.y, v1.z));
		// 			points.push(new THREE.Vector3(v2.x, v2.y, v2.z));

		// 			// geometry.vertices.push(
		// 			// 	new THREE.Vector3(v0.x, v0.y, v0.z),
		// 			// 	new THREE.Vector3(v1.x, v1.y, v1.z),
		// 			// 	new THREE.Vector3(v2.x, v2.y, v2.z)
		// 			// );
		// 			// 	const i = geometry.vertices.length - 3;
		// 			// 	geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
		// 			// }
		// 		}
		// 	}

		// 	// geometry.computeBoundingSphere();

		// 	// if (flatShading) {
		// 	// 	geometry.computeFaceNormals();
		// 	// } else {
		// 	// 	geometry.computeVertexNormals();
		// 	// }

		// 	// return geometry;

		// 	// geometry2.setFromPoints(points);
		// 	// geometry2.computeVertexNormals();

		// 	// const material = new THREE.MeshLambertMaterial({
		// 	// 	color:  0xFAfE00,
		// 	// 	side: THREE.FrontSide,
		// 	// });

		// 	// const mesh = new THREE.Mesh(geometry2, material);
		// 	// //	mesh.castShadow = true;
		// 	// //	mesh.receiveShadow = true;
		// 	// //	mesh.position.copy(this.heightfieldBody.position);
		// 	// //		mesh.quaternion.copy(this.heightfieldBody.quaternion);
		// 	// mesh.position;
		// 	// this.scene.add(mesh);

		// 	//this.world.addBody(heightfieldBody);
		// 	//	demo.addVisual(heightfieldBody);

		// 	this.ground = new CANNON.Body({
		// 		type: CANNON.Body.STATIC,
		// 		shape: new CANNON.Heightfield(matrix, { elementSize: 500 / sizeX }),
		// 		//collisionFilterGroup: 0, // Put the sphere in group 1
		// 		//	collisionFilterMask: GROUP2 | GROUP3, // It can only collide with group 2 and 3
		// 		material: groundMaterial,
		// 	});

		// 	this.ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		// 	this.ground.position.set(-300, -5, 300);
		// 	//this.world.addBody(this.ground);
		//ground box
		
		// 	const maxSteerVal = 0.5;
		// 	const maxForce = 1000;
		// 	const brakeForce = 1000000;

		// 	// // Update the wheel bodies
		// 	// this.world.addEventListener("postStep", () => {

		// 	// });

		// 	//	this.world.addBody(this.body);
		// }
	}

	CreateCar(params: any) {	
		
		//this.world.addContactMaterial(this);
		// const carBodyMaterial = new CANNON.Material("carBodyMaterial");
		// const carBody_ground = new CANNON.ContactMaterial(
		// 	carBodyMaterial,
		// 	this.groundMaterial ,
		// 	{
		// 		friction:2,
		// 		restitution: 0.3,

		// //		contactEquationStiffness: 1e8,
		// 	//	contactEquationRelaxation: 3,
		// 	//	frictionEquationStiffness: 12,
				
		// 	}

			
		// );
		// this.world.addContactMaterial(carBody_ground);

		this.body = new CANNON.Body({
			mass: 700,
			shape: new CANNON.Box(new CANNON.Vec3(2, 0.5, 1)),
			//material: carBodyMaterial,
			//collisionFilterGroup: 4,
		});
		//add mesh to body
		const carGeo = new THREE.BoxGeometry(4, 1, 2);
		const texture = new THREE.TextureLoader().load("images/checker3.jpg");	
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(3, 3);	
		this.CarMesh = new THREE.Mesh(
			carGeo,
			new THREE.MeshLambertMaterial({
				color: "#949494",
				flatShading: true,
				side: THREE.DoubleSide,
				wireframe: false,
				map: texture,
			})
		);

		this.CarMesh.castShadow = true;
		this.CarMesh.receiveShadow = true;

		this.group_.add(this.CarMesh);
		this.scene.add(this.group_);

		//this.scene.add(this.CarMesh);
		this._mesh = this.CarMesh;

		this.body.position.set(0, 4, 0);
		this.body.angularVelocity.set(0, 0, 0);

		this.vehicle = new CANNON.RaycastVehicle({
			chassisBody: this.body,
			// indexRightAxis: 0,
			// indexUpAxis: 1,
			// indexForwardAxis:2,
		});

		const wheelOptions = {
			radius: 0.6,
			directionLocal: new CANNON.Vec3(0, -1, 0),
			suspensionStiffness: 10,
			suspensionRestLength: 0.3,
			frictionSlip: 4.2,
			dampingRelaxation: 0.3,
			dampingCompression: 1.4,
			maxSuspensionForce: 100000,
			rollInfluence: 0.75,
			axleLocal: new CANNON.Vec3(0, 0, 1),
			chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
			maxSuspensionTravel: 2.3,
			customSlidingRotationalSpeed: 30,
			useCustomSlidingRotationalSpeed: true,
		//	material : this.wheelMaterial,
		};

		wheelOptions.chassisConnectionPointLocal.set(-1.5, -0.5, 1.5);
		// wheelOptions.radius = 0.8;
		// wheelOptions.maxSuspensionTravel= 1.3;


		this.vehicle.addWheel(wheelOptions);

		wheelOptions.chassisConnectionPointLocal.set(-1.5, -0.5, -1.5);
		// wheelOptions.radius = 0.8;
		// wheelOptions.maxSuspensionTravel= 1.3;

		this.vehicle.addWheel(wheelOptions);

		wheelOptions.chassisConnectionPointLocal.set(1.5, -0.5, 1.5);
		// wheelOptions.radius = 0.8;
		// wheelOptions.maxSuspensionTravel= 2.6;
		// wheelOptions.suspensionStiffness= 60;

		this.vehicle.addWheel(wheelOptions);

		wheelOptions.chassisConnectionPointLocal.set(1.5, -0.5, -1.5);
		// wheelOptions.radius = 0.8;
		// wheelOptions.maxSuspensionTravel= 2.6;
		// wheelOptions.suspensionStiffness= 60;
		this.vehicle.addWheel(wheelOptions);

		// wheelOptions.chassisConnectionPointLocal.set(0, -0.5, -0);
		// this.vehicle.addWheel(wheelOptions);

		this.vehicle.addToWorld(this.world);

		this.wheelBodies = [];
		this.wheelMeshes = [];

		//   const wheelMaterial = new CANNON.Material('wheel')
		this.vehicle.wheelInfos.forEach((wheel) => {
			const cylinderShape = new CANNON.Cylinder(
				wheel.radius,
				wheel.radius,
				wheel.radius / 2,
				30
			);
			const wheelBody = new CANNON.Body({
				mass: 0,
				material: this.wheelMaterial ,


			});
			wheelBody.type = CANNON.Body.KINEMATIC;
			wheelBody.collisionFilterGroup = 0; // turn off collisions
			const quaternion = new CANNON.Quaternion().setFromEuler(
				-Math.PI / 2,
				0,
				0
			);

			//create wheel mesh
			const wheelgeo = new THREE.CylinderGeometry(
				wheel.radius,
				wheel.radius,
				wheel.radius / 2,
				30
			);
			wheelgeo.rotateX(Math.PI / 2);

			const map = new THREE.TextureLoader().load("images/checker3.jpg");
			map.wrapS = THREE.RepeatWrapping;
			map.wrapT = THREE.RepeatWrapping;
			map.repeat.set(13, 7);
			//make larger

			const sideMaterial = new THREE.MeshBasicMaterial({
				//map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/uv_grid_opengl.jpg")
				map: map,
			});
			const topMaterial = new THREE.MeshBasicMaterial({
				//map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/uv_grid_opengl.jpg")
				map: new THREE.TextureLoader().load("images/checker2.jpg"),
			});
			//   const bottomMaterial = new THREE.MeshBasicMaterial({
			// 	//map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/uv_grid_opengl.jpg")
			// 	map: new THREE.TextureLoader().load("images/checker2.jpg"),

			//   });

			const materials = [sideMaterial, topMaterial, topMaterial];

			// const mesh= new THREE.Mesh(geometry, materials)

			const wheelMesh = new THREE.Mesh(
				wheelgeo,
				materials
				//new THREE.MeshPhongMaterial ({ color: "#000000" , flatShading: true})
			);

			//wheelMesh.rotation.x = Math.PI / 2;
			//wheelMesh.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), -Math.PI / 2)

			//wheelMesh.castShadow = true;
			this.wheelMeshes.push(wheelMesh);
			this.scene.add(wheelMesh);

			//this.group_.add(wheelMesh);
			//this.scene.add(wheelMesh);
			wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion);
			this.wheelBodies.push(wheelBody);
			//demo.addVisual(wheelBody);
			this.world.addBody(wheelBody);
		});
	}

	InitComponent() {
		this.group_.userData.EntityGroup = this.Parent;

		this._RegisterHandler("update.position", (m: any) => {
			this._OnPosition(m);
		});
		this._RegisterHandler("update.rotation", (m: any) => {
			this._OnRotation(m);
		});

		this._RegisterHandler("network.update", (m) => this._log(m));

		this.Parent.Mesh = this._mesh;
	}

	_OnPosition(m: { value: THREE.Vector3 }) {
		this.body.position.set(m.value.x, m.value.y, m.value.z);
		//this.group_.position.copy(m.value);
	}

	_OnRotation(m: { value: THREE.Quaternion }) {
		this.body.quaternion.set(m.value.x, m.value.y, m.value.z, m.value.w);
	}

	//

	Update(dt: number) {
		this.input = this.GetComponent("CarInputComponent") as CarInputComponent;
		
		// if (this.input == undefined) {
		// 	this.Parent.SetPosition(this.body.position);
		// 	this.Parent.SetQuaternion(this.body.quaternion);
		// 	return;
		// }

		if (this.input){
			if(this.input._keys.forward){

				this.vehicle.applyEngineForce(-this.maxForce, 2);
				this.vehicle.applyEngineForce(-this.maxForce, 3);

				this.vehicle.applyEngineForce(-this.maxForce, 0);
				this.vehicle.applyEngineForce(-this.maxForce, 1);
				//check if key released

			}
			else if(this.input._keys.backward){

				this.vehicle.applyEngineForce(this.maxForce , 2);
				this.vehicle.applyEngineForce(this.maxForce, 3);

				this.vehicle.applyEngineForce(this.maxForce, 0);
				this.vehicle.applyEngineForce(this.maxForce, 1);

			}
			else
			{
				this.vehicle.applyEngineForce(0, 2);
				this.vehicle.applyEngineForce(0, 3);

				this.vehicle.applyEngineForce(0, 0);
				this.vehicle.applyEngineForce(0, 1);
			}

			if (this.input._keys.space) {
				this.vehicle.setBrake(this.maxBreakForce, 0);
				this.vehicle.setBrake(this.maxBreakForce, 1);
				this.vehicle.setBrake(this.maxBreakForce, 2);
				this.vehicle.setBrake(this.maxBreakForce, 3);
			}
			else
			{
				this.vehicle.setBrake(0, 0);
				this.vehicle.setBrake(0, 1);
				this.vehicle.setBrake(0, 2);
				this.vehicle.setBrake(0, 3);
			}


			if (this.input._keys.right) {
	
					if (this.steeringValue > -this.maxSteerVal) {
						this.steeringValue -= this.steerStep;
						this.vehicle.setSteeringValue(this.steeringValue, 0);
						this.vehicle.setSteeringValue(this.steeringValue, 1);
					}
			}
			else if (this.input._keys.left) {

					if (this.steeringValue < this.maxSteerVal) {
						this.steeringValue += this.steerStep;
						this.vehicle.setSteeringValue(this.steeringValue, 0);
						this.vehicle.setSteeringValue(this.steeringValue, 1);
					}
			}
			else
			{
				if (this.steeringValue > 0) {
					this.steeringValue -= this.steerStep;
					this.vehicle.setSteeringValue(this.steeringValue, 0);
					this.vehicle.setSteeringValue(this.steeringValue, 1);
	
					// snap to 0
					if (this.steeringValue < this.steerStep) {
						this.steeringValue = 0;
						this.vehicle.setSteeringValue(this.steeringValue, 0);
						this.vehicle.setSteeringValue(this.steeringValue, 1);
					}
				} else if (this.steeringValue < 0) {
					this.steeringValue += this.steerStep;
					this.vehicle.setSteeringValue(this.steeringValue, 0);
					this.vehicle.setSteeringValue(this.steeringValue, 1);
	
					// snap to 0
					if (this.steeringValue >this.steerStep) {
						if (this.steeringValue < this.steerStep) {
							this.steeringValue = 0;
							this.vehicle.setSteeringValue(this.steeringValue, 0);
							this.vehicle.setSteeringValue(this.steeringValue, 1);
						}}
				}}

				
			

		
				

	//		console.log("input")


	//		if (this.input.

		}
		//console.log(this.Parent.Position);

		// this.Parent.SetPosition(this.body.position);
		//this.Parent.SetQuaternion(this.body.quaternion);


				//position the wheels
				// for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
				// 	this.vehicle.updateWheelTransform(i);
				// 	const t = this.vehicle.wheelInfos[i].worldTransform;
				// 	this.wheelMeshes[i].position.copy(t.position);
				// 	this.wheelMeshes[i].quaternion.copy(t.quaternion);
				// }
		
// 		if (this.input.keyDown(this.input.KeyboardKeys.z)) {
// 			console.log("z");
// 			//this.vehicle.applyEngineForce(-2000, 2);

// //			this.vehicle.applyEngineForce(-2000, 3);

// 			//4 wheel drive
// 			this.vehicle.applyEngineForce(-300, 0);
// 			this.vehicle.applyEngineForce(-300, 1);
// 		} else if (this.input.keyDown(this.input.KeyboardKeys.s)) {
// 			console.log("s");
// 			this.vehicle.applyEngineForce(1000, 2);
// 			this.vehicle.applyEngineForce(1000, 3);

// 			//4 wheel drive
// 			this.vehicle.applyEngineForce(1000, 0);

// 			this.vehicle.applyEngineForce(1000, 1);
// 		}

// 		if (this.input.keyDown(this.input.KeyboardKeys.q)) {
// 			console.log("q");
// 			if (this.steeringValue < 1) {
// 				this.steeringValue += 0.05;
// 				this.vehicle.setSteeringValue(this.steeringValue, 0);
// 				this.vehicle.setSteeringValue(this.steeringValue, 1);
// 			}
// 			// this.vehicle.setSteeringValue(1, 0);
// 			// this.vehicle.setSteeringValue(1, 1);
// 		}

// 		if (this.input.keyDown(this.input.KeyboardKeys.space)) {
// 			//this.vehicle.setBrake(100000, 0);
// 			//this.vehicle.setBrake(100000, 1);
// 			this.vehicle.setBrake(900000, 2);
// 			this.vehicle.setBrake(900000, 3);
			
// 		} else if (this.input.released("space")) {
// 			this.vehicle.setBrake(10, 0);
// 			this.vehicle.setBrake(10, 1);
// 			this.vehicle.setBrake(10, 2);
// 			this.vehicle.setBrake(10, 3);
// 		}

// 		// }
// 		else if (this.input.keyDown(this.input.KeyboardKeys.d)) {
// 			console.log("d");

// 			if (this.steeringValue > -1) {
// 				this.steeringValue -= 0.05;
// 				this.vehicle.setSteeringValue(this.steeringValue, 0);
// 				this.vehicle.setSteeringValue(this.steeringValue, 1);
// 			}
// 		}
// 		// else if ( this.input.released("q")) {
// 		// 	this.steeringValue = 0;
// 		// 	this.vehicle.setSteeringValue(this.steeringValue, 0);
// 		// 	this.vehicle.setSteeringValue(this.steeringValue, 1);
// 		// }

// 		//check if neither q or d is pressed
// 		if (
// 			!this.input.keyDown(this.input.KeyboardKeys.q) &&
// 			!this.input.keyDown(this.input.KeyboardKeys.d)
// 		) {
// 			// add or subtract 0.05 to steering value until it reaches 0
// 			//fine tune steering value as it approaches 0
// 			if (this.steeringValue > 0) {
// 				this.steeringValue -= 0.05;
// 				this.vehicle.setSteeringValue(this.steeringValue, 0);
// 				this.vehicle.setSteeringValue(this.steeringValue, 1);

// 				// snap to 0
// 				if (this.steeringValue < 0.05) {
// 					this.steeringValue = 0;
// 					this.vehicle.setSteeringValue(this.steeringValue, 0);
// 					this.vehicle.setSteeringValue(this.steeringValue, 1);
// 				}
// 			} else if (this.steeringValue < 0) {
// 				this.steeringValue += 0.05;
// 				this.vehicle.setSteeringValue(this.steeringValue, 0);
// 				this.vehicle.setSteeringValue(this.steeringValue, 1);

// 				// snap to 0
// 				if (this.steeringValue > -0.05) {
// 					if (this.steeringValue < 0.05) {
// 						this.steeringValue = 0;
// 						this.vehicle.setSteeringValue(this.steeringValue, 0);
// 						this.vehicle.setSteeringValue(this.steeringValue, 1);
// 					}
// 				}
// 			}
// 		}

// 		// if (this.input.released("q")) {
// 		// 	//steer back to center using a spring
// 		// 	// const springForce = -this.steeringValue * 100;
// 		// 	// this.vehicle.applyEngineForce(springForce, 0);
// 		// 	// this.vehicle.applyEngineForce(springForce, 1);
// 		// 	//restore the steering in a tween

// 		// 	const tweenValue = { value: this.steeringValue };
// 		// 	this.SteeringTween = new TWEEN.Tween(tweenValue)
// 		// 		.to({ value: 0 }, 200)
// 		// 		.easing(TWEEN.Easing.Quadratic.Out)
// 		// 		.onUpdate(() => {
// 		// 			this.vehicle.setSteeringValue(tweenValue.value, 0);
// 		// 			this.vehicle.setSteeringValue(tweenValue.value, 1);
// 		// 		});
// 		// 	this.SteeringTween.start();

// 		// 	// this.steeringValue = 0;
// 		// 	// this.vehicle.setSteeringValue(this.steeringValue, 0);
// 		// 	// this.vehicle.setSteeringValue(this.steeringValue, 1);

// 		// 	// if (this.steeringValue < 0 && this.steeringValue > -1) {
// 		// 	// 	this.steeringValue = 0;
// 		// 	// 	this.vehicle.setSteeringValue(this.steeringValue, 0);
// 		// 	// 	this.vehicle.setSteeringValue(this.steeringValue, 1);
// 		// 	// }
// 		// }

// 		if (this.input.released("z")) {
// 			this.vehicle.applyEngineForce(0, 2);
// 			this.vehicle.applyEngineForce(0, 3);

// 			//4 wheel drive
// 			this.vehicle.applyEngineForce(0, 0);

// 			this.vehicle.applyEngineForce(0, 1);
// 		}

// 		if (this.input.released("s")) {
// 			this.vehicle.applyEngineForce(0, 2);
// 			this.vehicle.applyEngineForce(0, 3);

// 			//4 wheel drive
// 			this.vehicle.applyEngineForce(0, 0);

// 			this.vehicle.applyEngineForce(0, 1);
// 		}
		// if (this.input.released("d")) {
		// 	//reset steering gradually to center
		// 	this.steeringValue += 0.05;
		// 	this.vehicle.setSteeringValue(this.steeringValue, 0);
		// 	this.vehicle.setSteeringValue(this.steeringValue, 1);
		// 	// if (this.steeringValue > 0 && this.steeringValue < 1) {
		// 	// 	this.steeringValue = 0;
		// 	// 	this.vehicle.setSteeringValue(this.steeringValue, 0);
		// 	// 	this.vehicle.setSteeringValue(this.steeringValue, 1);
		// 	// }
		// }

		// else {
		// 	this.vehicle.applyEngineForce(0, 3);

		// }

		// if (this.input.keyDown(this.input.KeyboardKeys.Space)) {
		// 	console.log("space");
		// 	this.vehicle.applyEngineForce(1000, 0);
		// 	this.vehicle.applyEngineForce(1000, 1);
		// }

		//check for when key is released
		// if (this.input.keyUp(this.input.KeyboardKeys.z)) {
		// 	console.log("z up");
		// }

		// 		this.CarMesh.position.copy(this.vehicle.chassisBody.position);
		// this.CarMesh.quaternion.copy(this.vehicle.chassisBody.quaternion);


		for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
			this.vehicle.updateWheelTransform(i);
			const transform = this.vehicle.wheelInfos[i].worldTransform;
			const wheelBody = this.wheelBodies[i];
			wheelBody.position.copy(transform.position);
			wheelBody.quaternion.copy(transform.quaternion);
			this.wheelMeshes[i].position.copy(transform.position);
					this.wheelMeshes[i].quaternion.copy(transform.quaternion);
			//set wheel mesh position
			//considering that up vector in canon is z and in threejs is y

			//this.wheelMeshes[i].position.copy(transform.position);
			//this.wheelMeshes[i].quaternion.copy(transform.quaternion);
		}
		this.group_.position.copy(this.body.position);
		this.group_.quaternion.copy(this.body.quaternion);


		this.Parent.SetPosition(this.body.position);
		this.Parent.SetQuaternion(this.body.quaternion);
	}
	Destroy() {
		//this.world.removeBody(this.body);
		this.world.removeBody(this.vehicle);
		//remove wheels from world
		for (let i = 0; i < this.wheelBodies.length; i++) {
			this.world.removeBody(this.wheelBodies[i]);
		}

		//destroy the vehicle
		//this.vehicl
	}
}

class CarInputComponent extends Component {
	params_: any;
	_keys: {
		forward: boolean;
		backward: boolean;
		left: boolean;
		right: boolean;
		space: boolean;
		shift: boolean;
		backspace: boolean;
	};
	stinput_: any;
	constructor(params: { input: any }) {
		super();
		this.params_ = params;
		this.stinput_ = params.input;
		this.Init_();
	}
	Init_() {
		this._keys = {
			forward: false,
			backward: false,
			left: false,
			right: false,
			space: false,
			shift: false,
			backspace: false,
		};
	}
	Update(timeInSeconds: any) {
		/* #region  Released */
		if (this.stinput_.released("z")) {
			this._keys.forward = false;
		}
		if (this.stinput_.released("s")) {
			this._keys.backward = false;
		}
		if (this.stinput_.released("q")) {
			this._keys.left = false;
		}
		if (this.stinput_.released("d")) {
			this._keys.right = false;
		}
		if (this.stinput_.released("space")) {
			this._keys.space = false;
		}
		if (this.stinput_.released("shift")) {
			this._keys.shift = false;
		}
		/* #endregion */
		/* #region  Pressed */
		if (this.stinput_.pressed("z")) {
			this._keys.forward = true;
		}
		if (this.stinput_.pressed("s")) {
			this._keys.backward = true;
		}
		if (this.stinput_.pressed("q")) {
			this._keys.left = true;
		}
		if (this.stinput_.pressed("d")) {
			this._keys.right = true;
		}
		if (this.stinput_.pressed("space")) {
			this._keys.space = true;
		}
		if (this.stinput_.pressed("shift")) {
			this._keys.shift = true;
		}
	}
}


export { CarPhysicsComponent , CarInputComponent };
