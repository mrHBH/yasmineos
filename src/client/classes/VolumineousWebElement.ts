import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import { SimpleOrbitControls } from "../SimpleOrbitControls";
import noUiSlider from "nouislider";
import { Text } from "troika-three-text";
import { CameraController } from "./CameraController";

class volumineosWebElement {
	element: HTMLDivElement;
	cssScene: THREE.Scene;
	scene: THREE.Scene;
	cssObject: CSS3DObject;
	planeMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
	width: number;
	height: number;
	zoom = 1;
	scale: THREE.Vector3;
	position: THREE.Vector3;
	rotation: THREE.Euler;
	oldScale: THREE.Vector3;
	isActivated: boolean;
	soc: SimpleOrbitControls;
	isSticky: boolean;
	updateInterval: NodeJS.Timer;
	cameraContoller: CameraController;
	transformScale: number;
	name: any;
	constructor(params: any) {
		this.isActivated = false;
		this.isSticky = false;
		this.element = params.html;
		this.cssScene = params.cssScene;
		this.scene = params.scene;
		this.rotation = new THREE.Euler(0, 0, 0);
		this.position = new THREE.Vector3(0, 0, 0);
		this.scale = new THREE.Vector3(1, 1, 1);
		this.zoom = 1;
		this.name = params.name;
		// this.soc = params.soc;
		this.cameraContoller = params.CameraController;
		//this.scale = new THREE.Vector3(1, 1, 1);
		this.construct();
		const transformable = this.element.getElementsByClassName("transformable");

		for (let i = 0; i < transformable.length; i++) {
			transformable[i].setAttribute(
				"style",
				"transform: scale(1); zoom:1; top: 0px; left: 0px; width: 100%; height: 100%; position: absolute; border: none; overflow: hidden; transform-origin: 0 0;"
			);
		}

		//get high res svg
		//render at 5 scale and 5 transform scale
		//get the image data
		//render at 1 scale and 1 transform scale
		//set the image data

		// this.setTranformableIndex(5);
		// this.zoom = 5;
		// this.setAll();
		//get imùage of the element
	}

	set Sticky(val: boolean) {
		this.isSticky = val;
		if (this.isSticky) {
			clearInterval(this.updateInterval);
		} else {
			this.updateInterval = setInterval(() => {
				this.Update();
			}, 900);
		}
	}

	set Enabled(val: boolean) {
		this.isActivated = val;
		if (this.isActivated) {
			this.element.style.pointerEvents = "auto";
			//if this element is clicked, it will be the top element
			this.element.addEventListener("click", () => {
				this.element.style.pointerEvents = "none";
			});
		} else {
			this.element.style.pointerEvents = "none";
		}
	}

	set TransformScale(x: number) {
		this.setTranformableIndex(x);
	}
	get TransformScale() {
		return this.transformScale;
	}
	CenterView() {
		const target = this.position.clone();
		const camera = new THREE.Vector3(-1000, -3000, 100000);
		const spherical = new THREE.Spherical();
		spherical.setFromVector3(camera.sub(target));
		spherical.radius = 4;
		spherical.phi = Math.PI / 2;
		spherical.theta = 0;
		//center left of the element

		this.cameraContoller.orbitControls._targetSpherical = spherical;
		this.cameraContoller.orbitControls._targetLookat = new THREE.Vector3(
			0,
			0,
			0
		);
		console.log(this.cameraContoller.orbitControls._targetLookat);
		this.cameraContoller.orbitControls.target = target;
	}
	construct() {
		//insert a div to the top of the element
		const controlPart = document.createElement("div");
		controlPart.setAttribute("class", "wc-box");
		//flip the div on the x axis
		controlPart.setAttribute("style", "transform: rotateY(180deg);");
		controlPart.style.pointerEvents = "auto";
		const exitButton = document.createElement("div");
		exitButton.setAttribute("class", "close");
		exitButton.addEventListener("click", () => {
			clearInterval(this.updateInterval);

			this.scene.remove(this.planeMesh);
			this.cssScene.remove(this.cssObject);
		});
		const zoomInButton = document.createElement("div");
		zoomInButton.setAttribute("class", "maximize");
		const minimizeButton = document.createElement("div");
		minimizeButton.setAttribute("class", "minimize");
		minimizeButton.addEventListener("click", () => {
			this.isSticky = !this.isSticky;
			if (this.isSticky) {
				clearInterval(this.updateInterval);
				minimizeButton.style.backgroundColor = "red";
			} else {
				this.updateInterval = setInterval(() => {
					this.Update();
				}, 900);
				minimizeButton.style.backgroundColor = "blue";
			}
		});

		zoomInButton.addEventListener("click", () => {
			// const elem = this.element.querySelector("#MainContent") as HTMLElement;
			// elem.style.display = "block";

			//create a spherical vector where the target is the center of the element , and the camera is at the top of the element
			const target = this.position.clone();
			const camera = new THREE.Vector3(0, 0, 1);
			const spherical = new THREE.Spherical();
			spherical.setFromVector3(camera.sub(target));
			spherical.radius = 10;
			spherical.phi = Math.PI / 2;
			spherical.theta = 0;

			this.cameraContoller.orbitControls._targetSpherical = spherical;
			this.cameraContoller.orbitControls._targetLookat = new THREE.Vector3(
				0,
				0,
				0
			);
			console.log(this.cameraContoller.orbitControls._targetLookat);
			this.cameraContoller.orbitControls.target = target;
		});

		// make the div have the same width as the element and with a height of 50px
		controlPart.setAttribute(
			"style",
			"width: 100%; height: 30px; background-color: #2f313385; pointer-events: auto;"
		);

		controlPart.appendChild(exitButton);
		controlPart.appendChild(zoomInButton);
		controlPart.appendChild(minimizeButton);

		const div = document.createElement("div");
		div.style.backgroundColor = "#2f313385";
		div.textContent = "test Application  name";
		div.style.width = "16em";

		//		controlPart.appendChild(div);

		// const anotherDiv = document.createElement("div");
		// anotherDiv.style.backgroundColor = "blue";
		// anotherDiv.style.width = "35px";
		// controlPart.appendChild(anotherDiv);

		// noUiSlider.create(div, {
		// 	start: [20],
		// 	connect: true,
		// 	range: {
		// 		"min": 0,
		// 		"max": 100
		// 	}
		// });

		//when the div is double clicked, the element will be removed from the scene
		controlPart.addEventListener("dblclick", () => {
			// 	this.scene.remove(this.planeMesh);
			const target = this.position.clone();
			const camera = new THREE.Vector3(0, 0, 1);
			const spherical = new THREE.Spherical();
			spherical.setFromVector3(camera.sub(target));
			spherical.radius = 10;
			spherical.phi = this.rotation.x + Math.PI / 2;
			spherical.theta = this.rotation.y;

			//make sure is facing the camera

			//center left of the element

			this.cameraContoller.orbitControls._targetSpherical = spherical;
			this.cameraContoller.orbitControls._targetLookat = new THREE.Vector3(
				0,
				0,
				0
			);
			console.log(this.cameraContoller.orbitControls._targetLookat);
			this.cameraContoller.orbitControls.target = target;
			//this.cssScene.remove(this.cssObject);
		});

		//insert the div to the top of the element
		this.element.insertBefore(controlPart, this.element.firstChild);
		const planeMaterial = new THREE.MeshPhongMaterial();
		planeMaterial.color.set("black");
		planeMaterial.opacity = 0.0;
		planeMaterial.blending = THREE.NoBlending;
		planeMaterial.transparent = true;
		planeMaterial.side = THREE.DoubleSide;

		//const height = this.element.style
		this.width = Number(this.element.style.width.replace("px", ""));
		this.height = Number(this.element.style.height.replace("px", ""));

		console.log(this.cssScene.scale);

		//@ts-ignore
		console.log(this.element.style.zoom);

		//const planeWidth = Number(height.replace) / 1000;
		//const planeHeight = Number(width) / 1000;
		const planeGeometry = new THREE.PlaneGeometry(
			this.width * this.cssScene.scale.x,
			this.height * this.cssScene.scale.y
		);
		this.planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

		if (this.name) {
			const myText = new Text();
			this.planeMesh.attach(myText);
			//position the text over the plane on the top left corner
			myText.position.set(
				-(this.width * this.cssScene.scale.x * this.scale.x) / 2  ,
				(this.height * this.cssScene.scale.y *  this.scale.y) / 1.5,
				0.01
			);
			myText.scale.set(this.scale.x * 0.1, this.scale.y * 0.1, 0.1);


			

			myText.text = this.name;
			//myText.scale.set(0.1, 0.1, 0.1);
			myText.color = Math.random() * 0xffffff;
			myText.fontSize = Math.random() * 2 + 0.5;
			myText.sync();
		}

		//this.planeMesh.receiveShadow = true;
		//this.planeMesh.castShadow = true;

		//	this.scene.add(this.planeMesh);
		this.cssObject = new CSS3DObject(this.element);
		//this.cssObject.matrixAutoUpdate = false;
		//this.cssObject.matrixWorldNeedsUpdate = false;
		//this.cssObject.matrix = this.planeMesh.matrix;
		//this.element.style.pointerEvents = "none";

		//this.cssObject.scale.set(this.cssObject.scale.x/2, 2, 2);
		//	this.cssScene.add(this.cssObject);

		this.cssObject.position.z = 80 / this.zoom;
		this.planeMesh.position.z =
			this.cssObject.position.z * this.cssScene.scale.z * this.zoom;

		//this.cssObject.position.x = 6000 / this.zoom;
		this.planeMesh.position.x =
			this.cssObject.position.x * this.cssScene.scale.x * this.zoom;

		this.cssObject.position.y = 80 / this.zoom;
		this.planeMesh.position.y =
			this.cssObject.position.y * this.cssScene.scale.y * this.zoom;
		//this.cssObject.
		this.scene.add(this.planeMesh);

		this.cssScene.add(this.cssObject);
		this.updateInterval = setInterval(() => {
			this.Update();
		}, 900);
	}

	set Position(position: THREE.Vector3) {
		this.position = position;
	}

	get Position() {
		return this.position;
	}

	get Rotation() {
		return this.rotation;
	}

	set Rotation(rotation: THREE.Euler) {
		this.rotation = rotation;
		this.planeMesh.rotation.copy(rotation);
		this.cssObject.rotation.copy(rotation);
	}

	set Scale(scale: THREE.Vector3) {
		this.scale = scale;
	}

	get Scale() {
		return this.scale;
	}

	set Zoom(x: number) {
		this.zoom = x;
	}

	setAll() {
		//@ts-ignore
		this.element.style.zoom = this.zoom;
		//@ts-ignore

		// overide mouse position when dragging

		//@ts-ignore

		this.planeMesh.scale.set(this.scale.x, this.scale.y, this.scale.z);
		this.cssObject.scale.copy(this.scale.clone().multiplyScalar(1 / this.zoom));
		this.planeMesh.position.copy(this.position.clone().multiplyScalar(1));
		this.cssObject.position.copy(
			this.position
				.clone()
				.multiplyScalar(1 / this.cssScene.scale.x / this.zoom)
		);
		// adjust mouse interaction
		//this.cssObject.updateMatrixWorld();
		//this.cssObject.updateWorldMatrix(true, true);
	}

	setTranformableIndex(x: number) {
		this.transformScale = x;
		const widht = (1 / x) * 100;
		const height = (1 / x) * 100;

		const styleString = `transform: scale(${this.TransformScale}); zoom:1; top: 0px; left: 0px; width:${widht}%; height: ${height}%; position: absolute;  transform-origin: 0 0;`;
		const transformable = this.element.getElementsByClassName("transformable");

		for (let i = 0; i < transformable.length; i++) {
			transformable[i].setAttribute("style", styleString);
		}
	}

	Update() {
		const distanceToCamera = this.Position.distanceTo(
			this.cameraContoller.camera.position
		);
		if (distanceToCamera < 40 && this.isActivated == false) {
			this.planeMesh.material.blending = THREE.NoBlending;
			this.planeMesh.material.opacity = 0;
			//this.element.style.opacity = "1";
			this.cssScene.add(this.cssObject);
			this.scene.add(this.planeMesh);
			this.isActivated = true;
		}
		// const b = this.HtmlLabel.firstChild as HTMLElement;
		// b.style.pointerEvents = this.Parent.Manager.MainController.htmlOff
		// 	? "none"
		// 	: "auto";
		if (this.isActivated) {
			if (distanceToCamera < 40) {
				this.element.style.pointerEvents = "auto";
			} else {
				//	this.element.style.pointerEvents = "none";

				//	this.element.style.opacity = "0";
				this.planeMesh.material.blending = THREE.NormalBlending;
				this.planeMesh.material.opacity = 0.1;
				//this.scene.remove(this.planeMesh);
				this.cssScene.remove(this.cssObject);

				this.isActivated = false;

				//		this.planeMesh.material.alphaTest = 0.5;
			}
		}
	}
	//found element with transformable class
}

export { volumineosWebElement };
