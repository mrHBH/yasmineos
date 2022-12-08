import * as THREE from "three";

import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "lil-gui";

import { LoadingManager } from "./classes/LoadingManager";

import { EntityManager } from "./classes/EntityManager";
import { Entity } from "./classes/entity";

declare const M;
import CannonDebugRenderer from "./utils/cannonDebugRenderer";

import { SpatialHashGrid } from "./classes/SpatialHashGrid";
import { SpatialGridController } from "./classes/SpatialGridController";
import { ColliderComponent } from "./classes/ColliderComponent";
import { RenderComponent } from "./classes/RenderComponent";
import { MainController } from "./classes/MainController";
import * as StInput from "./utils/stinput";
import { NetworkManager } from "./classes/NetworkManager";
import { SpawnerManager } from "./classes/SpawnerManager";
import { PhysicsManager } from "./classes/PhysicsManager";
import { PhysicsComponent } from "./classes/PhysicsComponent";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PhysicsComponentForCharacters } from "./classes/PhysicsComponentForCharacters";
import {
	CarPhysicsComponent,
	CarInputComponent,
} from "./classes/CarPhysicsComponent";
import { MouseCursorController } from "./classes/MouseCursorController";
import { CameraController } from "./classes/CameraController";
import * as CANNON from "cannon-es";
import { t } from "xstate";

import { Pane } from "tweakpane";
import { TitleBarComponent } from "./classes/TitleBarComponent";
import { PhysicalCharacterController } from "./classes/PLayerEntityPhysical";

class Game {
	stinput: StInput;
	scene!: THREE.Scene;
	clock!: THREE.Clock;
	entityManager: EntityManager;
	hashGrid: SpatialHashGrid;
	mainController: MainController;
	loadingManager: LoadingManager;
	networkManager: NetworkManager;
	spawnerManager: SpawnerManager;
	physicsManager: PhysicsManager;
	PhysicsDebugRenderer: CannonDebugRenderer;
	mouseCursorController: MouseCursorController;

	CameraController: CameraController;
	stats: Stats;

	constructor() {
		
		// eslint-disable-next-line @typescript-eslint/no-this-alias

		this.loadingManager = new LoadingManager();
		this.loadingManager.LoadModel();

		this.Initialize();

	}
	async Initialize() {

		const rendereddiv = document.getElementById("css3d");
		this.stinput = new StInput() as StInput; // stateful input library
		this.stinput.preventDefault = false;

		this.mouseCursorController = new MouseCursorController(this.stinput);
		this.clock = new THREE.Clock();

		this.mainController = new MainController(this.stinput);

		this.CameraController = new CameraController(
			this.stinput,
			this.mainController.BirdCam,
			this.mainController.scene
		);
		this.mainController.SetCameraController(this.CameraController);

		this.entityManager = new EntityManager(this.mainController);

		this.mainController.EntityManager = this.entityManager;
		this.hashGrid = new SpatialHashGrid(
			[
				[-1000, -1000],
				[1000, 1000],
			],
			[100, 100]
		);
		this.physicsManager = new PhysicsManager({
			scene: this.mainController.scene,
		});

		this.scene = this.mainController.Scene;
		this.spawnerManager = new SpawnerManager({
			entityManager: this.entityManager,
			mainController: this.mainController,
			grid: this.hashGrid,
			scene: this.scene,
			loadingManager: this.loadingManager,
			physicsManager: this.physicsManager,
		});

		this.networkManager = new NetworkManager({
			spawner: this.spawnerManager,
			entityManager: this.entityManager,
		});
		// setTimeout(() => {
		// 	this.networkManager.Connect();
		// }, 10000);

		const matrial = new THREE.MeshStandardMaterial({
			color: "#6480ff",
			roughness: 0.5,
			metalness: 0.5,
			emissive: "#1aecdb",
			emissiveIntensity: 0.5,
		});

		// this.PhysicsDebugRenderer = new CannonDebugRenderer(
		// 	this.scene,
		// 	this.physicsManager.World
		// );

		const Wall = new THREE.Mesh(
			new THREE.BoxGeometry(0.1, 10, 70),
			new THREE.MeshStandardMaterial({
				color: "#6480ff",
				roughness: 0.5,
				metalness: 0.5,
				emissive: "#1aecdb",
				emissiveIntensity: 0.5,
			})
		);

		// const WallEntity = new Entity();
		// WallEntity.AddComponent(
		// 	new RenderComponent({
		// 		model: Wall,
		// 		scene: this.scene,
		// 	}),
		// 	"RenderComponent"
		// );
		// WallEntity.AddComponent(new ColliderComponent(), "ColliderComponent");
		// WallEntity.AddComponent(
		// 	new SpatialGridController({ grid: this.hashGrid }),
		// 	"SpatialGridController"
		// );
		// WallEntity.AddComponent(
		// 	new PhysicsComponent({
		// 		world: this.physicsManager.World,
		// 		mass: 0,
		// 		geometry: new THREE.BoxGeometry(0.1, 10, 70),
		// 	}),
		// 	"PhysicsComponent"
		// );

		// WallEntity.SetPosition(new THREE.Vector3(0, 5, 0));
		// this.entityManager.Add(WallEntity, "wall");

		//create 4 walls

		// const Wall2 = new THREE.Mesh(
		// 	new THREE.BoxGeometry(2, 10, 3),
		// 	new THREE.MeshStandardMaterial({
		// 		color: 0x61240,
		// 		roughness: 0.5,
		// 		metalness: 0.5,
		// 		emissive: 0xff000,
		// 		emissiveIntensity: 0.1,
		// 	})
		// );
		// //Wall2.position.set(4, 4, 4);
		// const WallEntity2 = new Entity();
		// WallEntity2.AddComponent(
		// 	new RenderComponent({
		// 		model: Wall2,
		// 		scene: this.scene,
		// 	}),
		// 	"RenderComponent"
		// );
		// WallEntity2.AddComponent(new ColliderComponent(), "ColliderComponent");
		// WallEntity2.AddComponent(
		// 	new SpatialGridController({ grid: this.hashGrid }),
		// 	"SpatialGridController"
		// );
		// WallEntity2.AddComponent(
		// 	new PhysicsComponent({
		// 		world: this.physicsManager.World,
		// 		mass: 0.2,
		// 		geometry: new THREE.BoxGeometry(2, 10, 3),
		// 	}),
		// 	"PhysicsComponent"
		// );

		// WallEntity2.SetPosition(new THREE.Vector3(3, 15, 3));
		// this.entityManager.Add(WallEntity2, "wall2");

		// const cube = new THREE.Mesh(geometry, matrial);
		// //	cube.position.set(0, 10, 2);
		// cube.castShadow = true;
		// const CubeEntity = new Entity();

		// CubeEntity.AddComponent(
		// 	new RenderComponent({ model: cube, scene: this.scene }),
		// 	"RenderComponent"
		// );
		// CubeEntity.AddComponent(new ColliderComponent(), "ColliderComponent");
		// CubeEntity.AddComponent(
		// 	new SpatialGridController({ grid: this.hashGrid }),
		// 	"SpatialGridController"
		// );
		// CubeEntity._RegisterHandler("player.action", (a: any) => {
		// 	console.log(a.action);
		// });
		// CubeEntity.AddComponent(
		// 	new PhysicsComponent({
		// 		world: this.physicsManager.World,
		// 		mass: 0,
		// 		geometry: geometry,
		// 	}),
		// 	"PhysicsComponent"
		// );

		// this.entityManager.Add(CubeEntity, "CubeEntity");

		// CubeEntity.SetPosition(new THREE.Vector3(0, 0.1, 2));

		// //create a stair consisting of 50 with 1m steps
		// for (let i = 0; i < 500; i++) {
		// 	const cube = new THREE.Mesh(geometry, matrial);
		// 	//cube.position.set(0, 0.1 + i, 2 + i);
		// 	cube.castShadow = true;
		// 	const CubeEntity = new Entity();

		// 	CubeEntity.AddComponent(
		// 		new RenderComponent({ model: cube, scene: this.scene }),
		// 		"RenderComponent"
		// 	);
		// 	CubeEntity.AddComponent(new ColliderComponent(), "ColliderComponent");
		// 	CubeEntity.AddComponent(
		// 		new SpatialGridController({ grid: this.hashGrid }),
		// 		"SpatialGridController"
		// 	);
		// 	CubeEntity._RegisterHandler("player.action", (a: any) => {
		// 		console.log(a.action);
		// 	});
		// 	CubeEntity.AddComponent(
		// 		new PhysicsComponent({
		// 			world: this.physicsManager.World,
		// 			mass: 0,
		// 			geometry: geometry,
		// 			material: new CANNON.Material("groundMaterial"),
		// 		}),
		// 		"PhysicsComponent"
		// 	);

		// 	this.entityManager.Add(CubeEntity, "CubeEntitysds+ " + i);
		// 	CubeEntity.SetPosition(new THREE.Vector3(6, 0.1 * i, 2 + i * 0.85));
		// }

		// const cube2 = new THREE.Mesh(geometry, matrial);
		// //	cube.position.set(0, 10, 2);
		// cube.castShadow = true;
		// const CubeEntity2 = new Entity();

		// CubeEntity2.AddComponent(
		// 	new RenderComponent({ model: cube2, scene: this.scene }),
		// 	"RenderComponent"
		// );
		// CubeEntity2.AddComponent(new ColliderComponent(), "ColliderComponent");
		// CubeEntity2.AddComponent(
		// 	new SpatialGridController({ grid: this.hashGrid }),
		// 	"SpatialGridController"
		// );
		// CubeEntity2._RegisterHandler("player.action", (a: any) => {
		// 	console.log(a.action);
		// });
		// CubeEntity2.AddComponent(
		// 	new PhysicsComponent({
		// 		world: this.physicsManager.World,
		// 		mass: 150,
		// 		geometry: geometry,
		// 	}),
		// 	"PhysicsComponent"
		// );

		// this.entityManager.Add(CubeEntity2, "CubeEntity2");

		// CubeEntity2.SetPosition(new THREE.Vector3(0, 15, 3));


		// this.CameraController.StartFollowing(
		// 	CarEntity,
		// 	0.01,

		// 	new THREE.Vector3(0, -1, -1),
		// 	new THREE.Vector3(0, 0, -1)
		// );

		// add stats
		this.stats = Stats();
		document.body.appendChild(this.stats.dom);

		this.loadingManager.LoadPiano().then((piano) => {
			this.scene.add(piano.scene);	
		
		});


		//	this.scene.add(piano);
		

	
		// const gui = new GUI( { width: 300 } );
		// gui.add( parameters, "radius", 0.0, 1.0 );
		// gui.add( parameters, "allowx");
		//gui.domElement.style.visibility = 'hidden';

		// // // // const group = new InteractiveGroup( this.mainController.renderer, this.CameraController.camera );
		// // // // this.mainController.scene.add( group );

		// // // // //
		// // // // const htmlelement = document.createElement( "div" );
		// // // // htmlelement.style.width = "1000px";
		// // // // htmlelement.style.height = "1000px";
		// // // // htmlelement.style.background = "rgba(255,255,255,0.5)";
		// // // // htmlelement.style.border = "1px solid #000";
		// // // // htmlelement.style.borderRadius = "10px";
		// // // // //piick a random pic from unsplash
		// // // // //htmlelement.style.backgroundImage = `url(https://source.unsplash.com/random/100x100?sig=${Math.random()})`;

		// // // // const mesh = new HTMLMesh( htmlelement );
		// // // // mesh.position.x = 0;
		// // // // mesh.position.y = 0;
		// // // // mesh.position.z = 0;

		// // // // //mesh.rotation.y = Math.PI / 4;
		// // // // mesh.scale.setScalar( 2 );
		// // // // group.add( mesh );

		// //	create box colliders

		// setTimeout(() => {
		// 	for (let i = 0; i < 120; i++) {
		// 		const geometry = new THREE.SphereGeometry(
		// 			Math.random() * 1 + 1,
		// 			32,
		// 			32
		// 		);
		// 		//create random material
		// 		const matrial = new THREE.MeshStandardMaterial({
		// 			color: Math.random() * 0xffffff,
		// 			roughness: Math.random(),
		// 			metalness: Math.random(),
		// 			emissive: Math.random() * 0xffffff,
		// 			emissiveIntensity: Math.random(),
		// 		});
		// 		const spherex = new THREE.Mesh(geometry, matrial);
		// 		spherex.castShadow = true;
		// 		const SphereEntityx = new Entity();

		// 		SphereEntityx.AddComponent(
		// 			new RenderComponent({ model: spherex, scene: this.scene }),
		// 			"RenderComponent"
		// 		);
		// 		SphereEntityx.AddComponent(
		// 			new ColliderComponent(),
		// 			"ColliderComponent"
		// 		);
		// 		SphereEntityx.AddComponent(
		// 			new SpatialGridController({ grid: this.hashGrid }),
		// 			"SpatialGridController"
		// 		);
		// 		SphereEntityx.AddComponent(
		// 			new PhysicsComponent({
		// 				world: this.physicsManager.World,
		// 				geometry: geometry,
		// 				mass: Math.random() * 2 + 0.2,
		// 			}),

		// 			"PhysicsComponent"
		// 		);

		// 		this.entityManager.Add(SphereEntityx, "SphereEntity2" + i);

		// 		SphereEntityx.SetPosition(
		// 			new THREE.Vector3(
		// 				Math.random() * 250 + 15,
		// 				Math.random() * 250 + 70,
		// 				Math.random() * 650
		// 			)
		// 		);
		// 	}
		// }, 20000);

		this.RAF();
	}
	RAF() {
		const dt = this.clock.getDelta();
		this.stats.update();
		this.CameraController.Update(dt);
		this.mainController.Update(dt);
		this.entityManager.Update(dt);
		this.physicsManager.Update(dt);
		//this.PhysicsDebugRenderer.update();
		this.mouseCursorController.Update(dt);
		/* #region  controld for debb */
		if (this.stinput.released("w")) {
			console.log(this.entityManager._entitiesMap);

			const player2 = this.entityManager.Get("ybotEntityNumber2") as Entity;
			if (player2) {
				player2.SetDead();
			}

			// console.log('camera look at : ', this.camera.lookAt)
		}

		if (this.stinput.released("i")) {
			for (let i = 0; i < 10; i++) {
				//create a cube with random position and sizes entities
				const matrial = new THREE.MeshStandardMaterial({
					color: Math.random() * 0xffffff,
					roughness: Math.random(),
					metalness: Math.random(),
					emissive: Math.random() * 0xffffff,
					emissiveIntensity: Math.random(),
				});
				const geometry = new THREE.BoxGeometry(
					Math.random() * 20,
					Math.random() * 10,
					Math.random() * 33
				);
				const cubex = new THREE.Mesh(geometry, matrial);
				//	cube.position.set(0, 10, 2);
				cubex.castShadow = true;
				const CubeEntityx = new Entity();

				CubeEntityx.AddComponent(
					new RenderComponent({ model: cubex, scene: this.scene }),
					"RenderComponent"
				);
				// CubeEntityx.AddComponent(new ColliderComponent(), "ColliderComponent");
				// CubeEntityx.AddComponent(
				// 	new SpatialGridController({ grid: this.hashGrid }),
				// 	"SpatialGridController"
				// );

				CubeEntityx.AddComponent(
					new PhysicsComponent({
						world: this.physicsManager.World,
						geometry: geometry,
						mass: 9,
						matrial: matrial,
					}),
					"PhysicsComponent"
				);

				this.entityManager.Add(CubeEntityx, "CubeEntity2" + i);

				// CubeEntityx.SetPosition(
				// 	new THREE.Vector3(
				// 		Math.random() * 250,
				// 		Math.random() * 0,
				// 		Math.random() * 150
				// 	)
				// );

				//MAKE STAIRCASE
				CubeEntityx.SetPosition(new THREE.Vector3(i * 15.5, 6, i * 10));

				// //attach a lightt to the cube
				// const light = new THREE.PointLight(0xffffff, 1, 100);
				// light.position.set(
				// 	CubeEntityx.Position.x,
				// 	CubeEntityx.Position.y,
				// 	CubeEntityx.Position.z
				// );
				// light.castShadow = true;
				// if (Math.random() > 0.95) {
				// 	this.scene.add(light);
				// }
			}
		}
		if (this.stinput.released("c")) {
			const Car= this.spawnerManager.SpawnCar({
				name: "Car",
				position: new THREE.Vector3(0, 4, 0),
			});
		//	Car.AddComponent(new TitleBarComponent(), "TitleBarComponent");

		}
		if (this.stinput.released("r")) {
			//get car entity position
			const carEntity = this.entityManager.Get("CarEntity") as Entity;
			if (carEntity) {
				// // 			//create a html element to hold the gui
				// // const guiel = document.createElement("div");
				// // guiel.id = "guiel";
				// // guiel.style.position = "absolute";
				// // guiel.style.top = "0px";
				// // guiel.style.left = "0px";
				// // guiel.style.width = "500px";
				// // guiel.style.height = "500px";
				// // guiel.style.backgroundColor = "rgba(0,0,0,0.5)";
				// // guiel.style.color = "white";
				// // guiel.style.padding = "10px";
				// // guiel.style.pointerEvents = "auto";
				// // const CSS2DLabel = new CSS2DObject(guiel);
				// // carEntity.Mesh.add(CSS2DLabel);

				//reset rotation
				carEntity.SetQuaternion(new THREE.Quaternion());
				carEntity.SetPosition(
					new THREE.Vector3(carEntity.Position.x, 5, carEntity.Position.z)
				);
				let a = carEntity.GetComponent(
					"CarPhysicsComponent"
				) as CarPhysicsComponent;
				a.body.angularVelocity.set(0, 0, 0);
				a.body.velocity.set(0, 0, 0);
			}
		}

		if (this.stinput.released("t")) {
			//get conainer
			//const container = document.getElementById("customGUI");
			const container = document.getElementById("guiel");
			if (container) {
				const gui = new GUI({ container: container });
				//const gui = new GUI({ container: guiel });
				const vector = new THREE.Vector3(0, 0, 0);
				const offsetVector = {
					x: this.CameraController.idealOffset.x,
					y: this.CameraController.idealOffset.y,
					z: this.CameraController.idealOffset.z,
				};
				const lookAtVector = {
					x: this.CameraController.idealLookat.x,
					y: this.CameraController.idealLookat.y,
					z: this.CameraController.idealLookat.z,
				};

				//	const gui = new GUI({ width: 300 });

				const obj = {
					myBoolean: true,
					myString: "lil-gui",
					myNumber: 1,
					myFunction: function () {
						alert("hi");
					},
				};

				gui.add(obj, "myBoolean"); // checkbox
				gui.add(obj, "myString"); // text field
				gui.add(obj, "myNumber"); // number field
				gui.add(obj, "myFunction"); // button
			}
			// top level controller
			// gui.add(offsetVector, "offsetVector", 0, 1);
			// gui.add(lookAtVector, "lookAtVector", 0, 1);
			// const folder = gui.addFolder("offsetVector");

			// folder.add(offsetVector, "x");
			// folder.add(offsetVector, "y");
			// folder.add(offsetVector, "z");

			// const folder2 = gui.addFolder("lookAtVector");

			// folder2.add(lookAtVector, "x");
			// folder2.add(lookAtVector, "y");
			// folder2.add(lookAtVector, "z");

			// const folder3 = gui.addFolder("OrbitControl");

			// const myObject = {
			// 	orbitControloi: false,
			// 	String: "Hello",
			// 	Number: 0.5,
			// 	Number2: 0.5,
			// };
			// folder3.add(myObject, "orbitControloi");
			// folder3.add(myObject, "String");
			// folder3.add(myObject, "Number", 0, 1);
			// folder3.add(myObject, "Number2", 0, 1);

			// // nested controllers
			// const folder = gui.addFolder("Position");
			// folder.add(obj, "x");
			// folder.add(obj, "y");
			// folder.add(obj, "z");
			// const myObject = {
			// 	myBoolean: true,
			// 	myFunction: function () {
			// 		window.alert("Hello!");
			// 	},
			// 	myString: "lil-gui",
			// 	offset_x: 1,
			// 	offset_y: 1,
			// 	offset_z: 1,

			// 	lookat_x: 1,
			// 	lookat_y: 1,
			// 	lookat_z: 1,
			// };

			// gui.add(myObject, "myBoolean"); // Checkbox
			// gui.add(myObject, "myFunction"); // Button
			// gui.add(myObject, "myString"); // Text Field
			// gui.add(myObject, "offset_x"); // Number Field
			// gui.add(myObject, "offset_y"); // Number Field
			// gui.add(myObject, "offset_z"); // Number Field

			// gui.add(myObject, "lookat_x"); // Number Field
			// gui.add(myObject, "lookat_y"); // Number Field
			// gui.add(myObject, "lookat_z"); // Number Field

			// // // Add sliders to number fields by passing min and max
			// // gui.add(myObject, "myNumber", 0, 1);
			// // gui.add(myObject, "myNumber", 0, 100, 2); // snap to even numbers

			// // // Create dropdowns by passing an array or object of named values
			// // gui.add(myObject, "myNumber", [0, 1, 2]);
			// // gui.add(myObject, "myNumber", { Label1: 0, Label2: 1, Label3: 2 });
			// gui.onChange((value) => {
			// 	//this.CameraController.DisableOrbitControls();

			// 	this.CameraController.SetView(
			// 		new THREE.Vector3(
			// 			myObject.offset_x,
			// 			myObject.offset_y,
			// 			myObject.offset_z
			// 		),
			// 		new THREE.Vector3(
			// 			myObject.lookat_x,
			// 			myObject.lookat_y,
			// 			myObject.lookat_z
			// 		)
			// 	);
			// 	console.log(value);
			// 	//	this.CameraController.
			// });
			//this.CameraController.EnableOrbitControls();
			// 	.add(myObject, "myProperty")
			// 	.name("Custom Name")
			// 	.onChange((value) => {
			// 		console.log(value);
			// 	});

			// Create color pickers for multiple color formats
			// const colorFormats = {
			// 	string: "#ffffff",
			// 	int: 0xffffff,
			// 	object: { r: 1, g: 1, b: 1 },
			// 	array: [1, 1, 1],
			// };

			// gui.addColor(colorFormats, "string");
			//}
		}
		if (this.stinput.released("u")) {
			this.mainController.UnsetTargetEntity();

			// console.log('camera look at : ', this.camera.lookAt)
		}
		if (this.stinput.released("x")) {
			const player2 = this.entityManager.Get("ybotEntityNumber2") as Entity;
			console.log(player2);
			if (player2) {
				player2.RemoveComponent("TitleBarComponent");
			}

			//remove all cube entities
			for (let i = 0; i < 50; i++) {
				const cube = this.entityManager.Get("CubeEntity2" + i) as Entity;
				if (cube) {
					cube.SetDead();
				}
			}
		}

		if (this.stinput.released("y")) {
			console.log(this.mainController.activeEntities);
		}

		if (this.stinput.released("t")) {
			for (const entity of this.mainController.activeEntities) {
				const characterController = entity.GetComponent("CharacterController");
				if (characterController) {
					characterController.Parent.SetDead();
				}
			}
			console.log(this.scene);
			console.log(this.entityManager);
			console.log(this.mainController.activeEntities);
		}
		if (this.stinput.released("r")) {
			console.log(this.mainController.activeEntities);
			this.networkManager.Disconnect();
			//	console.log("id", this.id);
			//	this.socket.emit("update", { t: this.id, p: "boom", r: "rotaion" });
		}
		if (this.stinput.released("e")) {
			this.networkManager.Connect();

			// const params = {
			// 	model: this.loadingManager.GetRawModel(),
			// 	animations: this.loadingManager.GetAnimations(),
			// 	scene: this.scene,
			// };
			// const NetworkPlayer = new Entity();
			// NetworkPlayer.AddComponent(new CharacterController(params));
			// NetworkPlayer.AddComponent(new TitleBarComponent());
			// NetworkPlayer.AddComponent(new ColliderComponent());
			// NetworkPlayer.AddComponent(
			// 	new SpatialGridController({ grid: this.hashGrid })
			// );
			// NetworkPlayer.AddComponent(
			// 	new NetworkPlayerController(this.networkManager)
			// );

			// this.entityManager.Add(NetworkPlayer, "NetworkPlayer");
			// NetworkPlayer.SetPosition(new THREE.Vector3(0, 0, 6));
			// this.mainController.SetTargetEntity(NetworkPlayer);

			// NetworkPlayer.GetComponent("NetworkPlayerController").OnLoaded_();
			// this.networkManager.onDisconnect = () => {
			// 	NetworkPlayer.SetDead();
			// };
			//	console.log("id", this.id);
			//	this.socket.emit("update", { t: this.id, p: "boom", r: "rotaion" });
		}

		if (this.stinput.released("y")) {
			const comp=this.mainController.targetEntity.GetComponent("PhysicalCharacterController") as PhysicalCharacterController;
			if (comp) {
				this.mainController.gizmo.attach( comp.group_);
				//comp.SetVelocity(new THREE.Vector3(0, 0, 0));
			}
			// this.mainController.gizmo.addEventListener( "dragging-changed", function ( event ) {
			// 	this.mainController.targetEntity.Position = this.mainController.gizmo.position;
			// //	comp.body.sleep();

			// } );
			

			
			

			// this.CameraController.SetView(
			// 	new THREE.Vector3(0, 0, 0),
			// 	new THREE.Vector3(0, 10, 0)
			// );
	//		this.stinput.dispose();
		}

		if (this.stinput.released("f")) {
			//check if entity is player or car
			if (
				this.mainController.targetEntity?.GetComponent(
					"PhysicalCharacterController"  
				)|| this.mainController.targetEntity?.GetComponent("CharacterController")

 
			) {
				this.CameraController.StartFollowing(
					this.mainController.targetEntity,
					0.05,
					new THREE.Vector3(0, 1, -3),
					new THREE.Vector3(0, 1, 0)
				);
			} else if (
				this.mainController.targetEntity?.GetComponent("CarPhysicsComponent")
			) {
				// this.CameraController.StartFollowingCar(
				// 	this.mainController.targetEntity,
				// 	0.005,
				// 	new THREE.Vector3(
				// 		0,
				// 		3,
				// 		-3
				// 	),
				// 	new THREE.Vector3(0, 0, 1),
				// 	new THREE.Spherical(
				// 		120.687999999523157,
				// 		1.5151088298577422,
				// 		-3.89
				// 	)

				// );
				this.CameraController.StartFollowingCar(
					this.mainController.targetEntity,
					0.01,
					new THREE.Vector3(8,5,0),
					new THREE.Vector3(-10, 0, 0),
					new THREE.Spherical(5, 0, 0)
				);
			}
		}

		if (this.stinput.released("v")) {
			this.CameraController.StopFollowing();
		}

		if (this.stinput.released("g")) {
		}
		if (this.stinput.released("w")) {
			//load a new model
			const gltfLoader = new GLTFLoader();
			gltfLoader.load(
				"./models/NewGallery/scene.gltf",
				(gltf) => {
					this.scene.add(gltf.scene);
					gltf.scene.position.set(4, 0, 4);
					gltf.scene.scale.set(10, 10, 10);
					gltf.scene.rotation.set(0, 0, 0);
					gltf.scene.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							child.castShadow = false;
							child.receiveShadow = true;
						}
					});
				},
				(xhr) => {
					console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
				}
			);
		}
		if (this.stinput.released("a")) {
			console.log(this.networkManager.isConnected);
			const params = {
				name: "Onlineplayer" + this.networkManager.id,
				net: this.networkManager,
				color: 0xfff000,
				position: new THREE.Vector3(0, 0, 6),
			};

			this.spawnerManager.spawnOnlinePlayer(params);
		}

		if (this.stinput.pressed("n9")) {
			if (this.networkManager.isConnected) {
				this.networkManager.SendChatMessage(
					"hello from " + this.networkManager.id
				);
			}
		}

		if (this.stinput.released("l")) {
			/* #region  set params */
			const names = [
				"John",
				"Harry",
				"Mark",
				"Tom",
				"Bob",
				"Sam",
				"Jack",
				"Joe",
				"Peter",
				"Theo",
				"Paul",
			];
	

				

			const colors = [
				//red
				0xff0000,
				//green
				0x00ff00,
				//blue
				0x0000ff,
				//yellow
				0xffff00,
				//purple
				0xff00ff,
				//cyan
				0x00ffff,
				//white
				0xffffff,
				//black
				0x000000,
				//brown
				0x8b4513,
				//orange
				0xffa500,
				//grey
				0x808080,
			];

			//pick a random color
			const color = colors[Math.floor(Math.random() * colors.length)];

			const _isCharacter = (c) => {
				const co = c.GetComponent("PhysicalCharacterController");
				if (co) {
					return true;
				}
			};
			// get entities with CharacterControllerComponent
			const usedNames = this.entityManager
				.Filter(_isCharacter)
				.map((c) => c.Name);
			//fliter out the names  that are already used
			const unchosenNames = names.filter(function (itm) {
				return usedNames.indexOf(itm) == -1;
			});
			//  pick a random name from the list
			const randomUniqueName =
				unchosenNames[Math.floor(Math.random() * unchosenNames.length)];
			//create a new player with the random name
			//  const params = { name: randomUniqueName, existingAnimations: this.player.GetAnimations(), existingModel: clone, game: this }

			const params = {
				model: this.loadingManager.GetColoredModel(color),
				animations: this.loadingManager.GetAnimations(),
				scene: this.scene,
			};
			//pick normal integer position vector  with x and y between -10 and 10
			const random = Math.floor(Math.random() * (10 - -10 + 1)) + -10;
			const random3 = Math.floor(Math.random() * (10 - -10 + 1)) + -10;
			const position = new THREE.Vector3(random, 0, random3);

			/* #endregion */
			const char = this.spawnerManager.CreatePhysicalCharacter({
				color: color,
				name: randomUniqueName,
				position: position,
			});

		

			// char.AddComponent(
			// 	new PhysicsComponentForCharacters({
			// 		world: this.physicsManager.World,
			// 		input: this.stinput,
			// 		mass: 2,
			// 	}), "PhysicsComponentForCharacters"
			// );
		}
		/* #endregion */

		this.stinput.endFrame();

		requestAnimationFrame(() => this.RAF());
	}

	// addJoystick(player: Player) {
	// 	// eslint-disable-next-line @typescript-eslint/no-this-alias
	// 	const game = this;
	// 	if (this.joystick) {
	// 		this.joystick.destroy();
	// 	}
	// 	document.getElementById("joystickWrapper1")!.style.display = "block";
	// 	const options = {
	// 		zone: document.getElementById("joystickWrapper1"),
	// 		size: 120,
	// 		multitouch: true,
	// 		maxNumberOfNipples: 2,
	// 		mode: "static",
	// 		restJoystick: true,
	// 		shape: "circle",
	// 		// position: { top: 20, left: 20 },
	// 		position: { top: "60px", left: "60px" },
	// 		dynamicPage: true,
	// 	};

	// 	// eslint-disable-next-line @typescript-eslint/no-var-requires
	// 	this.joystick = require("nipplejs").create(options);
	// 	game.LeftNippleAdded = true;
	// 	this.joystick.on("move", function (evt: any, data: any) {
	// 		player.playerControlNipple(data.vector.y, data.vector.x);
	// 	});
	// 	this.joystick.on("end", function (evt: any, data: any) {
	// 		player.playerControlNipple(0, 0);
	// 		// player.setaction('Idle')
	// 		//player.FSMservice.send('STOP_TURNING')
	// 		//player.FSMservice.send("STOP");
	// 	});
	// }

	// followCharacter(character: THREE.Object3D, elapsedTime: number) {
	// 	const idealOffset = new THREE.Vector3(-0, 5, -15);
	// 	idealOffset.applyQuaternion(character.quaternion);
	// 	idealOffset.add(character.position);

	// 	const idealLookat = new THREE.Vector3(0, 5, 10);
	// 	idealLookat.applyQuaternion(character.quaternion);
	// 	idealLookat.add(character.position);

	// 	const t = 1.0 - Math.pow(0.21, elapsedTime);

	// 	this.controls.target.set(
	// 		this.player.threedObject.position.x,
	// 		this.player.threedObject.position.y,
	// 		this.player.threedObject.position.z
	// 	);

	// 	this.birdCam.position.lerp(idealOffset, t);
	// }

	// animate() {
	//     const game = this

	//     this.controls.update()
	//  //   this.UpdateOrbitControls(dt)
	//     TWEEN.update()
	//     this.effectComposer.render()
	//     this.CSS2DRenderer.render(this.scene, this.camera)

	// //    var a = this.player.renderer
	//   //  if (a){
	//     //    a.render(this.scene,  this.player.camera)

	//   //  }

	//     //   this.renderer.render(this.scene, this.camera)

	//     if (this.stinput.released('m')) {
	//         //this.player.init()
	//         // this.scene.add(this.player.ybotMesh)
	//         console.log(
	//             'Camera position  : ',
	//             this.camera.position.x + ' ' + this.camera.position.y + ' ' + this.camera.position.z
	//         )
	//         console.log('camera look at : ', this.camera.lookAt)
	//     }
	//     if (this.stinput.released('i')) {
	//     }
	//     if (this.stinput.released('r')) {
	//         this.renderPass.enabled = !this.renderPass.enabled
	//         //this.player.service.send("RUN");
	//         //this.setaction('Running')
	//         // game.ybot.animations["Walking"].play()
	//     }
	//     if (this.stinput.released('t')) {
	//         // this.setaction('Turning')
	//         // game.ybot.animations["Walking"].play()
	//     }
	//     if (this.stinput.released('l')) {
	//         //var yclassybot = this.player.GetModel()

	//     //   var a= yclassybot.getObjectByName("CSS2DLabel")
	//     //   console.log(a)
	//        //  yclassybot.clear()
	//        //yclassybot.remove(...yclassybot.children)
	//     //    this.scene.add(yclassybot)
	//        // this.scene.add(yclassybot)
	//      //   console.log(this.scene)
	//         this.scene.add(this.player.threedObject)
	//         this.player.ToggleLabel()
	//         // this.player.threedObject.animations['Turn'].play()
	//         this.outlinePass.selectedObjects = [this.player.threedObject]
	//         const clone = SkeletonUtils.clone(this.player.GetModel())
	//         //console.log(this.player.GetAnimations())
	//         //var animationclones = structuredClone(this.player.GetAnimations());
	//         //pick a random variable between   3 and 16
	//         var random = Math.floor(Math.random() * (36 - 3 + 1)) + 3
	//         // create a list of random names
	//         var names = [
	//             'John',
	//             'Harry',
	//             'Mark',
	//             'Tom',
	//             'Bob',
	//             'Sam',
	//             'Jack',
	//             'Joe',
	//             'Peter',
	//             'Theo',
	//             'Paul',
	//         ]
	//         //get the names of already used names inside playersArray
	//         var usedNames = this.playersArray.map(function (player) {
	//             return player.name
	//         })
	//         var unchosenNames = names.filter(function (itm) {
	//             return usedNames.indexOf(itm) == -1
	//         })
	//         //  pick a random name from the list
	//         var randomUniqueName = unchosenNames[Math.floor(Math.random() * unchosenNames.length)]

	//         if (randomUniqueName == undefined) {
	//             window.alert('No more names left')
	//             randomUniqueName = 'NamelessClone'
	//         }
	//         var params={name:randomUniqueName, existingAnimations:this.player.GetAnimations(), existingModel:clone , game:this }
	//         var newPLayer = new Player(params)

	//         //pick a number btween 5000 and 15000
	//         var random2 = Math.floor(Math.random() * (15000 - 4000 + 1)) + 4000
	//         newPLayer.boredomDelay = random2
	//         console.log(newPLayer.name + ' has patience of ' + newPLayer.boredomDelay)
	//         if (newPLayer.boredomDelay > 9000) {
	//             newPLayer.isLazy = false
	//         }

	//         newPLayer.threedObject.position.set(random, 0, 0)

	//         newPLayer.FSMservice.start()
	//         newPLayer.ToggleLabel()
	//         this.playersArray.push(newPLayer)
	//         console.log(this.playersArray)
	//         this.scene.add(newPLayer.threedObject)
	//         this.outlinePass.selectedObjects.push(newPLayer.threedObject)
	//         this.loadedd = true
	//         //clone the ybot
	//         //     const clone= SkeletonUtils.clone( yclassybot )
	//         //     if (newPLayer == undefined) {
	//         //     newPLayer= new Player("ycloned",clone) //this.player2.GetModel()

	//         //     newPLayer.GetModel().position.x = -10
	//         //     newPLayer.setaction('Punch')
	//         //    // yclassybot.name='yclassybot'

	//         //     this.loadedd=true
	//         //     this.scene.add(yclassybot)
	//         //     this.scene.add(  newPLayer.GetModel())
	//         //     this.outlinePass.selectedObjects = [newPLayer.GetModel()]

	//        // this.addJoystick(this.player)
	//     }
	//     if (this.stinput.released('t')) {
	//         this.player.ToggleLabel()
	//     }
	//     if (this.stinput.released('o')) {
	//         var yclassybott = this.player.GetModel()
	//         const clonet = SkeletonUtils.clone(yclassybott)

	//        // var paramss={name:"SuperClone", existingAnimations:this.player.GetAnimations(), existingModel:clonet , game:this }

	//         var paramss={name: 'Ybot2',existingModel:clonet, existingAnimations:this.player.GetAnimations(), game:this}

	//         const newPLayers = new Player(paramss)

	//         // while (newPLayers.threedObject == undefined) {
	//         //     console.log('waiting for model to load')
	//         // }
	//        // newPLayers.threedObject.position.set(-30, 0, 0)
	//        newPLayers.FSMservice.start()
	//        newPLayers.ToggleLabel()
	//         this.scene.add(newPLayers.threedObject)

	//         this.playersArray.push(newPLayers)

	//     }
	//     if (this.stinput.released('a')) {
	//         this.loadedd = true
	//         this.scene.add(this.player.threedObject)
	//     }
	//     if (this.stinput.released('m')) {
	//         this.loadedd = false
	//         this.scene.remove(this.player.GetModel())
	//     }
	//     if (this.stinput.released('s')) {
	//         this.player.PlayerControlForward(0)
	//         ;
	//         //   this.player.service.send("TOGGLE");
	//     }
	//     if (this.stinput.released('x')) {
	//         this.player.FSMservice.send('ACTION')
	//     }
	//     if (this.stinput.released('u')) {

	//         this.player.FSMservice.start()
	//     }
	//     if (this.stinput.released('w')) {
	//         this.player.FSMservice.send('CANCEL_ACTION')
	//     }

	//     if (this.stinput.shiftDown) {
	//         if (this.stinput.keyDown(this.stinput.KeyboardKeys.z)) {
	//             this.player.PlayerControlForward(0.6)
	//             //  this.player.PlayerControlForward(0.6)
	//         }
	//     }

	//     if (this.stinput.keyDown(this.stinput.KeyboardKeys.z) && !this.stinput.shiftDown) {
	//         //console.log("Walking Normal")
	//         this.player.PlayerControlForward(0.3)
	//     }
	//     if (this.stinput.released('z')) {
	//         this.player.PlayerControlForward(0)
	//     }
	//     if (this.stinput.keyDown(this.stinput.KeyboardKeys.q)) {
	//         this.player.PlayerControlRotation(-0.5)
	//     }
	//     if (this.stinput.keyDown(this.stinput.KeyboardKeys.s)) {
	//         this.player.PlayerControlForward(-0.5)
	//     }
	//     if (this.stinput.keyDown(this.stinput.KeyboardKeys.d)) {
	//         this.player.PlayerControlRotation(0.5)
	//     }

	//     //if q or d are released, stop the rotation
	//     if (this.stinput.released('q') || this.stinput.released('d')) {
	//         this.player.PlayerControlRotation(0)
	//     }

	//     if (this.stinput.released('c')) {
	//         //this.camera.lookAt(this.player.threedObject.position)
	//         M.AutoInit();

	//         let tweenCamPos = new TWEEN.Tween(this.camera.position)
	//             .to(
	//                 {
	//                     x: this.player.threedObject.position.x,
	//                     y: this.player.threedObject.position.y + 2,
	//                     z: this.player.threedObject.position.z + 8,
	//                 },
	//                 3000
	//             )
	//             .onComplete(() => {
	//                 //   this.camera.lookAt(this.player.threedObject.position)
	//             })
	//             .onUpdate(() => {
	//                 this.camera.lookAt(this.player.threedObject.position)
	//                 this.controls.target.set(
	//                     this.player.threedObject.position.x,
	//                     this.player.threedObject.position.y,
	//                     this.player.threedObject.position.z
	//                 )
	//             }) //.repeat(Infinity)
	//             .easing(TWEEN.Easing.Quadratic.InOut)

	//         tweenCamPos.start()
	//         this.freeCam =! this.freeCam
	//     }

	//     if (this.stinput.released('v')) {
	//     var helper = this.player.addVision()
	//     this.scene.add(helper)
	//  //   var canvas = document.getElementById('VisionCanvas')

	//   //  var botvisionrenderer = new THREE.WebGLRenderer({ antialias: true , canvas: canvas})

	//     }
	//     // if (this.player. botvisionrenderer != undefined) {
	//     //     botvisionrenderer.render(this.scene,  this.player.camera)

	//     // }

	//     if (this.loadedd == true) {
	//         // this.controls.target.set(this.player.threedObject.position.x  ,this.player.threedObject.position.y,this.player.threedObject.position.z)

	//         this.player.Update(dt)
	//         if(this.freeCam==true){
	//         this.followCharacter(this.player.threedObject, dt)
	//         }
	//         if (this.player.renderer != undefined ){
	//             this.player.renderer.render(this.scene, this.player.camera)

	//         }

	//         if (this.playersArray.length > 0) {
	//             this.playersArray.forEach((player) => {
	//                 player.Update(dt)
	//             })
	//         }
	//         //         newPLayer?.Update(dt)
	//     }

	//     this.stinput.endFrame()
	//     requestAnimationFrame(() => game.animate())
	// }
}

// 

//
function getFileStats(url: string) {
	let fileBlob;
	fetch(url)
		.then((res) => {
			fileBlob = res.blob();
			return fileBlob;
		})
		.then((fileBlob) => {
			// do something with the result here
			console.log([fileBlob.size, fileBlob.type]);
		});
}
const game = new Game();
