import { Entity } from "./entity";
import * as THREE from "three";
import { OrbitControls } from "../utils/OrbitControls";
import { OrbitControlsGizmo } from "../utils/OrbitControlsGizmo";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";
import { InfiniteGridHelper } from "../utils/InfiniteGridHelper";
import { Sky } from "three/examples/jsm/objects/Sky";
import { CharacterController, CharacterInput } from "./PLayerEntity";
import { EntityManager } from "./EntityManager";
import { SelectionBox } from "../utils/SelectionBox";
import { SelectionHelper } from "../utils/SelectionHelper";
import { Text } from "troika-three-text";
import { BezierMesh } from "troika-three-utils";
import { SimpleOrbitControls } from "../SimpleOrbitControls";
import * as StInput from "../utils/stinput.js";
//import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";
import { CSS3DRenderer } from "../utils/CSS3D";
import { volumineosWebElement } from "./VolumineousWebElement";
import "@mediapipe/hands";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { MediaPipeHandsModelConfig } from "@tensorflow-models/hand-pose-detection/dist/mediapipe/types";
import { CameraController } from "./CameraController";
import { Pane } from "tweakpane";
import { CarInputComponent } from "./CarPhysicsComponent";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import html2canvas from "html2canvas";

const ANCHOR_POINTS = [
	[0, 0, 0],
	[0, 0.1, 0],
	[-0.1, 0, 0],
	[-0.1, -0.1, 0],
];

const fingerLookupIndices = {
	thumb: [0, 1, 2, 3, 4],
	indexFinger: [0, 5, 6, 7, 8],
	middleFinger: [0, 9, 10, 11, 12],
	ringFinger: [0, 13, 14, 15, 16],
	pinky: [0, 17, 18, 19, 20],
}; // for rendering each finger as a polyline

const connections = [
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 4],
	[0, 5],
	[5, 6],
	[6, 7],
	[7, 8],
	[0, 9],
	[9, 10],
	[10, 11],
	[11, 12],
	[0, 13],
	[13, 14],
	[14, 15],
	[15, 16],
	[0, 17],
	[17, 18],
	[18, 19],
	[19, 20],
];

class MainController {
	orbitControls: OrbitControls;
	renderPass: RenderPass;
	birdCam: THREE.PerspectiveCamera;
	effectComposer: EffectComposer;
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	outlinePass: OutlinePass;
	controlsGizmo: OrbitControlsGizmo;
	CSS2DRenderer: CSS2DRenderer;
	timeOfDay = 0;
	sceneries: THREE.Object3D[] = [];
	targetEntity: Entity;
	targetEntitySet: boolean;
	input: StInput;
	followTarget: boolean;
	entityManager: EntityManager;
	activeEntities: Entity[] = [];
	selectionBox: SelectionBox;
	selectionBoxHelper: SelectionHelper;
	htmlOff = false;
	bezier: BezierMesh;
	simpleOrbitControls: SimpleOrbitControls;
	_currentPosition: THREE.Vector3 = new THREE.Vector3();
	_currentLookat: THREE.Vector3 = new THREE.Vector3();
	focusPoint: THREE.Vector3 = new THREE.Vector3();
	tempCam: THREE.PerspectiveCamera;
	cssThreeDScene: THREE.Scene;
	rendererCSS: CSS3DRenderer;
	HDdetector: any;
	video: HTMLVideoElement;
	canvas: HTMLCanvasElement;
	ctx: any;
	CameraController: CameraController;
	worker: Worker;
	gizmo: TransformControls;
	rayHelper: any;
	vobj6: volumineosWebElement;
	vobj7: volumineosWebElement;
	tracking: boolean;
	handsTrackingInterval: NodeJS.Timer;

	constructor(input: StInput) {
		this.input = input;
		this.Initialize();

		this.CreateInitialScene();
		this.ToggleSceneries(1);
	}
	Initialize() {
		const model = handPoseDetection.SupportedModels.MediaPipeHands;
		const detectorConfig = {
			runtime: "mediapipe", // or 'tfjs'
			modelType: "lite",
			solutionPath: "./models/hands",
		} as MediaPipeHandsModelConfig;

		const h = async () => {
			await handPoseDetection
				.createDetector(model, detectorConfig)
				.then((d) => {
					this.HDdetector = d;
				});
		};
		h();
		this.scene = new THREE.Scene();
		this.birdCam = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.01,
			1000
		);

		this.rendererCSS = new CSS3DRenderer();
		this.rendererCSS.domElement.style.position = "absolute";
		this.rendererCSS.domElement.style.transition = "all 5.5s ease";
		this.rendererCSS.domElement.style.top = "0";
		//this.rendererCSS.domElement.style.transform = "scale(2)";
		//@ts-ignore
		//1this.rendererCSS.domElement.style.zoom = "2";
		this.rendererCSS.setSize(window.innerWidth, window.innerHeight);
		this.LQRenderer();
		// this.rendererCSS.domElement.style.position = "absolute";
		// this.rendererCSS.domElement.style.height = "100%";

		// this.rendererCSS.domElement.style.top = "0";
		//document.body.appendChild(this.rendererCSS.domElement);
		//this.rendererCSS.domElement.style.zIndex = "1";

		const css3dcontainer = document.querySelector("#css3d") as HTMLElement;
		if (css3dcontainer) {
			css3dcontainer.appendChild(this.rendererCSS.domElement);
			css3dcontainer.style.zIndex = "1";
		}

		window.addEventListener("resize", this.ResizeRenderer.bind(this));

		//	this.effectComposer = new EffectComposer(this.renderer);
		this.renderPass = new RenderPass(this.scene, this.birdCam);
		//this.effectComposer.addPass(this.renderPass);
		this.outlinePass = new OutlinePass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			this.scene,
			this.birdCam
		);
		//	this.effectComposer.addPass(this.outlinePass);

		this.outlinePass.edgeStrength = 1.8;
		this.outlinePass.edgeGlow = 5.1;
		this.outlinePass.edgeThickness = 1.1;

		this.outlinePass.visibleEdgeColor.set(0x315fff);
		//blue hex = 0x00ff00
		this.outlinePass.hiddenEdgeColor.set(0x415fff);
		this.outlinePass.pulsePeriod = 5;
		this.outlinePass.tempPulseColor1.set(0x00ff00);
		this.birdCam.position.set(-4.5, 3, -5);

		//	this.simpleOrbitControls = new SimpleOrbitControls(this.birdCam);
		// this.controlsGizmo = new OrbitControlsGizmo(this.simpleOrbitControls, {
		// 	size: 100,
		// 	padding: 8,
		// });

		// document.body.appendChild(this.controlsGizmo.domElement);

		this.CSS2DRenderer = new CSS2DRenderer();
		this.CSS2DRenderer.setSize(window.innerWidth, window.innerHeight);
		this.CSS2DRenderer.domElement.style.position = "relative";
		this.CSS2DRenderer.domElement.style.top = "0px";
		this.CSS2DRenderer.domElement.style.pointerEvents = "none";
		this.CSS2DRenderer.domElement.style.zIndex = "3";
		document.body.appendChild(this.CSS2DRenderer.domElement);

		this.selectionBox = new SelectionBox(this.birdCam, this.scene);

		this.cssThreeDScene = new THREE.Scene();
		this.cssThreeDScene.scale.set(0.001, 0.001, 0.001);
		this.cssThreeDScene.updateMatrixWorld(false);
		this.cssThreeDScene.matrixAutoUpdate = false;
		this.cssThreeDScene.matrixWorldNeedsUpdate = false;

		// const css3d = document.getElementById("css3d");
		// if (css3d) {
		// 	css3d.appendChild(this.rendererCSS.domElement);
		// }

		// 		const planeMaterial = new THREE.MeshBasicMaterial();
		// 		planeMaterial.color.set("black");
		// 		planeMaterial.opacity = 0;
		// 		planeMaterial.blending = THREE.NoBlending;
		// 		planeMaterial.transparent = true;
		// 		//planeMaterial.depthWrite = false;
		// 		//planeMaterial.depthTest = false;

		// 		planeMaterial.side = THREE.DoubleSide;
		// 		const planeWidth = 50;
		// 		const planeHeight = 50;
		// 		const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
		// 		const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
		// 		planeMesh.receiveShadow = true;
		// 		planeMesh.castShadow = true;

		// this.gizmo = new TransformControls(this.birdCam, this.renderer.domElement);
		// this.gizmo.domElement.style.pointerEvents = "auto";
		// this.scene.add(this.gizmo);
		// this.gizmo.setSize(0.5);

		// //control = new TransformControls( currentCamera, renderer.domElement );
		// //control.addEventListener( 'change', render );

		// this.gizmo.addEventListener(
		// 	"dragging-changed",
		// 	function (event) {
		// 		if (event.value) {
		// 			this.CameraController.DisableOrbitControls();
		// 		} else {
		// 			this.CameraController.EnableOrbitControls();
		// 		}
		// 	}.bind(this)
		// );
	}

	SetCameraController(val: CameraController) {
		this.CameraController = val;
	}
	ToggleSceneries(a: number) {
		if (a == 1) {
			for (const key in this.sceneries) {
				this.scene.add(this.sceneries[key]);
			}
		} else {
			for (const key in this.sceneries) {
				this.scene.remove(this.sceneries[key]);
			}
		}
	}

	SetTargetEntity(entity: Entity) {
		const _isCharacter = (c: Entity) => {
			const co = c.GetComponent("CharacterInput");
			if (co) {
				return true;
			}
		};
		const _isCar = (c: Entity) => {
			const co = c.GetComponent("CarInputComponent");
			if (co) {
				return true;
			}
		};

		//transfor position to spherical coordinates
		//this.simpleOrbitControls.Position = entity.Position.clone();
		//this.simpleOrbitControls.target = entity.Position.clone().add(new THREE.Vector3(0, 1, 5));
		if (
			entity === this.targetEntity &&
			!this.input.ctrlDown &&
			!this.input.shiftDown
		) {
			console.log("same entity");
			///remove entity from active entities

			this.UnsetTargetEntity();
		} else if (this.input.shiftDown) {
			//if entity is in active entities, remove it
			if (this.activeEntities.indexOf(entity) > -1) {
				this.activeEntities.splice(this.activeEntities.indexOf(entity), 1);

				if (this.outlinePass.selectedObjects.includes(entity._mesh)) {
					this.outlinePass.selectedObjects.splice(
						this.outlinePass.selectedObjects.indexOf(entity._mesh),
						1
					);
				}
				entity.RemoveComponent("CharacterInput");
			} else {
				this.activeEntities.push(entity);

				this.targetEntity = entity;
				this.targetEntity.AddComponent(
					new CharacterInput({ input: this.input }),
					"CharacterInput"
				);

				//check if target entity is already in the outline pass
				if (
					this.outlinePass.selectedObjects.indexOf(this.targetEntity._mesh) ==
					-1
				) {
					this.outlinePass.selectedObjects.push(this.targetEntity._mesh);
				}
			}
			// add
		}
		//else if (this.input.ctrlDown) {
		else {
			//      loop through all entities
			for (const key in this.activeEntities) {
				if (_isCharacter(this.activeEntities[key])) {
					this.activeEntities[key].RemoveComponent("CharacterInput");
					//check if entity mesh is outlined
					if (
						this.outlinePass.selectedObjects.includes(
							this.activeEntities[key].Mesh
						)
					) {
						this.outlinePass.selectedObjects.splice(
							this.outlinePass.selectedObjects.indexOf(
								this.activeEntities[key].Mesh
							),
							1
						);
					}
				} else if (_isCar(this.activeEntities[key])) {
					this.activeEntities[key].RemoveComponent("CarInputComponent");
					//check if entity mesh is outlined
					// if (
					// 	this.outlinePass.selectedObjects.includes(
					// 		this.activeEntities[key].Mesh
					// 	)
					// ) {
					// 	this.outlinePass.selectedObjects.splice(
					// 		this.outlinePass.selectedObjects.indexOf(
					// 			this.activeEntities[key].Mesh
					// 		),
					// 		1
					// 	);
					// }
				}
			}

			this.activeEntities = [];
			this.activeEntities.push(entity);
			this.targetEntity = entity;
			if (this.targetEntity) {
				this.targetEntitySet = true;
				//add character input component to target entity
				//check if entity has input component
				if (this.targetEntity.GetComponent("CarPhysicsComponent") == null) {
					if (this.targetEntity.GetComponent("CharacterInput") == null) {
						this.targetEntity.AddComponent(
							new CharacterInput({ input: this.input }),
							"CharacterInput"
						);
					}
				} else {
					if (this.targetEntity.GetComponent("CarInputComponent") == null) {
						this.targetEntity.AddComponent(
							new CarInputComponent({ input: this.input }),
							"CarInputComponent"
						);
					}
				}
			}
			//check if target entity is already in the outline pass
			if (
				this.outlinePass.selectedObjects.indexOf(this.targetEntity._mesh) == -1
			) {
				this.outlinePass.selectedObjects.push(this.targetEntity._mesh);
			}
		}
	}
	UnsetTargetEntity() {
		if (this.targetEntity) {
			if (this.targetEntitySet) {
				this.targetEntitySet = false;

				if (this.targetEntity.GetComponent("CharacterInput") != null) {
					this.targetEntity.RemoveComponent("CharacterInput");
				} else if (
					this.targetEntity.GetComponent("CarInputComponent") != null
				) {
					this.targetEntity.RemoveComponent("CarInputComponent");
					//window.alert("car removed");
				}

				if (this.targetEntity._mesh) {
					if (
						this.outlinePass.selectedObjects.indexOf(this.targetEntity._mesh) !=
						-1
					) {
						this.outlinePass.selectedObjects.splice(
							this.outlinePass.selectedObjects.indexOf(this.targetEntity._mesh)
						);
					}
				}
				//remove target entity from active entities
				if (this.activeEntities.indexOf(this.targetEntity) != -1) {
					this.activeEntities.splice(
						this.activeEntities.indexOf(this.targetEntity),
						1
					);
				}
				this.targetEntity = null;
			}
		} else {
			this.targetEntitySet = false;
		}
		//remove target entity from outline pass
		//check if target entity is already in the outline pass
	}

	CreateInitialScene() {
		// Create:
		this.bezier = new BezierMesh();
		this.bezier.pointA.set(-0.3, 0.4, -0.3);
		this.bezier.controlA.set(0.7, 0.6, 0.4);
		this.bezier.controlB.set(-0.6, 1.2, -0.6);
		this.bezier.pointB.set(0.7, 0, -0.7);
		this.bezier.radius = 0.01;

		const mat = new THREE.MeshStandardMaterial({
			color: 0x99f5ff,
			side: THREE.DoubleSide,
		});
		this.bezier.material = mat;
		this.scene.add(this.bezier);
		const myText = new Text();
		myText.position.z = -2;
		myText.position.x = 2;
		myText.position.y = 15
		myText.text = "this is a an early alpha version of the game engine \n";
		myText.text += " press L to spawn local physical entity, you can then press f to follow it and move it using zqsd\n";
		myText.text += " press v to return to bird eye view where you control scene with left and right mouse\n";
		myText.text += "you can press i to generate some cubes and push them\n";
		myText.text += "you can select multiple entities by middle mouse drack and selecting\n";
		myText.text += " type 8  (not numpad the other 8) to add css3d elements and then 9 to start the renderer.\n";
		myText.text += " type m to start processing video to hand pose\n";


		myText.text += " press c to spawn physics car ; click on its name to ignite; then zqsd \n";

		myText.text += " to interact : type e to connect ws server , then a to spwan a network player\n";
		myText.text += " to interact : middle mouse click and drag to select entities\n";
		myText.text += " to interact : left mouse click and drag to move camera\n";
		myText.text += " to interact : right mouse click and drag to rotate camera\n";
		myText.text += " to interact : type zqsd to move after selecting an entity\n";
 		myText.fontSize = 2;
		myText.color = 0x000000;
		myText.sync();
		this.scene.add(myText);
		//to
		//loop to 100 and create random text at random position
		// for (let i = 0; i < 10; i++) {
		// 	const myText = new Text();
		// 	myText.position.z = Math.random() * 100 - 50;
		// 	myText.position.x = Math.random() * 100 - 50;
		// 	myText.position.y = Math.random() * 100 - 50;
		// 	myText.text = Math.random().toString(36).substring(7);
		// 	myText.color = Math.random() * 0xffffff;
		// 	myText.fontSize = Math.random() * 2 + 0.5;
		// 	myText.sync();

		// 	this.scene.add(myText);

		// 	const bezier = new BezierMesh();
		// 	bezier.pointA.set(
		// 		myText.position.x,
		// 		myText.position.y,
		// 		myText.position.z
		// 	);
		// 	bezier.pointB.set(
		// 		myText.position.x + Math.random() * 100 - 5,
		// 		myText.position.y + Math.random() * 100 - 5,
		// 		myText.position.z + Math.random() * 100 - 5
		// 	);
		// 	bezier.radius = 0.05;
		// 	bezier.material = mat;
		// 	this.scene.add(bezier);
		// }
		// // Set properties to configure:
		// myText.text = " npx npm-check-updates -u";
		// myText.fontSize = 1.2;
		// myText.color = 0x9966ff;

		// // Update the rendering:
		// myText.sync();

		const fog = new THREE.Fog(0xa0a0a0, 50, 900);
		//this.scene.background = new THREE.Color(0xa0a0a0);
		this.scene.fog = fog;

		const axesHelper = new THREE.AxesHelper(5);
		axesHelper.position.set(0, 0.001, 0);
		//this.sceneries["axesHelper"] = axesHelper;

		const color = new THREE.Color("Grey");
		//  this.grid = new THREE.GridHelper(3000, 3000,'#bd303085', 160000,  axes = 'xzy')
		const infiniteGridHelper = new InfiniteGridHelper(2, 20, color, 500, "xyz");
		infiniteGridHelper.position.set(0, 0, 100);
		const infiniteGridHelper2 = new InfiniteGridHelper(
			2,
			20,
			color,
			500,
			"xzy"
		);
		const infiniteGridHelper3 = new InfiniteGridHelper(
			2,
			20,
			color,
			500,
			"yxz"
		);

		const infiniteGridHelper4 = new InfiniteGridHelper(
			2,
			20,
			color,
			500,
			"zyx"
		);

		//create infinite grid consisting of 1000 layerts of infinite grid helpers stacked on top of each other
		// for (let i = 0; i < 15; i++) {
		// 	const infiniteGridHelpera = new InfiniteGridHelper(
		// 		2,
		// 		20,
		// 		color,
		// 		200,
		// 		"xyz"
		// 	);
		// 	const infiniteGridHelperb = new InfiniteGridHelper(
		// 		2,
		// 		20,
		// 		color,
		// 		200,
		// 		"xzy"
		// 	);
		// 	//infiniteGridHelper.position.set(0, 0,  i * 20);
		// 	infiniteGridHelperb.position.set(0,  i * 100 * i, 0 );
		// 	infiniteGridHelpera.position.set(0, 0,  i * 400 * i);
		// 	this.sceneries[ "infiniteGridHelpera" + i] = infiniteGridHelpera;
		// 	this.sceneries[ "infiniteGridHelperb" + i] = infiniteGridHelperb;
		// }

		infiniteGridHelper3.position.set(0, 0, 0);
		infiniteGridHelper4.position.set(100, 0, 100);
		//infiniteGridHelper4.rotation.set(0, 90, 0);

		this.sceneries["infiniteGridHelper"] = infiniteGridHelper;
		this.sceneries["infiniteGridHelper2"] = infiniteGridHelper2;
		//this.sceneries["infiniteGridHelper3"] = infiniteGridHelper3;
		this.sceneries["infiniteGridHelper4"] = infiniteGridHelper4;

		const slowRoadss = document.createElement("div");
		slowRoadss.style.width = 1000 + "px";
		slowRoadss.style.height = 1000 + "px";
		const image = document.createElement("img") as HTMLImageElement;
		image.src =
			"https://ik.imagekit.io/qov74nz2x/gifs/20221110001318.gif?ik-sdk-version=javascript-1.4.3&updatedAt=1668122427977lf_v";
		image.style.width = "100%";
		image.style.height = "100%";

		// fetch(
		// 	`https://api.allorigins.win/get?url=${encodeURIComponent(
		// 		"https://ik.imagekit.io/qov74nz2x/gifs/20221110001318.gif?ik-sdk-version=javascript-1.4.3&updatedAt=1668122427977"
		// 	)}`
		// )
		// 	.then((response) => {
		// 		if (response.ok) return response.json();
		// 		throw new Error("Network response was not ok.");
		// 	})
		// 	.then((data) => {
		// 		slowRoadss.id = "slowRoads";

		// 		slowRoadss.style.width = "1500px";
		// 		slowRoadss.style.height = "1000px";

		// 		slowRoadss.innerHTML = data;
		// 		console.log(data.contents);
		// 	})
		// 	.catch((error) =>
		// 		console.error(
		// 			"There has been a problem with your fetch operation:",
		// 			error
		// 		)
		// 	);
		slowRoadss.appendChild(image);
		//<img src="http://i.stack.imgur.com/SBv4T.gif" alt="this slowpoke moves"  width="250" />

		const parme = {
			scene: this.scene,
			html: slowRoadss,
			cssScene: this.cssThreeDScene,
			CameraController: this.CameraController,
		};
		//const vobj5 = new volumineosWebElement(parme);
		// vobj5.Sticky = true;
		// //place the element in the scene at a random position
		// // vobj5.position.x = Math.random() * 80 - 6;
		// // vobj5.position.y = Math.random() * 80 + 50;
		// // vobj5.position.z = Math.random() * 80 + 60;

		// vobj5.Position = new THREE.Vector3(0, 1, 5);
		// vobj5.Scale = new THREE.Vector3(5, 5, 1);
		// vobj5.setAll();

		// this.scene.add(infiniteGridHelper);
		// this.scene.add(infiniteGridHelper2);

		//document.body.appendChild(this.renderer.domElement)
		//Hemi Light
		const hemiLight = new THREE.HemisphereLight("#ffffff", "#500bfd");
		hemiLight.position.set(0, 100, 0);
		this.sceneries["hemiLight"] = hemiLight;

		//light
		const light = new THREE.DirectionalLight(0xffffff);
		light.position.set(0, 25, 10);
		light.castShadow = true;
		light.shadow.camera.top = 200;
		light.shadow.camera.bottom = -100;
		light.shadow.camera.left = -120;
		light.shadow.camera.right = 120;
		light.shadow.mapSize.set(4096, 4096);
		this.sceneries["light"] = light;

		//ground
		const planeGeometry = new THREE.PlaneGeometry(800, 800);
		const ground = new THREE.Mesh(
			planeGeometry,
			new THREE.MeshPhongMaterial({
				color: "#636363",
				transparent: true,
				opacity: 0.1,
				side: THREE.DoubleSide,
			})
		);
		ground.rotation.x = -Math.PI / 2;
		ground.receiveShadow = true;
		ground.position.y = 0;

		//this.sceneries["ground"] = ground;

		const planeGeometry2 = new THREE.PlaneGeometry(800, 800);
		const ground2 = new THREE.Mesh(
			planeGeometry2,
			new THREE.MeshPhongMaterial({
				color: "#636363",
				transparent: true,
				opacity: 0.1,
				side: THREE.DoubleSide,
			})
		);

		//ground2.rotation.y = Math.PI / 2;
		// ground2.rotation.x = Math.PI / 4;
		// ground2.rotation.z = Math.PI / 4;

		//ground2.rotation.z = -Math.PI / 4;

		ground2.receiveShadow = true;
		ground2.position.y = 0;
		//this.sceneries["ground2"] = ground2;

		const ambient = new THREE.AmbientLight(0x444444);
		//this.sceneries["ambient"] = ambient;

		// this.scene.add(ambient)
		// this.scene.add(axesHelper)
		// this.scene.add(hemiLight)
		// this.scene.add(ground)

		const light1 = new THREE.SpotLight();
		light1.position.set(2.5, 4, 5);
		light1.angle = Math.PI / 4;
		light1.penumbra = 0.5;
		light1.castShadow = true;
		light1.shadow.mapSize.width = 1024 * 2;
		light1.shadow.mapSize.height = 1024 * 2;
		light1.shadow.camera.near = 0.05;
		light1.shadow.camera.far = 200;
		//this.sceneries["light1"] = light1;

		// this.scene.add(light1)

		document.getElementById("joystickWrapper1")!.style.display = "none";
		//const sky = new Sky();
		//sky.scale.setScalar(450000);
		//	this.sceneries["sky"] = sky;
		//this.scene.add(sky)

		// const effectController = {
		// 	turbidity: 10,
		// 	rayleigh: 2,
		// 	mieCoefficient: 0.005, // 0.5 was cool
		// 	mieDirectionalG: 0.8,
		// 	elevation: 80,
		// 	azimuth: 0.25,
		// 	exposure: this.renderer.toneMappingExposure,
		// };

		// const uniforms = sky.material.uniforms;
		// uniforms["turbidity"].value = effectController.turbidity;
		// uniforms["rayleigh"].value = effectController.rayleigh;
		// uniforms["mieCoefficient"].value = effectController.mieCoefficient;
		// uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

		// const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
		// const theta = THREE.MathUtils.degToRad(effectController.azimuth);
		// const sun = new THREE.Vector3();
		// sun.setFromSphericalCoords(1, phi, theta);
		// uniforms["sunPosition"].value.copy(sun);
		//this.SetTimeOfDay(22);

		//	this.renderer.toneMappingExposure = effectController.exposure;
	}
	ResizeRenderer() {
		this.renderer.setPixelRatio(window.devicePixelRatio * 1);
		this.birdCam.aspect = window.innerWidth / window.innerHeight;
		this.birdCam.updateProjectionMatrix();
		this.CSS2DRenderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.rendererCSS.setSize(window.innerWidth, window.innerHeight);

		//
	}
	SetTimeOfDay(timeofday: number) {
		// time of day 0 corresponds to sun position at 0 phi degrees
		// time of day 12 corresponds to sun position at 90 phi degrees
		// time of day 24 corresponds to sun position at 180 phi degrees

		//pick random int between 0 and 24
		//let randomInt = Math.floor(Math.random() * 24)
		//console.log(randomInt)

		timeofday = timeofday % 24;
		this.timeOfDay = timeofday;
		// timeofday= 22
		const phi = THREE.MathUtils.degToRad((120 * timeofday) / 24);
		const uniforms = this.sceneries["sky"].material.uniforms;
		//         const phi = azimuth.x

		const vec = uniforms["sunPosition"].value.clone() as THREE.Vector3;
		const spherical = new THREE.Spherical();
		spherical.setFromVector3(vec);

		//   spherical.phi += 0.01
		spherical.phi = phi;
		vec.setFromSpherical(spherical);
		console.log(spherical);
		//lerp to new position
		//tween to new position
		const tw = new TWEEN.Tween(uniforms["sunPosition"].value)
			.to(vec, 3000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.start();

		//uniforms['sunPosition'].value.lerp(vec, 2 )
		//   uniforms['sunPosition'].value = vec

		//lerp the sun position

		// var y =uniforms['sunPosition'].value.y
		// var azimuth = { x: y  }
		// var tween = new TWEEN.Tween(azimuth)
		//     .to({ x: phi }, 500)
		//     .onUpdate(function () {
		//         console.log(azimuth.x)
		//         const phi = azimuth.x
		//         const theta = THREE.MathUtils.degToRad(0.25)
		//         const sun = new THREE.Vector3()
		//         sun.setFromSphericalCoords(1, phi, theta)
		//         uniforms['sunPosition'].value.copy(sun)
		//     })
		//     .start()
	}
	FollowEntity(entity: Entity, elapsedTime: number) {
		const idealOffset = new THREE.Vector3(-0, 5, -5);
		idealOffset.applyQuaternion(entity.Quaternion);
		idealOffset.add(entity.Position);

		const idealLookat = new THREE.Vector3(0, 0, 3);
		idealLookat.applyQuaternion(entity.Quaternion);
		idealLookat.add(entity.Position);

		const t = 1.0 - Math.pow(0.15, elapsedTime);

		this._currentPosition.lerp(idealOffset, t);
		this._currentLookat.lerp(idealLookat, t);
		this.birdCam.position.copy(this._currentPosition);
		this.birdCam.lookAt(this._currentLookat);
	}

	TrackHands() {
		//	this.SetTimeOfDay(3);
		this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

		const a = this.HDdetector.estimateHands(this.video);
		a.then((hands) => {
			if (hands.length == 0) {
				return;
			}
			//   console.log(hands);
			hands.sort((hand1, hand2) => {
				if (hand1.handedness < hand2.handedness) return 1;
				if (hand1.handedness > hand2.handedness) return -1;
				return 0;
			});

			// Pad hands to clear empty scatter GL plots.
			while (hands.length < 2) hands.push({});
			if (hands.length == 0) {
				return;
			}
			for (let i = 0; i < hands.length; ++i) {
				// Third hand and onwards scatterGL context is set to null since we
				// don't render them.
				//    const ctxt = [scatterGLCtxtLeftHand, scatterGLCtxtRightHand][i];
				//  this.drawResult(hands[i], ctxt);

				const kp = hands[i].keypoints;
				if (kp == undefined) {
					return;
				}
				const hh = hands[i].handedness;
				this.ctx.fillStyle = hh === "Left" ? "Red" : "Blue";
				this.ctx.strokeStyle = "White";
				this.ctx.lineWidth = 2;

				for (let j = 0; j < kp?.length; j++) {
					const y = kp[j].x;
					const x = kp[j].y;
					this.ctx.beginPath();
					this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
					//   this.ctx.fill();
					//this.drawPoint(x - 2, y - 2, 3);
				}

				const fingers = Object.keys(fingerLookupIndices);
				for (let j = 0; j < fingers.length; j++) {
					const finger = fingers[j];
					const points = fingerLookupIndices[finger].map((idx) => kp[idx]);
					// this.drawPath(points, false);
					const region = new Path2D();
					region.moveTo(points[0].x, points[0].y);
					for (let i = 1; i < points.length; i++) {
						const point = points[i];
						region.lineTo(point.x, point.y);
					}
					this.ctx.stroke(region);
		
				}
			}
		});

		//create a cube and set its to pos
		this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
	}

	set FollowTarget(value: boolean) {
		this.followTarget = value;
		this.simpleOrbitControls.enabled = !value;
	}

	get FollowTarget() {
		return this.followTarget;
	}

	UpdateOrbitControls(timeElapsed: number) {
		const rotateCamera = this.input.mouseDown(this.input.MouseButtons.right);
		const moveCamera = this.input.mouseDown(this.input.MouseButtons.left);
		const mouseDelta = this.input.mouseDelta;

		// zoom value
		let zoom = this.input.mouseWheel;
		//zoom=zoom+160
		if (this.input.down("up_arrow")) {
			this.simpleOrbitControls.update({
				deltaTime: timeElapsed,
				moveOffsetVertically: -500,
			});
		}

		if (this.input.down("z")) {
			this.simpleOrbitControls.update({
				deltaTime: timeElapsed,
				moveTargetForward: 5000,
				//     -86.50108998617313 -410.69511237116984 182.3565797990458
			});
		}

		if (this.input.down("down_arrow"))
			this.simpleOrbitControls.update({
				deltaTime: timeElapsed,
				moveOffsetVertically: 500,
			});

		if (this.input.down("left_arrow"))
			this.simpleOrbitControls.update({
				deltaTime: timeElapsed,
				moveOffsetHorizontally: 500,
			});

		if (this.input.down("right_arrow"))
			this.simpleOrbitControls.update({
				deltaTime: timeElapsed,
				moveOffsetHorizontally: -500,
			});

		if (this.input.down("z")) {
			this.simpleOrbitControls.update({
				deltaTime: timeElapsed,
				moveTargetForward: 1500,
			});
		}
		if (this.input.down("page_up")) zoom += 100;

		if (this.input.down("page_down")) zoom -= 100;

		// update controls
		this.simpleOrbitControls.update({
			deltaTime: timeElapsed,
			rotateHorizontally: rotateCamera ? -mouseDelta.x / 1.6 : 0,
			rotateVertically: rotateCamera ? -mouseDelta.y / 1.6 : 0,
			moveOffsetVertically: (moveCamera ? -mouseDelta.y : 0) * 5,
			moveOffsetHorizontally: (moveCamera ? mouseDelta.x : 0) * 5,
			zoom: zoom * 0.8,
		});

		// }
	}

	Update(deltaTime: number) {

		
		// this.worker.postMessage({
		// 	type: "cameraupdate",
		// 	pos: this.birdCam.position,
		// 	rotx: this.birdCam.rotation.x,
		// 	roty: this.birdCam.rotation.y,
		// 	rotz: this.birdCam.rotation.z,
		// });

		// this.worker.postMessage({
		// 	type: "cameras",
		// 	camerapos: this.birdCam.position,
		// });
		if (this.renderer) {
			this.renderer.render(this.scene, this.birdCam);
		}
		// this.BirdCam.position.divideScalar(1000);
		// 		this.BirdCam.updateProjectionMatrix();
		this.CSS2DRenderer.render(this.scene, this.renderPass.camera);

		//this.effectComposer.render();
		if (this.targetEntitySet && this.followTarget && this.targetEntity._name) {
			this.FollowEntity(this.targetEntity, deltaTime);
		}
		if (this.targetEntity && this.targetEntity.Position) {
			this.bezier.pointB.set(
				this.targetEntity.Position.x,
				this.targetEntity.Position.y,
				this.targetEntity.Position.z
			);
		}
		TWEEN.update();
		//this.orbitControls.update(deltaTime);
		// if (this.simpleOrbitControls) {
		// 	//	this.UpdateOrbitControls(deltaTime);
		// }
		if (this.input.pressed("n0")) {
			this.renderer.domElement.style.pointerEvents = "none";
		}

		if (this.input.pressed("n4")) {
			//
			this.renderer.setPixelRatio(window.devicePixelRatio * 4);
		}
		if (this.input.pressed("n5")) {
			//
			this.renderer.setPixelRatio(window.devicePixelRatio * 2);
		}

		if (this.input.pressed("n6")) {
			//	this.renderer.setPixelRatio(1);

			this.renderer.setPixelRatio(window.devicePixelRatio * 1);
		}

		if (this.input.pressed("n7")) {
			this.renderer.setPixelRatio(window.devicePixelRatio * 0.75);
			html2canvas(document.querySelector("#capture")).then((canvas) => {
				document.body.appendChild(canvas);
			});
		}
		if (this.input.keyDown(this.input.KeyboardKeys.space)) {
			// if (this.targetEntity) {
			// 	this.simpleOrbitControls.target = this.targetEntity.Position;
			// 	const a = this.simpleOrbitControls._spherical.clone();
			// 	a.radius = 8;
			// 	//convert y rotation to  phi
			// 	//a.phi=THREE.MathUtils.degToRad(this.targetEntity._rotation.y * 2 * Math.PI);
			// 	console.log(this.targetEntity._rotation.y);
			// 	a.theta = ((this.targetEntity._rotation.y + 1) * Math.PI) % 1;
			// 	a.phi = 0.9;
			// 	console.log(this.targetEntity._rotation.y);
			// 	console.log(this.simpleOrbitControls.Sphercial);
			// 	//		a.makeSafe();
			// 	//		this.simpleOrbitControls._targetSpherical = a;
			// }
		}

		if (this.input.pressed("n9")) {
			//	this.simpleOrbitControls.target = this.targetEntity.Position;
			const i = setInterval(() => {
				// this.rendererCSS.render(this.cssThreeDScene, this.birdCam);
				this.rendererCSS.render(this.cssThreeDScene, this.birdCam);
				// this.rendererCSS.renderObject(this.vobj6.cssObject, this.birdCam);
				//	this.rendererCSS.renderObject(this.cssThreeDScene, this.birdCam);
				this.rendererCSS.domElement.style.transition = "all 1.5s ease";
			}, 10);
			// setTimeout(() => {
			// 	clearInterval(i);
			// }, 25000);
		}

		if (this.input.pressed("alt")) {
			//	this.orbitControls.enabled = false;
			this.simpleOrbitControls.enabled = false;
			this.htmlOff = true;
			// this.selectionBoxHelper.enable()
		}
		if (this.input.released("alt")) {
			//this.orbitControls.enabled = true;
			if (!this.followTarget) {
				this.simpleOrbitControls.enabled = true;
				this.selectionBoxHelper.dispose();
			}
		}

		if (this.input.pressed("f")) {
			//	this.simpleOrbitControls.normalizeAngle();
		}

		if (this.input.released("h")) {
			this.FollowTarget = !this.FollowTarget;
		}
		if (this.input.released("g")) {
			this.htmlOff = !this.htmlOff;
		}

		if (this.input.released("p")) {
			this.ToggleSceneries(0);
		}

		if (this.input.released("u")) {
			const element = document.createElement("div");
			element.innerHTML = `	
			<div style="zoom: 0.2">
			<div class="transformable" >
		<div   style=" position: relative; top: 0px; left: 0px;  width: 100%; height: 100%; overflow: hidden; background-color: rgba(0,0,0,0.5); ">
		
			
			
				<div   id="uiholder"  width: 500px; height: 1000px; style="position: relative; top: 0px; left: 0px;  padding: 10px; border-radius: 5px;  overflow: hidden; background-color: rgba(0,0,0,0.5); ">

						</div>
					</div>
				</div>
				
		<div  style="  position: relative; top: 0px; left: 0px;  overflow: hidden;  border: 3px solid white; padding: 10px; border-radius: 5px; background-color: rgba(0,0,0,0.5); ">
		</div>
		</div>


</div>

		
		</div>
		
		`;
			//pick a random width between 1500 and 3000
			const randomWidth = 1600;
			element.style.width = `${randomWidth}px`;
			element.style.height = 1100 + "px";
			element.style.transition = "all 0.1s ease-in-out";

			//element.style.zIndex = "1000";

			//when the mouse hover over the div, camera contrls are disabled

			const parme = {
				scene: this.scene,
				html: element,
				cssScene: this.cssThreeDScene,
				CameraController: this.CameraController,
			};
			const vobj5 = new volumineosWebElement(parme);
			vobj5.Sticky = true;
			vobj5.Position.set(5, 2, 0);
			vobj5.Rotation = new THREE.Euler(60, 20, 90);
			vobj5.zoom = 5;
			vobj5.Scale.set(10, 10, 1);
			vobj5.Enabled = false;
			vobj5.TransformScale = 4;

			const param = {
				x: 0,
				y: 0,
			};

			vobj5.setAll();
			vobj5.CenterView();

			// setTimeout(() => {
			// 	const uiholder = document.getElementById("uiholder");
			// 	const pane = new Pane({
			// 		title: "Quality",
			// 		container: uiholder,
			// 	});

			// 	uiholder.addEventListener("mouseenter", () => {
			// 		this.CameraController.orbitControls.processInput = false;
			// 	});
			// 	uiholder.addEventListener("mouseleave", () => {
			// 		this.CameraController.orbitControls.processInput = true;
			// 	});

			// 	pane.addInput(vobj5, "zoom", { min: 0, max: 5, step: 0.1 });
			// 	pane.addInput(param, "x", { min: 0, max: 5, step: 0.1 });
			// 	pane.addInput(vobj5, "Scale", { min: 0, max: 15, step: 0.1 });
			// 	pane.addInput(vobj5, "TransformScale", { min: 1, max: 10, step: 0.1 });
			// 	//	pane.addInput(vobj5, "Rotation", { min: 0, max: 50, step: 1 });
			// 	//pane.addInput(vobj5, "Position", { min: 0, max: 50, step: 1 });

			// 	const folder = pane.addFolder({
			// 		title: "Volumineos Web Elementi",
			// 		expanded: true,
			// 	});

			// 	folder.addInput(vobj5, "Position", { min: 0, max: 50, step: 1 });
			// 	//folder.addInput(vobj5, "Rotation", { min: 0, max: 50, step: 1 });
			// 	const PARAMS = {
			// 		hidden: true,
			// 	};

			// 	pane.addInput(PARAMS, "hidden");

			// 	folder.title = "Volumineos Web Elementsdzdzd";

			// 	pane.on("change", (e) => {

			// 		vobj5.setAll();

			// 		console.log(e);
			// 	});
			// }, 2000);

			// setInterval(() => {
			// 	vobj5.Position.x = this.targetEntity.Position.x;
			// 	vobj5.Position.y = this.targetEntity.Position.y;
			// 	vobj5.Position.z = this.targetEntity.Position.z;
			// 	vobj5.Rotation = new THREE.Euler(
			// 		this.targetEntity.Quaternion.clone().x,
			// 		this.targetEntity.Quaternion.clone().y,
			// 		this.targetEntity.Quaternion.clone().z
			// 	);
			// 	vobj5.setAll();
			// }, 3000);

			// setTimeout(() => {
			// 	const uiholder = document.getElementById("uiholder2");
			// 	const pane = new Pane({
			// 		title: "Qualit2y",
			// 		container: uiholder,
			// 	});

			// 	uiholder.addEventListener("mouseenter", () => {
			// 		this.CameraController.orbitControls.processInput = false;
			// 	});
			// 	uiholder.addEventListener("mouseleave", () => {
			// 		this.CameraController.orbitControls.processInput = true;
			// 	});

			// 	pane.addInput(vobj5, "zoom", { min: 0, max: 5, step: 0.1 });
			// 	pane.addInput(vobj5, "Scale", { min: 0, max: 15, step: 0.1 });
			// 	pane.addInput(vobj5, "TransformScale", { min: 1, max: 10, step: 0.1 });
			// 	//	pane.addInput(vobj5, "Rotation", { min: 0, max: 50, step: 1 });
			// 	//pane.addInput(vobj5, "Position", { min: 0, max: 50, step: 1 });

			// 	const folder = pane.addFolder({
			// 		title: "Volumineos Web Elementi",
			// 		expanded: true,
			// 	});

			// 	folder.addInput(vobj5, "Position", { min: 0, max: 50, step: 1 });
			// 	folder.addInput(vobj5, "Rotation", { min: 0, max: 50, step: 1 });
			// 	const PARAMS = {
			// 		hidden: true,
			// 	};

			// 	pane.addInput(PARAMS, "hidden");

			// 	folder.title = "Volumineos Web Elementsdzdzd";

			// 	pane.on("change", (e) => {
			// 		vobj5.setAll();
			// 		console.log(e);
			// 	});
			// }, 2000);

			//create pan

			// pane.addInput(vobj5, "zoom", { min: 0.1, max: 5 });
			// pane.addInput(vobj5, "Sticky");
			// pane.addInput(vobj5, "Position", { min: -100, max: 100 });
			// pane.addInput(vobj5, "Rotation", { min: -100, max: 100 });
			// pane.addInput(vobj5, "Scale", { min: -100, max: 100 });

			// pane.addInput(vobj5, "setAll");

			//add pane to volumineos element
			//	pane.addFolder("volumineos element").addMonitor(vobj5, "zoom");

			//create css2d object

			//	const pane = new Pane();
		}

		if (this.input.released("o")) {
			this.ToggleSceneries(1);
		}
		// if (this.stinput.keyDown(this.stinput.KeyboardKeys.n)) {
		if (this.input.released("n")) {
			this.SetTimeOfDay(22);
		}
		if (this.input.released("k")) {
			//this.SetTimeOfDay(this.timeOfDay + 2);
			if (!this.renderer) {
				/* #region  Normal Renderer */
				this.LQRenderer();
			} else {
				this.renderer.forceContextLoss();
				this.renderer.dispose();

				this.renderer = null;
			}
		}
		if (this.input.released("j")) {
			//	this.SetTimeOfDay(this.timeOfDay - 1);

			//this.SetTimeOfDay(this.timeOfDay + 2);

			/* #region  Normal Renderer */
			const webglcontainer = document.querySelector(
				"#webgl"
			) as HTMLCanvasElement;
			if (webglcontainer) {
				//	webglcontainer.appendChild(this.renderer.domElement);
				//	webglcontainer.transferControlToOffscreen();
				//webglcontainer.appendChild(this.renderer.domElement);
			}
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				precision: "highp",
				alpha: true,
				logarithmicDepthBuffer: true,
				canvas: webglcontainer,
			});
			//webglcontainer.transferControlToOffscreen();
			//	const offscreen = webglcontainer.transferControlToOffscreen();
			//		this.worker = new Worker(new URL("./OffscreenWorker.ts", import.meta.url));
			//		this.worker.postMessage({ type: "main", canvas: offscreen }, [offscreen]);
			//const w = new Worker(new URL("./Worker.ts", import.meta.url));

			//worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);

			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.setPixelRatio(window.devicePixelRatio * 1);
			this.renderer.outputEncoding = THREE.sRGBEncoding;
			this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
			this.renderer.toneMappingExposure = 0.5;
			this.renderer.setClearColor(0x000000, 0);

			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			//	this.renderer.domElement.style.pointerEvents = "auto";
			this.renderer.domElement.style.position = "absolute";
			this.renderer.domElement.style.background = "";
			this.renderer.domElement.style.zIndex = "2";
			this.renderer.domElement.style.top = "0";
			this.renderer.domElement.style.pointerEvents = "none";
			this.selectionBoxHelper = new SelectionHelper(this.renderer, "selectBox");
		}
		if (this.input.pressed("m")) {
			if (this.tracking) {
				this.tracking = false;
				clearInterval(this.handsTrackingInterval);
			} else {
				this.tracking = true;
				this.handsTrackingInterval = setInterval(() => {
					this.TrackHands();
				}, 50);
			}

			
			



			

		}

		// if (this.stinput.keyDown(this.stinput.KeyboardKeys.n)) {

		if (this.input.pressed("mouse_middle")) {
			this.selectionBoxHelper.onPointerDown(
				this.input.mousePosition.x,
				this.input.mousePosition.y
			);
			this.selectionBox.startPoint.set(
				(this.input.mousePosition.x / window.innerWidth) * 2 - 1,
				-(this.input.mousePosition.y / window.innerHeight) * 2 + 1,
				0.5
			);
		}
		if (this.input.released("mouse_middle") && this.selectionBoxHelper.isDown) {
			this.selectionBoxHelper.onPointerUp(
				this.input.mousePosition.x,
				this.input.mousePosition.y
			);
			this.selectionBox.endPoint.set(
				(this.input.mousePosition.x / window.innerWidth) * 2 - 1,
				-(this.input.mousePosition.y / window.innerHeight) * 2 + 1,
				0.5
			);
			const selectedEntities = this.selectionBox
				.select()
				.map((i) => i.userData.EntityGroup);

			this.ActiveEntities = selectedEntities;

			//check if targetEntity is in selectedEntities
			if (!selectedEntities.includes(this.targetEntity)) {
				this.targetEntity = selectedEntities[0];
			}
			// if (!selectedEntities.contains(this.targetEntity)) {
			// 	this.targetEntity = selectedEntities[0];
			// }

			//this.activeEntities = selectedEntities;
			console.log("selected entities", selectedEntities);
			//console.log("selectionBox", this.selectionBox.select());
			// //	console.log(this.selectionBox.startPoint);
			// 	this.outlinePass.selectedObjects = [];

			// 	const allSelected = this.selectionBox.select();
			// 	for (const selected of allSelected) {
			// 		console.log(selected);
			// 		this.outlinePass.selectedObjects.push(selected._mesh);
			// 	}

			// 	//previously selected is active entities list
			// 	//get allselected minus actiive entities
			// 	const Newlyselected = allSelected.filter(
			// 		(e) => !this.activeEntities.includes(e)
			// 	);
			// 	const unselected = this.activeEntities.filter(
			// 		(e) => !allSelected.includes(e)
			// 	);

			// 	//call toggle toggleOutlined and toggleControllable for unselected and newly selected
			// 	for (const e of unselected) {
			// 		//this.toggleOutlined(e);
			// 		this.toggleControllable(e);
			// 	}
			// 	for (const e of Newlyselected) {
			// 		//	this.toggleOutlined(e);
			// 		this.toggleControllable(e);
			// 	}
			// [0].userData.EntityGroup

			//			console.log(allSelected);
		}
		if (
			this.input.pressed("mouse_left") &&
			//!this.orbitControls.enabled &&
			this.input.altDown
		) {
			this.selectionBoxHelper.onPointerDown(
				this.input.mousePosition.x,
				this.input.mousePosition.y
			);
			this.selectionBox.startPoint.set(
				(this.input.mousePosition.x / window.innerWidth) * 2 - 1,
				-(this.input.mousePosition.y / window.innerHeight) * 2 + 1,
				0.5
			);
		}
		if (this.selectionBoxHelper) {
			if (this.selectionBoxHelper.isDown) {
				this.selectionBoxHelper.onPointerMove(
					this.input.mousePosition.x,
					this.input.mousePosition.y
				);
				this.selectionBox.endPoint.set(
					(this.input.mousePosition.x / window.innerWidth) * 2 - 1,
					-(this.input.mousePosition.y / window.innerHeight) * 2 + 1,
					0.5
				);

				const allSelected = this.selectionBox.select();
				//filtter meshes with userData length > 0
				//	const allSelectedMeshes = allSelected.filter((e) => e.userData.length > 0);
				console.log(allSelected);
				//change make mesh highlighted
			}
		}
		// if (this.input.released("mouse_left") && this.selectionBoxHelper.isDown) {
		// 	this.selectionBoxHelper.onPointerUp(
		// 		this.input.mousePosition.x,
		// 		this.input.mousePosition.y
		// 	);
		// 	this.selectionBox.endPoint.set(
		// 		(this.input.mousePosition.x / window.innerWidth) * 2 - 1,
		// 		-(this.input.mousePosition.y / window.innerHeight) * 2 + 1,
		// 		0.5
		// 	);

		// 	const allSelected = this.selectionBox.select();
		// 	//previously selected is active entities list
		// 	//get allselected minus actiive entities
		// 	const Newlyselected = allSelected.filter(
		// 		(e) => !this.activeEntities.includes(e)
		// 	);
		// 	const unselected = this.activeEntities.filter(
		// 		(e) => !allSelected.includes(e)
		// 	);

		// 	//call toggle toggleOutlined and toggleControllable for unselected and newly selected
		// 	for (const e of unselected) {
		// 		this.toggleOutlined(e);
		// 		this.toggleControllable(e);
		// 	}
		// 	for (const e of Newlyselected) {
		// 		this.toggleOutlined(e);
		// 		this.toggleControllable(e);
		// 	}
		// 	this.activeEntities = allSelected;
		// 	console.log(allSelected);

		// }
		else if (this.input.released("mouse_left") && this.input.ctrlDown) {
			//remove gizmo from scene
			this.gizmo.detach();
			this.gizmo.visible = false;
			//create raycaster
			const mousepos = this.input.mousePosition;
			const ray = new THREE.Raycaster(
				this.birdCam.position,
				new THREE.Vector3(
					(mousepos.x / window.innerWidth) * 2 - 1,
					-(mousepos.y / window.innerHeight) * 2 + 1,
					0.5
				)
					.unproject(this.birdCam)
					.sub(this.birdCam.position)
					.normalize()
			);
			//filter elements in the scene children that are not the gizmo, the grid, the selectionboxhelper or line
			let intersects = ray.intersectObjects(this.scene.children, true);
			intersects = intersects.filter((e) => e.object.type === "Mesh");

			//remove elements that are child of the gizmo
			// const filteredIntersects = intersects.filter(
			// 	(e) => !e.object.
			// );
			//if there is an intersection
			//
			if (intersects.length > 0) {
				//if first intersect is gizmo then skip to next
				//remove first intersect from array until first intersect is not gizmo or line
				console.log(intersects[0].object.type);
				//if first intersect is not gizmo or line

				const arrowHelper = new THREE.ArrowHelper(
					ray.ray.direction,
					ray.ray.origin,
					ray.ray.origin.distanceTo(intersects[0].point),
					"#ff0000",
					0.3,
					0.1
				);

				const head = arrowHelper.cone as THREE.Mesh;
				const body = arrowHelper.line as THREE.Line;
				const material = new THREE.MeshBasicMaterial({
					color: "#0011ff",
					transparent: true,
					opacity: 0.5,
				});
				head.material = material;
				body.material = material;
				this.gizmo.attach(intersects[0].object);
				this.gizmo.domElement.style.pointerEvents = "auto";

				//	console.log(intersects[0]);
				this.scene.add(arrowHelper);

				//fade arrow
				const tween = new TWEEN.Tween(arrowHelper.cone.material)
					.to({ opacity: 0 }, 2000)
					.easing(TWEEN.Easing.Quadratic.Out)
					.onUpdate(() => {
						//make body shorter
						arrowHelper.line.scale.y -= 0.01;
					})
					.onComplete(() => {
						this.scene.remove(arrowHelper);
					})
					.start();

				//castt the ray
				//const intersects = ray.intersectObjects(this.scene.children, true);

				//if intersected is not undefined
			}
			//set target entity to intersected object

			//get the entity from the intersected object

			//add gizmo to intersected object
			//this.gizmo.attachTo(intersects[0].object);
		} else if (this.input.released("mouse_left")) {
			//remove gizmo from scene
			if (this.controlsGizmo) {
				this.gizmo.detach();
				this.gizmo.visible = false;
				this.gizmo.domElement.style.pointerEvents = "none";
			}
		}

		if (this.input.released("n8")) {
			//make a list of youtube videos :
			const youtubeVideos = [
				`<iframe class="transformable" src="https://www.youtube-nocookie.com/embed/WTwX0sM8hrI"></iframe>`,
			];

			// go through the list and add them to the scene
			for (let i = 0; i < youtubeVideos.length; i++) {
				const element = document.createElement("div");
				element.innerHTML = `	
			<div style=" position: relative; top: 0px; left: 0px; width: 100%; height: 1000px; overflow: hidden;  border: 10px solid white; padding: 10px; border-radius: 5px;">
			${youtubeVideos[i]}
			<div>	
			`;
				//pick a random width between 1500 and 3000
				const randomWidth = 2000;
				element.style.width = `${randomWidth}px`;
				element.style.height = 1000 + "px";
				element.style.transition = "all 2.5s ease";
				element.id = "capture";

				const parme = {
					scene: this.scene,
					html: element,
					cssScene: this.cssThreeDScene,
					CameraController: this.CameraController,
					name: "youtube",
				};
				const youtubediv = new volumineosWebElement(parme);
				youtubediv.Enabled = true;
				//	vobj5.Sticky = true;
				//place the element in the scene at a random position
				// vobj5.position.x = Math.random() * 80 - 6;
				// vobj5.position.y = Math.random() * 80 + 50;
				// vobj5.position.z = Math.random() * 80 + 60;

				youtubediv.Position = this.targetEntity.Position.clone().add(
					new THREE.Vector3(40, 4, 1 + 2)
				);

				//vobj2.Rotation = new THREE.Euler(0, Math.PI*0.644, Math.PI / 32);

				//pick a random scale for the element between 3 and 10
				const randomScale = 10;
				youtubediv.Scale = new THREE.Vector3(
					randomScale,
					randomScale,
					randomScale
				);
				youtubediv.Enabled = true;

				youtubediv.Zoom = 1;
				youtubediv.setAll();
				youtubediv.setTranformableIndex(3);
			}

			//vobj2.Rotation = new THREE.Euler(0, Math.PI*0.644, Math.PI / 32);

			//pick a random scale for the element between 3 and 10

			const slowRoads = document.createElement("div");
			slowRoads.id = "slowRoads";

			slowRoads.style.width = "1500px";
			slowRoads.style.height = "1000px";

			slowRoads.innerHTML = `

				<div style=" position: relative; top: 0px; left: 0px; width: 100%; height: 1000px; overflow: hidden;  border: 10px solid white; padding: 10px; border-radius: 5px;">

				<iframe id="inlineFrameExample"
				title="Inline Frame Example"
				class="transformable"

				 src="https://slowroads.io/"
				 sandbox="allow-same-origin allow-scripts"
				</iframe>
		<div>

				`;

			const daedal = document.createElement("div");
			daedal.id = "daedal";

			daedal.style.width = "1500px";
			daedal.style.height = "1000px";

			daedal.innerHTML = `
	
					<div style=" position: relative; top: 0px; left: 0px; width: 100%; height: 1000px; overflow: hidden;  border: 10px solid white; padding: 10px; border-radius: 5px;">
	
					<iframe id="inlineFrameExample"
					title="Inline Frame Example"
					class="transformable"
	
					 src="https://dustinbrett.com/"
					 sandbox="allow-same-origin allow-scripts"
					</iframe>
			<div>
	
					`;

			const params7 = {
				scene: this.scene,
				html: daedal,
				cssScene: this.cssThreeDScene,
				CameraController: this.CameraController,
				name: "daedal",
			};

			this.vobj7 = new volumineosWebElement(params7);

			this.vobj7.Sticky = true;
			//place the element in the scene at a random position
			this.vobj7.Position = new THREE.Vector3(12, 4, 6);

			this.vobj7.Scale = new THREE.Vector3(10, 10, 10);
			this.vobj7.Enabled = true;

			this.vobj7.Zoom = 2;
			this.vobj7.setAll();
			this.vobj7.setTranformableIndex(2);

			const calender = document.createElement("div");
			calender.id = "calender";
			calender.style.width = "2000px";
			calender.style.height = "1000px";
			calender.innerHTML = `
	
			<div style=" position: relative; top: 0px; left: 0px; width: 100%; height: 1000px; overflow: hidden;  border: 10px solid white; padding: 10px; border-radius: 5px;">

			<iframe id="inlineFrameExample"
			title="Inline Frame Example"
			class="transformable"

			 src="https://amie.so/calendar"
			 sandbox="allow-same-origin allow-scripts"
			</iframe>
	<div>

			`;
			const params8 = {
				scene: this.scene,
				html: calender,
				cssScene: this.cssThreeDScene,
				CameraController: this.CameraController,
				name: "amie",
			};

			const vobj8 = new volumineosWebElement(params8);
			vobj8.Sticky = true;
			//ce the element in the scene at a random position
			vobj8.Position = new THREE.Vector3(-12, 4, 6);

			vobj8.Scale = new THREE.Vector3(10, 10, 10);
			vobj8.Enabled = true;

			vobj8.Zoom = 2;
			vobj8.setAll();
			vobj8.setTranformableIndex(2);

			const Welcome = document.createElement("div");
			const Youtube = document.createElement("div");
			Youtube.id = "MainContent";

			Youtube.style.width = "1500px";
			Youtube.style.height = "1000px";

			Youtube.innerHTML = `	
			<div style=" position: relative; top: 0px; left: 0px; width: 100%; height: 1000px; overflow: hidden;  border: 10px solid white; padding: 10px; border-radius: 5px;">
			<iframe id="inlineFrameExample"
			title="Inline Frame Example" class="transformable"
	
			
			src="https://www.youtube.com/embed/c9OBN0TbTOs"
			 sandbox="allow-same-origin allow-scripts"
			 crossorigin="anonymous"
			</iframe>
	<div>
			
	
	
	
			`;

			Welcome.id = "MainContent";
			console.log(Welcome);
			Welcome.style.width = "1500px";
			Welcome.style.height = "1500px";
			Welcome.style.backgroundColor = "White";
			Welcome.style.cursor = "none!important";
			Welcome.style.zIndex = "0";

			//console.log(Number(Welcome.style.height));
			//element.innerHTML	= `<iframe width="500" height="500" src="https://www.youtube.com/embed/c9OBN0TbTOs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>";`
			// <iframe  src="https://mozilla.github.io/pdf.js/web/viewer.html" width="500px" height="1000px" style="border: none; position:relative;   transform: scale(5);   /*some prefix*/-transform-origin: 0 0;
			// <embed style="transform: scale(5)" height="1000" src="resume.pdf" type="application/pdf" />

			//fetch html from a url
			const url = "https://www.youtube.com/embed/c9OBN0TbTOs";

			Welcome.innerHTML = `

		
			 <video  id="demo-video" cursor:none!important crossorigin="anonymous" controls="controls" muted="muted" autoplay="true" loop="loop" style="width:100%;  height:100%"><source src="https://media.giphy.com/media/fuqOHTeelZdChAkx2s/giphy.mp4"></video>

			 		`;

			const params = {
				scene: this.scene,
				html: Welcome,
				cssScene: this.cssThreeDScene,
				CameraController: this.CameraController,
				name: "Video Canvas",
			};

			const videodiv = new volumineosWebElement(params);

			videodiv.setAll();
			videodiv.Scale = new THREE.Vector3(3, 3, 3);
			videodiv.setTranformableIndex(2);
			videodiv.zoom = 2;
			videodiv.setAll();
			//vobj.Position = new THREE.Vector3(5, 15, 0);
			videodiv.Position =	new THREE.Vector3(60, 4, 1 + 2)
			videodiv.setAll();


			const Welcome2 = document.createElement("div");

			Welcome2.style.width = "1500px";
			Welcome2.style.height = "1500px";
			Welcome2.style.backgroundColor = "White";
			Welcome2.style.cursor = "none!important";
			Welcome2.style.zIndex = "0";

			Welcome2.innerHTML = `

			<canvas  style="width:100%; height:100%"  id="output"></canvas>

					`;

			const paramss2 = {
				scene: this.scene,
				html: Welcome2,
				cssScene: this.cssThreeDScene,
				CameraController: this.CameraController,
				name: "tensorflowjs canvas",
			};
			const canvasdiv = new volumineosWebElement(paramss2);
			canvasdiv.setAll();
			canvasdiv.Scale = new THREE.Vector3(3, 3, 3);
			canvasdiv.setTranformableIndex(2);
			canvasdiv.zoom = 2;
			canvasdiv.setAll();
			//vobj.Position = new THREE.Vector3(5, 15, 0);
			canvasdiv.Position = this.targetEntity.Position.clone().add(
				new THREE.Vector3(70, 4, 1 + 2)
				);

			canvasdiv.setAll();
			setTimeout(() => {
				const video = document.getElementById("demo-video") as HTMLVideoElement;
				this.video = video;
				this.canvas = document.getElementById("output") as HTMLCanvasElement;
				this.canvas.width = video.videoWidth;
				this.canvas.height = video.videoHeight;
			}, 2500);
			setTimeout(() => {
				console.log(this.canvas);
				this.ctx = this.canvas.getContext("2d");
				this.ctx.drawImage(
					this.video,
					0,
					0,
					this.canvas.width,
					this.canvas.height
				);
			}, 3000);

			//  vobj.Rotation = new THREE.Euler(0, Math.PI / 32, 0);
			//  vobj.zoom = 4;
			//  vobj.setAll();

			// const params2 = {
			// 	scene: this.scene,
			// 	html: Youtube,
			// 	cssScene: this.cssThreeDScene,
			// 	CameraController: this.CameraController,
			// };
			// const vobj2 = new volumineosWebElement(params2);
			// vobj2.Sticky = true;
			// vobj2.Enabled = false;
			// //vobj2.Position = new THREE.Vector3(15, 10, -6);

			// vobj2.Position = this.targetEntity.Position.clone().add(
			// 	new THREE.Vector3(15, 10, -6)
			// );

			// //vobj2.Rotation = new THREE.Euler(0, Math.PI*0.644, Math.PI / 32);

			// vobj2.Scale = new THREE.Vector3(8, 8, 8);

			// vobj2.Zoom = 2;
			// vobj2.setAll();
			// vobj2.setTranformableIndex(6);
			// setTimeout(() => {
			// 	vobj2.setTranformableIndex(20);
			// }, 6000);

			// setTimeout(() => {
			// 	vobj.setTranformableIndex(8);
			// }, 6000);

			const VsCode = document.createElement("div");
			VsCode.id = "MainContent";

			VsCode.style.width = "1500px";
			VsCode.style.height = "1000px";

			VsCode.innerHTML = `	
	
			<div style=" position: relative; top: 0px; left: 0px; width: 100%; height: 1000px; overflow: hidden;  border: 10px solid white; padding: 10px; border-radius: 5px;">
		
			<iframe id="inlineFrameExample"
			title="Inline Frame Example"
			class="transformable"
	
			
			 src="https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fdoom.jsdos?anonymous=1"
			 sandbox="allow-same-origin allow-scripts"
			</iframe>
	<div>
			
	
	
	
			`;

			const params3 = {
				scene: this.scene,
				html: VsCode,
				cssScene: this.cssThreeDScene,
				CameraController: this.CameraController,
			};
			// const vobj3 = new volumineosWebElement(params3);
			// vobj3.Position = new THREE.Vector3(15, 35, -6);

			// vobj3.Scale = new THREE.Vector3(30, 30, 30);
			// vobj.Rotation = new THREE.Euler(Math.PI / 6, 0, 0);

			// vobj3.Zoom = 1;
			// vobj3.setAll();
			// vobj3.setTranformableIndex(1);

			const cv = document.createElement("div");
			cv.id = "MainContent";

			cv.innerHTML = `
		
		
			<h1 ><center>About</h1>

		
			<pre class="terminal" id="simple"   font-size: 20px; font-family: 'Courier New', Courier, monospace; style="height: 2000px important!; width: 2000px important!; overflow: scroll; background-color: black; color: white; border: 10px solid white; padding: 10px; border-radius: 5px;">
		
			</pre>
	
			<div style=" position: relative; top: 0px; left: 0px; width: 100%; height: 2000px; overflow: hidden; background-color: black; color: white; border: 10px solid white; padding: 10px; border-radius: 5px;">
			<embed id="inlineFrameExample"
			title="Inline Frame Example"
			class="transformable"		
			src="resume.pdf"
			type="application/pdf"
			</embed>
	<div>
			
	
	
	
			`;
			cv.style.width = "1000px";
			cv.style.height = "2000px";
			const params5 = {
				scene: this.scene,
				html: cv,
				cssScene: this.cssThreeDScene,
				CameraController: this.CameraController,
			};
			// const vobj4 = new volumineosWebElement(params5);
			// vobj4.Position = new THREE.Vector3(-32, 15, -6);
			// vobj4.Scale = new THREE.Vector3(15, 15, 15);
			// vobj4.Zoom = 2;
			// vobj4.setAll();
			// vobj4.setTranformableIndex(2);

			// setTimeout(() => {
			// 	vobj.Scale = new THREE.Vector3(15, 15, 15);
			// 	vobj.Position= new THREE.Vector3(0, 0,0);
			// 	vobj.setAll();
			// }, 6000);

			// setTimeout(() => {
			// 	vobj.zoom= 3;
			// 	vobj.Scale = new THREE.Vector3(150, 150, 150);
			// 	vobj.setAll();
			// }, 10000);

			// vobj.Rotation = new THREE.Euler(0, degToRad(180), 0);
			// console.log(vobj.scale);

			// //vobj.Scale = new THREE.Vector3(5, 5, 5);
			// console.log(vobj.scale);

			// setTimeout(() => {

			// 	vobj.enhancebutkeepSize(10)
			// 	vobj.Scale = new THREE.Vector3(1, 1, 1);

			// }, 5000);

			// setTimeout(() => {
			// 	vobj.enhancebutkeepSize(1)
			// 	vobj.Scale = new THREE.Vector3(15, 15, 15);

			// }, 10000);

			// setTimeout(() => {
			// 	console.log(vobj.oldScale);
			// 	vobj.enhancebutkeepSize(3)
			// 	vobj.Scale = new THREE.Vector3(15, 15, 15);
			// //	vobj.Scale = new THREE.Vector3(5, 5, 5);

			// 	//vobj.Position= new THREE.Vector3(0, 0,0);

			// }, 15000);

			// setTimeout(() => {

			// 	vobj.enhancebutkeepSize(1)
			// 	vobj.Scale = new THREE.Vector3(15, 15, 15);

			// //	vobj.Scale = new THREE.Vector3(15, 15, 15);

			// //	vobj.Scale = new THREE.Vector3(15, 15, 15);

			// 	// vobj.enhancebutkeepSize(1)
			// 	// vobj.Scale = new THREE.Vector3(15, 15, 15);

			// //	vobj.Scale = new THREE.Vector3(15, 15, 15);

			// 	//vobj.Position= new THREE.Vector3(0, 0,0);

			// }, 15000);

			// setTimeout(() => {

			// 	vobj.enhancebutkeepSize(7)
			// 	vobj.Scale = new THREE.Vector3(15, 15, 15);

			// 	//vobj.Scale = new THREE.Vector3(15, 15, 15);

			// //	vobj.Scale = new THREE.Vector3(15, 15, 15);

			// 	// vobj.enhancebutkeepSize(1)
			// 	// vobj.Scale = new THREE.Vector3(15, 15, 15);

			// //	vobj.Scale = new THREE.Vector3(15, 15, 15);

			// 	//vobj.Position= new THREE.Vector3(0, 0,0);

			// }, 17000);
			// setTimeout(() => {

			// 	vobj.enhancebutkeepSize(1)
			// 	console.log(vobj.scale);
			// 	console.log(vobj.oldScale);
			// 	vobj.Scale = new THREE.Vector3(15, 15, 15);
			// 	console.log(vobj.scale);

			// 	//vobj.Scale = new THREE.Vector3(15, 15, 15);

			// //	vobj.Scale = new THREE.Vector3(15, 15, 15);

			// 	// vobj.enhancebutkeepSize(1)
			// 	// vobj.Scale = new THREE.Vector3(15, 15, 15);

			// //	vobj.Scale = new THREE.Vector3(15, 15, 15);

			// 	//vobj.Position= new THREE.Vector3(0, 0,0);

			// }, 20000);

			//vobj.enhance(2)

			//	vobj.Scale = new THREE.Vector3(10, 10, 10);
			////vobj.enhance(2)
			// //	vobj.Position= new THREE.Vector3(8, 8,8);
			// 	vobj.enhance(10)
			// 	vobj.Position= new THREE.Vector3(8, 8,8);

			// 	vobj.enhance(5)
			// 	vobj.Position= new THREE.Vector3(0, 0,0);
			// 	vobj.Scale = new THREE.Vector3(1/5, 1/5, 1/5);
			//vobj.Position= new THREE.Vector3(0,3,0);

			//vobj.enhance(2)
			//vobj.Position= new THREE.Vector3(8, 8,8);
			// setInterval(() => {
			// 	vobj.Position = new THREE.Vector3(-2, 3,-3);}
			// 	, 1000);

			//vobj.position= new THREE.Vector3(-2, 3,-3p^p);

			//	Welcome.style.setProperty("zoom", "4");
			//	Welcome.style.backgroundColor = "rgba(95, 156, 15, 1)";

			// for (var i = 0; i < 45; i++) {
			// 	var element = document.createElement("div");

			// 	element.style.width = "6000px";
			// 	element.style.height = "3000px";
			// 	element.style.opacity = "1";
			// 	element.style.fontSize = "2em";
			// 	element.style.background = new THREE.Color(
			// 		Math.random() * 0.21568627451 + 0.462745098039,
			// 		Math.random() * 0.21568627451 + 0.462745098039,
			// 		Math.random() * 0.21568627451 + 0.462745098039
			// 	).getStyle();

			// 	//case i
			// 	//element.textContent = "I am an application"

			// 	//pick a random int  between 0 and 5
			// 	var randomInt = Math.floor(Math.random() * 20);
			// 	//nah just use the index
			// 	randomInt = i;
			// 	if (randomInt == 0) {
			// 		element.textContent = "I am an application";
			// 		element.innerHTML += `<video class="input_video" id="demo-video" crossorigin="anonymous" controls="controls" muted="muted" autoplay="autoplay" loop="loop" style="width:1000px;  height:1000px"><source src="https://media.giphy.com/media/fuqOHTeelZdChAkx2s/giphy.mp4"></video>
			// 		`;
			// 		element.setAttribute("contenteditable", "");
			// 	} else if (randomInt == 1) {
			// 		element.textContent = "I am a pic";
			// 		element.innerHTML += ` <img class="mdc-image-list__image" style="width:3000px;  height:3000px" src="https://images.unsplash.com/photo-1624396593468-0230b5c9c29e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1546&q=80">
			// 		`;
			// 	} else if (randomInt == 2) {
			// 		element.textContent = "I am a pic";
			// 		element.innerHTML += ` <img crossorigin="anonymous" class="mdc-image-list__image" style="width:3000px;  height:3000px" src="https://images.unsplash.com/photo-1612380635121-411eda9ecbb9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80">
			// 		`;
			// 		element.setAttribute("contenteditable", "");
			// 	} else if (randomInt == 3) {
			// 		element.textContent = "I am a pic";
			// 		element.innerHTML += ` <iframe width="3000" height="2000" src="https://www.youtube-nocookie.com/embed/Kb5JMLh_2ds?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> `;

			// 		//  element.setAttribute('contenteditable', '')
			// 	} else if (randomInt == 4) {
			// 		element.textContent = "I am a pic";
			// 		element.innerHTML += `         <iframe width="4000" height="2000" src="https://www.youtube-nocookie.com/embed/SPYL9DldfMU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
			// 		`;

			// 		//  element.setAttribute('contenteditable', '')
			// 	} else if (randomInt == 7) {
			// 		element.textContent =
			// 			"I am a piano music, by Steven Devine using the Fortepiano";
			// 		element.innerHTML += `<iframe width="5000" height="3000" src="https://www.youtube-nocookie.com/embed/0mXCQZOYMcU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

			// 		`;

			// 		//  element.setAttribute('contenteditable', '')
			// 	} else if (randomInt == 8) {
			// 		element.textContent =
			// 			"I am a piano music, by Steven Devine using the Fortepiano";
			// 		element.innerHTML += `<iframe width="2000" height="2000" src="https://www.youtube-nocookie.com/embed/aFlC5u8ESMk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
			// 		`;

			// 		//  element.setAttribute('contenteditable', '')
			// 	} else if (randomInt == 9) {
			// 		element.textContent =
			// 			"I am a piano music,Mozart - Piano Concerto in G major Nr. 17 K. 453 - I. Allegro | Il Gardellino & Olga Pashchenko , from youtube";

			// 		element.innerHTML += `<iframe width="5000" height="3150" src="https://www.youtube-nocookie.com/embed/WTwX0sM8hrI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

			// 		//  element.setAttribute('contenteditable', '')
			// 	} else if (randomInt == 11) {
			// 		element.textContent = "I am vsCodeeeeeeeeeeeeeeeeeeee!";
			// 		element.innerHTML += `        <iframe id="inlineFrameExample"
			// 		title="Inline Frame Example"
			// 		width="3000"
			// 		height="2000"
			// 		src="https://microsoft.github.io/monaco-editor/playground.html"
			// 		crossorigin="anonymous"
			// 		</iframe>
			// 		`;
			// 		element.setAttribute("contenteditable", "");
			// 	} else if (randomInt == 12) {
			// 		element.textContent = "I am vsCodee!";
			// 		element.innerHTML += `        <iframe id="inlineFrameExample"
			// 		title="Inline Frame Example"
			// 		width="3000"
			// 		height="2000"
			// 		src="https://dustinbrett.com/"
			// 		sandbox="allow-same-origin allow-scripts"
			// 		</iframe>
			// 		`;
			// 		element.setAttribute("contenteditable", "");
			// 		//add annotaion with camera position facing the user
			// 	} else if (randomInt == 30) {
			// 		element.textContent = "I am vsCodee!";
			// 		element.innerHTML += `        <iframe id="inlineFrameExample"
			// 		title="Inline Frame Example"
			// 		width="3000"
			// 		height="2000"
			// 		src="http://www.sweethome3d.com/SweetHome3DJSOnline.jsp"
			// 		sandbox="allow-same-origin allow-scripts"
			// 		</iframe>
			// 		`;
			// 		element.setAttribute("contenteditable", "");

			// 		//  annotations["VsCode"].title = "VsCode"
			// 		//     annotations["VsCode"].description = "This is visual studio code, powerful and free IDE from Microsoft"
			// 	} else if (randomInt == 6) {
			// 		element.textContent = "I am a pic";
			// 		element.innerHTML += ` <img crossorigin="anonymous" class="mdc-image-list__image" style="width:3000px;  height:3000px" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80">
			// 		`;
			// 		//  element.setAttribute('contenteditable', '')
			// 	}

			// 	element.style.zIndex = "2";

			// 	const domObject = new CSS3DObject(element);
			// 	domObject.position.x = Math.random() * 80000 - 600;
			// 	domObject.position.y = Math.random() * 80000 + 5000;
			// 	domObject.position.z = Math.random() * 80000 + 600;

			// 	const planeMaterial = new THREE.MeshBasicMaterial();
			// 	planeMaterial.color.set("black");
			// 	planeMaterial.opacity = 0.1;
			// 	planeMaterial.blending = THREE.NoBlending;
			// 	planeMaterial.transparent = true;
			// 	//planeMaterial.depthWrite = false;
			// 	//planeMaterial.depthTest = false;

			// 	planeMaterial.side = THREE.DoubleSide;
			// 	const planeWidth = 6;
			// 	const planeHeight = 3;
			// 	const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
			// 	const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
			// 	planeMesh.receiveShadow = true;
			// 	planeMesh.castShadow = true;
			// 	planeMesh.position.set(
			// 		domObject.position.x / 1000,
			// 		domObject.position.y / 1000,
			// 		domObject.position.z / 1000
			// 	);
			// 	this.scene.add(planeMesh);

			// 	this.cssThreeDScene.add(domObject);
			// }

			//this.BirdCam.position.divideScalar(100);

			// 		/* #region SLOW ROADS  */

			// 		/* #endregion */
		}
		if (this.input.pressed("mouse_left") && this.input.co) {
			// //get normalized mouse vector
			// const mouse = {
			// 	x: (this.input.mousePosition.x / window.innerWidth) * 2 - 1,
			// 	y: -(this.input.mousePosition.y / window.innerHeight) * 2 + 1,
			// };
			// const raycaster = new THREE.Raycaster();
			// raycaster.setFromCamera(mouse, this.birdCam);
			// const intersects = raycaster.intersectObject(this.sceneries["ground"]);
			// if (intersects.length > 0) {
			// 	//visualize the raycast
			// 	// this.scene.add(
			// 	// 	new THREE.ArrowHelper(
			// 	// 		raycaster.ray.direction,
			// 	// 		raycaster.ray.origin,
			// 	// 		100,
			// 	// 		Math.random() * 0xffffff
			// 	// 	)
			// 	// );
			// 	//get the point of intersection
			// 	const point = intersects[0].point;
			// 	//call go to point for the active entities
			// 	for (const e of this.activeEntities) {
			// 		e.GetComponent("CharacterController").GoToPoint(point);
			// 	}
			// }
		}
	}
	private LQRenderer() {
		const webglcontainer = document.querySelector(
			"#webgl"
		) as HTMLCanvasElement;
		if (webglcontainer) {
			//	webglcontainer.appendChild(this.renderer.domElement);
			//	webglcontainer.transferControlToOffscreen();
			//webglcontainer.appendChild(this.renderer.domElement);
		}
		this.renderer = new THREE.WebGLRenderer({
			//antialias: true,
			//precision: "highp",
			//alpha: true,
			//logarithmicDepthBuffer: true,
			canvas: webglcontainer,
		});
		//webglcontainer.transferControlToOffscreen();
		//	const offscreen = webglcontainer.transferControlToOffscreen();
		//		this.worker = new Worker(new URL("./OffscreenWorker.ts", import.meta.url));
		//		this.worker.postMessage({ type: "main", canvas: offscreen }, [offscreen]);
		//const w = new Worker(new URL("./Worker.ts", import.meta.url));
		//worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio * 1);
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 0.5;
		this.renderer.setClearColor(0x000000, 0);

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		//	this.renderer.domElement.style.pointerEvents = "auto";
		this.renderer.domElement.style.position = "absolute";
		this.renderer.domElement.style.background = "";
		this.renderer.domElement.style.zIndex = "2";
		this.renderer.domElement.style.top = "0";
		this.renderer.domElement.style.pointerEvents = "none";
		this.selectionBoxHelper = new SelectionHelper(
			this.renderer,
			"selectBox"
		);
		console.log(this.renderer.capabilities.isWebGL2);
	}

	set ActiveEntities(entities: Entity[]) {
		const Newlyselected = entities.filter(
			(e) => !this.activeEntities.includes(e)
		);
		const unselected = this.activeEntities.filter((e) => !entities.includes(e));

		//call toggle toggleOutlined and toggleControllable for unselected and newly selected
		for (const e of unselected) {
			//this.toggleOutlined(e);
			this.toggleControllable(e);
		}
		for (const e of Newlyselected) {
			//	this.toggleOutlined(e);
			this.toggleControllable(e);
		}

		this.activeEntities = entities;
	}
	toggleOutlined(entity: Entity) {
		if (this.outlinePass.selectedObjects.includes(entity._mesh)) {
			this.outlinePass.selectedObjects.splice(
				this.outlinePass.selectedObjects.indexOf(entity._mesh),
				1
			);
		} else {
			this.outlinePass.selectedObjects.push(entity._mesh);
		}
	}

	toggleControllable(entity: Entity) {
		const _isCharacter = (c: Entity) => {
			const co = c.GetComponent("CharacterInput");
			if (co) {
				return true;
			}
		};
		if (_isCharacter(entity)) {
			entity.RemoveComponent("CharacterInput");
		} else {
			entity.AddComponent(
				new CharacterInput({ input: this.input }),
				"CharacterInput"
			);
		}
	}

	get TimeOfDay() {
		return this.timeOfDay;
	}

	get Scene() {
		return this.scene;
	}
	get BirdCam() {
		return this.birdCam;
	}
	get Renderer() {
		return this.renderer;
	}
	get EffectComposer() {
		return this.effectComposer;
	}
	get RenderPass() {
		return this.renderPass;
	}
	get OutlinePass() {
		return this.outlinePass;
	}
	get OrbitControls() {
		return this.orbitControls;
	}
	set EntityManager(value: EntityManager) {
		this.entityManager = value;
	}
}

export { MainController };
