import * as CANNON from "cannon-es";
import * as THREE from "three";
import CannonDebugRenderer from "../utils/cannonDebugRenderer";
import CannonUtils from "../utils/cannonUtils";

class PhysicsManager {
	world: CANNON.World;
	debugRenderer: CannonDebugRenderer;
	ground: CANNON.Body;
	groundMaterial: CANNON.Material;
	slipperyMaterial: CANNON.Material;
	slippery_ground_cm: CANNON.ContactMaterial;
	scene: THREE.Scene;
	roadmaterial: CANNON.Material;
	wheelMaterial: CANNON.Material;
	wheel_ground: CANNON.ContactMaterial;
	meshes: THREE.Mesh[];
	positions: Float32Array;
	quaternions: Float32Array;

	constructor(params) {
		this.scene = params.scene;
		this.meshes = [];

		// The SharedArrayBuffers. They contain all our kinematic data we need for rendering.
		// SharedArrayBuffers are shared between the main
		// and worker thread. Cannon.js will update the data while
		// three.js will read from them.

		// Cubes
		// const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
		// const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#888" });
		// for (let i = 0; i < 40; i++) {
		// 	const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
		// 	cubeMesh.position.set(
		// 		Math.random() - 0.5,
		// 		i * 2.5 + 0.5,
		// 		Math.random() - 0.5
		// 	);
		// 	cubeMesh.castShadow = true;
		// 	cubeMesh.receiveShadow = true;
		// 	this.meshes.push(cubeMesh);
		// 	this.scene.add(cubeMesh);
		// }

		this.init();
		//this.initCannonWorker();
		//
	}

	get World() {
		return this.world;
	}

	init() {
		this.world = new CANNON.World();
		this.world.gravity.set(0, -9.82, 0);
		//	this.world.solver.tolerance = 0.001

		//this.world.frictionGravity = new CANNON.Vec3(0, 10, 0);
		this.world.broadphase = new CANNON.NaiveBroadphase();
		this.world.allowSleep = true;
		//this.world.broadphase = new CANNON.SAPBroadphase(this.world);
		//this.world.solver.removeAllEquations();
		// this.world.defaultContactMaterial.friction = 2;
		// this.world.defaultContactMaterial.restitution = 0.01;
		// this.world.defaultContactMaterial.contactEquationStiffness = 1e8;
		// this.world.defaultContactMaterial.contactEquationRelaxation = 3;
		// this.world.defaultContactMaterial.frictionEquationStiffness = 1e8;

		this.wheelMaterial = new CANNON.Material("wheelMaterial");

		this.wheel_ground = new CANNON.ContactMaterial(
			this.wheelMaterial,
			this.groundMaterial,
			{
				friction: 50.3,
				restitution: 0.1,

				contactEquationStiffness: 1e8,
				contactEquationRelaxation: 3,
				// frictionEquationStiffness: 1e8,
			}
		);

		this.groundMaterial = new CANNON.Material("groundMaterial");
		this.slipperyMaterial = new CANNON.Material("slipperyMaterial");
		this.slippery_ground_cm = new CANNON.ContactMaterial(
			this.groundMaterial,
			this.slipperyMaterial,
			{
				friction: 1.0,
				restitution: 500.3,
				contactEquationStiffness: 1e8,
				contactEquationRelaxation: 3,
			}
		);

		this.world.addContactMaterial(this.slippery_ground_cm);

		const groundShape = new CANNON.Box(new CANNON.Vec3(500, 10, 500));
		this.ground = new CANNON.Body({
			mass: 0,
			material: this.groundMaterial,
			shape: groundShape,
			type: CANNON.Body.STATIC,
		});

		this.roadmaterial = new CANNON.Material("roadmaterial");

		const roadWheelcm = new CANNON.ContactMaterial(
			this.wheelMaterial,
			this.roadmaterial,
			{
				friction: 1.0,
				restitution: 5000.0,
				contactEquationStiffness: 1e8,
				contactEquationRelaxation: 0.1,
			}
		);

		this.world.addContactMaterial(roadWheelcm);
		// this.ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		this.ground.position.set(-300, -10, 300);

		//create a mesh cube and add it to the scene
		const CubeMesh = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshStandardMaterial({ color: "#888" })
		);
		CubeMesh.position.set(0, 4, 0);
		CubeMesh.castShadow = true;

		this.scene.add(CubeMesh);
		//add body to world
		const cubeShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
		const cubeBody = new CANNON.Body({
			mass: 1,
			material: this.roadmaterial,
			shape: cubeShape,
			type: CANNON.Body.DYNAMIC,
		});
		cubeBody.position.set(0, 4, 0);

		this.world.addBody(cubeBody);

		const jointShape = new CANNON.Sphere(1.1);
		const jointBody = new CANNON.Body({ mass: 0 });
		jointBody.addShape(jointShape);
		jointBody.collisionFilterGroup = 0;
		jointBody.collisionFilterMask = 0;

		const vector = new CANNON.Vec3()
			.copy(new CANNON.Vec3(0.5, 0.5, 0))
			.vsub(cubeBody.position);

		// Apply anti-quaternion to vector to tranform it into the local body coordinate system
		const antiRotation = cubeBody.quaternion.inverse();
		const pivot = antiRotation.vmult(vector); // pivot is not in local body coordinates

		// Move the cannon click marker body to the click position
		//      jointBody.position.copy(position)

		// Create a new constraint
		// The pivot for the jointBody is zero
		const jointConstraint = new CANNON.PointToPointConstraint(
			cubeBody,
			pivot,
			jointBody,
			new CANNON.Vec3(0, 2, 0)
		);

		this.world.addEventListener("postStep", () => {
			CubeMesh.position.set(
				cubeBody.position.x,
				cubeBody.position.y,
				cubeBody.position.z
			);
			CubeMesh.quaternion.set(
				cubeBody.quaternion.x,
				cubeBody.quaternion.y,
				cubeBody.quaternion.z,
				cubeBody.quaternion.w
			);
			jointConstraint.update();
		});
		// Add the constraint to world
		this.world.addConstraint(jointConstraint);

		//create ground mesh
		//create transparent ground mesh

		//create some static roads
		const length = 100;
		const width = 100;
		const height = 0.5;
		const roadShape = new CANNON.Box(
			new CANNON.Vec3(length / 2, height / 2, width / 2)
		);
		const roadShape2 = new CANNON.Box(
			new CANNON.Vec3(length / 2, height / 2, width / 2)
		);

		const road = new CANNON.Body({
			mass: 0,
			material: this.groundMaterial,
			shape: roadShape,
			type: CANNON.Body.STATIC,
		});
		road.position.set(0, 0, 0);
		road.quaternion.setFromEuler(0, 0, 0);
		//	this.world.addBody(road);

		// // for (let i = 0; i < 15; i++) {
		// // 	const road2 = new CANNON.Body({
		// // 		mass: 0,
		// // 		material: this.roadmaterial,
		// // 		shape: roadShape2,
		// // 		type: CANNON.Body.KINEMATIC,
		// // 	});
		// // 	road2.position.set(-i * 150 + 6, 0, i * 100);
		// // 	road2.quaternion.setFromEuler(0, 0, 0);
		// // 	this.world.addBody(road2);

		// // 	const gm = new THREE.MeshPhongMaterial({
		// // 		color: "#45799d",
		// // 		transparent: false,
		// // 		opacity: 0.9,
		// // 		flatShading: false,
		// // 		side: THREE.DoubleSide,
		// // 		wireframe: false,
		// // 	});
		// // 	const groundMesh = new THREE.Mesh(
		// // 		new THREE.BoxGeometry(length, height, width),
		// // 		gm
		// // 	);

		// // 	groundMesh.receiveShadow = true;
		// // 	groundMesh.position.set(-i * 150 + 6, 0, i * 100);
		// // 	groundMesh.quaternion.setFromEuler(new THREE.Euler(0, 0, 0));

		// // 	this.scene.add(groundMesh);
		// // }

		// // //add a bunch of thin boxes to the world to make elevation

		// // for (let i = 0; i < 5; i++) {
		// // 	//random height
		// // 	const h = Math.random() * 209 + 520;
		// // 	const w = Math.random() * 20 + 15;
		// // 	const l = Math.random() * 15 + 14;

		// // 	const Px = Math.random() * 1000 - 500;
		// // 	const Py = Math.random() * 10 + 1;
		// // 	const Pz = Math.random() * 1000 - 500;

		// // 	const boxShape = new CANNON.Box(new CANNON.Vec3(l / 2, h / 2, w / 2));
		// // 	const box = new CANNON.Body({
		// // 		mass: 0,
		// // 		material: this.groundMaterial,
		// // 		shape: boxShape,
		// // 		type: CANNON.Body.KINEMATIC,
		// // 	});
		// // 	box.position.set(Px, 0, Pz);
		// // 	box.quaternion.setFromEuler(0, 0, (3 * Math.PI) / 5);

		// // 	this.world.addBody(box);
		// // 	//create random box mesh
		// // 	const randomMaterial = new THREE.MeshPhongMaterial({
		// // 		color: Math.random() * 0xffffff,
		// // 		transparent: Math.random() > 0.5,
		// // 		opacity: Math.random() * 0.5 + 0.5,
		// // 		flatShading: Math.random() > 0.5,
		// // 		side: THREE.DoubleSide,
		// // 	});
		// // 	const boxMesh = new THREE.Mesh(
		// // 		new THREE.BoxGeometry(l, h, w),
		// // 		randomMaterial
		// // 	);
		// // 	boxMesh.receiveShadow = true;
		// // 	boxMesh.position.set(Px, 0, Pz);
		// // 	boxMesh.quaternion.setFromEuler(new THREE.Euler(0, 0, (3 * Math.PI) / 5));
		// // 	this.scene.add(boxMesh);
		// // }

		// for(let i = 0; i < 10; i++){
		// 	//random height
		// 	const h =  0.6;
		// 	const w = 			Math.random() * 10 + 160;
		// 	const l =  Math.random() * 10 + 1;

		// // distribute the boxes in a grid
		// 	const Px = i % 10 * 10 - 50;
		// 	const Py = 0;
		// 	const Pz = Math.floor(i / 10) * 10 - 50;

		// 	const boxShape = new CANNON.Box(new CANNON.Vec3(l / 2, h / 2, w / 2));
		// 	const box = new CANNON.Body({
		// 		mass: 0,
		// 		material: this.groundMaterial,
		// 		shape: boxShape,
		// 	});
		// 	box.position.set(
		// 		Px,
		// 		h / 2,
		// 		Pz
		// 	) ;
		// 	box.quaternion.setFromEuler(0, 0, 0);

		// 	this.world.addBody(box);
		// 	//create random box mesh
		// 	const randomMaterial = new THREE.MeshPhongMaterial({
		// 		color: "#b5b5b5",
		// 		transparent: false,
		// 		opacity: 0.9,
		// 		flatShading: false,

		// 	side: THREE.DoubleSide,
		// 	wireframe: false,

		// 	});
		// 	const boxMesh = new THREE.Mesh(
		// 		new THREE.BoxGeometry(l, h, w),
		// 		randomMaterial
		// 	);
		// 	boxMesh.receiveShadow = true;
		// 	boxMesh.position.set(
		// 		Px,
		// 		h / 2  ,
		// 		Pz
		// 	);
		// 	this.scene.add(boxMesh);

		// }

		// this.ground2 = new CANNON.Body({
		// 	type: CANNON.Body.STATIC,
		// 	shape:  new CANNON.Box(),
		// 	material: groundMaterial,
		// 	//collisionFilterGroup: 0, // Put the sphere in group 1
		// 	//	collisionFilterMask: GROUP2 | GROUP3, // It can only collide with group 2 and 3
		// 	//	material: groundMaterial,
		// });
		//	this.ground2 = groundBody;
		//	this.ground2.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		//	this.ground2.position.set(0, -10, 0);

		// this.ground.quaternion.setFromAxisAngle(
		// 	new CANNON.Vec3(1, 0, 0),
		// 	-Math.PI / 2
		// );
		this.world.addBody(this.ground);

		// Disable friction by default
		//this.world.defaultContactMaterial.friction = 0;
		//this.world.

		//this.world.allowSleep = true;
		//this.world.broadphase = new CANNON.SAPBroadphase(this.world);
	}
	initCannonWorker() {
		// Initialize the SharedArrayBuffers.
		// SharedArrayBuffers are shared between the main
		// and worker thread. Cannon.js will update the data while
		// three.js will read from them.
		const positionsSharedBuffer = new SharedArrayBuffer(
			this.meshes.length * 3 * Float32Array.BYTES_PER_ELEMENT
		);
		const quaternionsSharedBuffer = new SharedArrayBuffer(
			this.meshes.length * 4 * Float32Array.BYTES_PER_ELEMENT
		);
		this.positions = new Float32Array(positionsSharedBuffer);
		this.quaternions = new Float32Array(quaternionsSharedBuffer);

		// Copy the initial meshes data into the buffers
		for (let i = 0; i < this.meshes.length; i++) {
			const mesh = this.meshes[i];

			this.positions[i * 3 + 0] = mesh.position.x;
			this.positions[i * 3 + 1] = mesh.position.y;
			this.positions[i * 3 + 2] = mesh.position.z;
			this.quaternions[i * 4 + 0] = mesh.quaternion.x;
			this.quaternions[i * 4 + 1] = mesh.quaternion.y;
			this.quaternions[i * 4 + 2] = mesh.quaternion.z;
			this.quaternions[i * 4 + 3] = mesh.quaternion.w;
		}

		// Get the worker code
		//let workerScript = document.querySelector("#worker1").textContent;

		// BUG Relative urls don't currently work in an inline
		// module worker in Chrome
		// https://bugs.chromium.org/p/chromium/issues/detail?id=1161710
		// // const href = window.location.href.replace(
		// // 	"/examples/worker_sharedarraybuffer",
		// // 	""
		// // );
		// // workerScript = workerScript
		// // 	.replace(/from '\.\.\//g, `from '${href}/`)
		// // 	.replace(/from '\.\//g, `from '${href}/examples/`);

		// Create a blob for the inline worker code
		// const blob = new Blob([workerScript], { type: "text/javascript" });

		// // Create worker
		// const worker = new Worker(window.URL.createObjectURL(blob), {
		// 	type: "module",
		// });

		// worker.addEventListener("message", (event) => {
		// 	console.log("Message from worker", event.data);
		// });
		// worker.addEventListener("error", (event) => {
		// 	console.error("Error in worker", event.message);
		// });

		// // Send the geometry data to setup the cannon.js bodies
		// // and the initial position and rotation data
		// worker.postMessage({
		// 	// serialize the geometries as json to pass
		// 	// them to the worker
		// 	geometries: this.meshes.map((m) => m.geometry.toJSON()),
		// 	positionsSharedBuffer,
		// 	quaternionsSharedBuffer,
		// });
	}

	Update(dt: number) {
		if (dt > 0.1) {
			dt = 0.1;
		}
		this.world.fixedStep(dt);
		// for (let i = 0; i < this.meshes.length; i++) {
		// 	this.meshes[i].position.set(
		// 		this.positions[i * 3 + 0],
		// 		this.positions[i * 3 + 1],
		// 		this.positions[i * 3 + 2]
		// 	);
		// 	this.meshes[i].quaternion.set(
		// 		this.quaternions[i * 4 + 0],
		// 		this.quaternions[i * 4 + 1],
		// 		this.quaternions[i * 4 + 2],
		// 		this.quaternions[i * 4 + 3]
		// 	);
		// }
	}
}

export { PhysicsManager };
