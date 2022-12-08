import { Component } from "./entity";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import * as THREE from "three";
import { MainController } from "./MainController";
import { Pane } from "tweakpane";
import { CameraController } from "./CameraController";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";

class TitleBarComponent extends Component {
	sphereMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
	CSS2DLabel: CSS2DObject;
	mainCamera: THREE.Camera;
	HtmlLabel: HTMLDivElement;
	HtmlMainContent: HTMLDivElement;
	pane: Pane;
	mc : MainController;
	
	constructor() {
		super();

	}
	InitEntity() {
		this.mc = this.Parent.Manager.MainController as MainController;
		this.mainCamera = this.mc.CameraController.Camera;
		this.initialize();
		
	}
	
	initialize() {
		if (this.Parent.GetComponent("CarPhysicsComponent") != null) {

			this.HtmlMainContent = document.createElement("div");
			this.HtmlMainContent.id = "mainContent";

			// make 600x400px transparent grey div
			this.HtmlMainContent.style.width = "0px";
			this.HtmlMainContent.style.height = "0px";
			this.HtmlMainContent.style.opacity = "0";
			//this.HtmlMainContent.style.transform= "scale(2.25)";
			// //@ts-ignore
			// this.HtmlMainContent.style.zoom = "1";
			this.HtmlMainContent.style.transformOrigin = "0 0";
			this.HtmlMainContent.style.backgroundColor = "rgba(0,0,0,0.5)";
			this.HtmlMainContent.style.pointerEvents = "auto";
			this.HtmlMainContent.style.transition =
				"width 0.51s ease-in-out, height 0.51s ease-in-out, opacity 1.01s ease-in-out";

			this.HtmlMainContent.style.transform = "scale(1.5)";			
			this.HtmlLabel = document.createElement("div");
			M.AutoInit();
			this.HtmlLabel.innerHTML = `<div class=" chip    waves-effect waves-light waves-teal">

        
         <img src="images/car.png" >
           ${this.Parent.Name + "CARX"}
          
            
         </div>
        `;
			const b = this.HtmlLabel.firstChild as HTMLElement;
			b.style.backgroundColor = "#8800ff85";
			b.style.fontSize = "18px";
			b.style.color = "White";
			b.style.fontWeight = "bolder";
			b.style.opacity = "0.9";
			b.style.transform = "scale(0.95)";

			b.onclick = function () {
				M.toast({ html: "I am " + this.Parent._name, classes: "rounded" }); 
				//add a div where a transparent text is shown chat style

				

				//const mc = this.Parent.Manager.MainController as MainController;

				this.mc.SetTargetEntity(this.Parent);
				

				//    this.FSMservice.send('CANCEL_ACTION')
				//   this.FSMservice.send('ACTION')
				//      console.log(this.BecomeMain)
				//  this.parent.setMainPLayer(this)
			}.bind(this);
			b.ondblclick = function () {
				//const mc = this.Parent.Manager.MainController as MainController;
				this.mc.CameraController.StartFollowing(
					this.Parent,
					0.11,
					new THREE.Vector3(8,5,0),
					new THREE.Vector3(-10, 0, 0),
					new THREE.Spherical(5, 0, 0)
				);
			}.bind(this);
			this.HtmlLabel.oncontextmenu = function () {
				M.toast({ html: "I am " + this.Parent._name + "right clicked!!!!" });
				//this.toggleMainContent();
				if (this.isMainContentVisible) {
					this.hideMainContent();
				} else {
					this.showMainContent();
				}
			}.bind(this);

			//this.HtmlLabel.style.pointerEvents = 'auto'
			this.HtmlLabel.style.pointerEvents = "none";
			this.HtmlLabel.style.transition = "all 0.1s ease";
			this.CSS2DLabel = new CSS2DObject(this.HtmlLabel);
			this.CSS2DLabel.name = "CSS2DLabel";

		//	this.HtmlLabel.appendChild(this.HtmlMainContent);

		//	Head.add(this.sphereMesh);
			this.Parent.Mesh.add(this.CSS2DLabel);
			//Head.add(this.CSS2DLabel);

			//  this.CSS2DLabel.matrixWorld.decompose( this.CSS2DLabel.position, this.CSS2DLabel.quaternion, new THREE.Vector3() );
			this.CSS2DLabel.position.set(0, 1, 0);
			// const mc = this.Parent.Manager.MainController as MainController;
			// this.mainCamera = mc.BirdCam;
			this.HtmlMainContent.onmousemove = function () {
				//mc.CameraController.orbitControls.processInput = false;
			}.bind(this);
			this.HtmlMainContent.onmouseout = function () {
				//	mc.CameraController.orbitControls.processInput = true;
			}.bind(this);

			return;


		}
		const Head = this.Parent?._mesh?.getObjectByName("mixamorigSpine");

		if (Head) {
			this.HtmlMainContent = document.createElement("div");
			this.HtmlMainContent.id = "mainContent";

			// make 600x400px transparent grey div
			this.HtmlMainContent.style.width = "0px";
			this.HtmlMainContent.style.height = "0px";
			this.HtmlMainContent.style.opacity = "0";
			//this.HtmlMainContent.style.transform= "scale(2.25)";
			// //@ts-ignore
			// this.HtmlMainContent.style.zoom = "1";
			this.HtmlMainContent.style.transformOrigin = "0 0";
			this.HtmlMainContent.style.backgroundColor = "rgba(0,0,0,0.5)";
			this.HtmlMainContent.style.pointerEvents = "auto";
			this.HtmlMainContent.style.transition =
				"width 0.51s ease-in-out, height 0.51s ease-in-out, opacity 1.01s ease-in-out";

			this.HtmlMainContent.style.transform = "scale(1.5)";

			//add a sphere
			const sphere = new THREE.SphereGeometry(10, 90, 90);
			const material = new THREE.MeshBasicMaterial({ color: 0x7fffff });
			this.sphereMesh = new THREE.Mesh(sphere, material);

			this.HtmlLabel = document.createElement("div");
			M.AutoInit();
			//    this.HtmlLabel.innerHTML = `<div class=" chip tooltipped   waves-effect waves-light waves-teal" data-position="bottom" data-tooltip="I am a tooltip">
			this.HtmlLabel.innerHTML = `<div class=" chip    waves-effect waves-light waves-teal">

        
         <img src="images/ybot.png" >
           ${this.Parent._name}
          
            
         </div>
        `;
			const b = this.HtmlLabel.firstChild as HTMLElement;
			b.style.backgroundColor = "#0099ff85";
			b.style.fontSize = "18px";
			b.style.color = "White";
			b.style.fontWeight = "bolder";
			b.style.opacity = "0.9";
			b.style.transform = "scale(0.95)";

			b.onclick = function () {
				M.toast({ html: "I am " + this.Parent._name, classes: "rounded" });

				//const mc = this.Parent.Manager.MainController as MainController;

				this.mc.SetTargetEntity(this.Parent);

				const target = this.Parent.Position.clone();
				const camera = new THREE.Vector3(0, 0, 1);
				const spherical = new THREE.Spherical();
				spherical.setFromVector3(camera.sub(target));
				spherical.radius = 10;
				spherical.phi = this.mc.CameraController.orbitControls._spherical.phi;
				spherical.theta = this.mc.CameraController.orbitControls._spherical.theta;
	
				//make sure is facing the camera
	
				//center left of the element
	
				this.mc.CameraController.orbitControls._targetSpherical = spherical;

				//tween lookat back to zero
				// const tween = new TWEEN.Tween(this.mc.CameraController.orbitControls._targetLookat)
				// 	.to({ x: 0, y: 0, z: 0 }, 1000)
				// 	.easing(TWEEN.Easing.Quadratic.Out)
				// 	.start();
				//tween lookat back to zero
				
				 this.mc.CameraController.orbitControls._targetLookat = new THREE.Vector3(
					0,
					0,
					0
				);
				console.log(this.mc.CameraController.orbitControls._targetLookat);
				this.mc.CameraController.orbitControls.target = target;

				//    this.FSMservice.send('CANCEL_ACTION')
				//   this.FSMservice.send('ACTION')
				//      console.log(this.BecomeMain)
				//  this.parent.setMainPLayer(this)
			}.bind(this);
			b.ondblclick = function () {
				//const mc = this.Parent.Manager.MainController as MainController;
				this.mc.CameraController.StartFollowing(
					this.Parent,
					0.05,
					new THREE.Vector3(0, 1, -3),
					new THREE.Vector3(0, 1, 0)
				);
			}.bind(this);
			this.HtmlLabel.oncontextmenu = function () {
				M.toast({ html: "I am " + this.Parent._name + "right clicked!!!!" });
				//this.toggleMainContent();
				if (this.isMainContentVisible) {
					this.hideMainContent();
				} else {
					this.showMainContent();
				}
			}.bind(this);

			//this.HtmlLabel.style.pointerEvents = 'auto'
			this.HtmlLabel.style.pointerEvents = "none";
			this.HtmlLabel.style.transition = "all 0.1s ease";
			this.CSS2DLabel = new CSS2DObject(this.HtmlLabel);
			this.CSS2DLabel.name = "CSS2DLabel";

			this.HtmlLabel.appendChild(this.HtmlMainContent);

			Head.add(this.sphereMesh);
			Head.add(this.CSS2DLabel);

			//  this.CSS2DLabel.matrixWorld.decompose( this.CSS2DLabel.position, this.CSS2DLabel.quaternion, new THREE.Vector3() );
			this.CSS2DLabel.position.set(0, 160, 0);
			// const mc = this.Parent.Manager.MainController as MainController;
			// this.mainCamera = mc.BirdCam;
			this.HtmlMainContent.onmousemove = function () {
				//mc.CameraController.orbitControls.processInput = false;
			}.bind(this);
			this.HtmlMainContent.onmouseout = function () {
				//	mc.CameraController.orbitControls.processInput = true;
			}.bind(this);
			// this.ToggleLableInterval = setInterval(() => {
			// 	//   console.log(this.Parent._name + ' ' + distanceToCamera)
			// }, 500);

			//	this.HtmlLabel.appendChild(this.HtmlMainContent);
		} else {
			console.log(this.Parent._name + "head Not found");
		}
	}
	showMainContent() {
		if (!this.isMainContentVisible) {
			//this.HtmlLabel.appendChild(this.HtmlMainContent);
			//this.HtmlMainContent.
			//this.HtmlLabel
			this.HtmlMainContent.style.opacity = "1";
			this.HtmlMainContent.style.width = "600px";
			this.HtmlMainContent.style.height = "400px";
			this.HtmlMainContent.style.transform = "scale(1.5)";
			const styleElement = document.createElement("style");
			styleElement.innerHTML = `

:root {
	rounded:2.5rem;

  --tp-base-background-color: hsla(0, 0%, 8%, 0.80);
  --tp-base-shadow-color: hsla(0, 0%, 100%, 0.20);
  --tp-button-background-color: hsla(0, 0%, 80%, 1);
  --tp-button-background-color-active: hsla(0, 0%, 100%, 1);
  --tp-button-background-color-focus: hsla(0, 0%, 95%, 1);
  --tp-button-background-color-hover: hsla(0, 0%, 85%, 1);
  --tp-button-foreground-color: hsla(0, 0%, 0%, 0.8);
  --tp-container-background-color: hsla(0, 0%, 0%, 0.3);
  --tp-container-background-color-active: hsla(0, 0%, 0%, 0.6);
  --tp-container-background-color-focus: hsla(0, 0%, 0%, 0.5);
  --tp-container-background-color-hover: hsla(0, 0%, 0%, 0.4);
  --tp-container-foreground-color: hsla(0, 0%, 100%, 0.5);
  --tp-groove-foreground-color: hsla(0, 0%, 0%, 0.2);
  --tp-input-background-color: hsla(0, 0%, 0%, 0.3);
  --tp-input-background-color-active: hsla(0, 0%, 0%, 0.6);
  --tp-input-background-color-focus: hsla(0, 0%, 0%, 0.5);
  --tp-input-background-color-hover: hsla(0, 0%, 0%, 0.4);
  --tp-input-foreground-color: hsla(0, 0%, 100%, 0.5);
  --tp-label-foreground-color: hsla(0, 0%, 100%, 0.5);
  --tp-monitor-background-color: hsla(0, 0%, 0%, 0.3);
  --tp-monitor-foreground-color: hsla(0, 0%, 100%, 0.3);
}
`;

			this.HtmlMainContent.appendChild(styleElement);

			this.CSS2DLabel.position.set(0, 160, 0);
			//add a tweak pane
			this.pane = new Pane({
				container: this.HtmlMainContent,
				title: this.Parent._name,
				expanded: false,
			});

			const mc = this.Parent.Manager.MainController as MainController;
			const CameraController = mc.CameraController as CameraController;

			this.pane.addInput(CameraController, "IdealLookat", {
				x: { min: -100, max: 100, step: 0.1 },
				y: { min: -100, max: 100, step: 0.1 },
				z: { min: -100, max: 100, step: 0.1 },
			});
			this.pane.addInput(CameraController, "idealOffset", {
				x: { min: -100, max: 100, step: 0.1 },
				y: { min: -100, max: 100, step: 0.1 },
				z: { min: -100, max: 100, step: 0.1 },
			});
			this.pane.addInput({ x: 0, y: 0, z: 0 }, "x", {
				min: -10,
				max: 10,
				step: 0.1,
			});
			// this.pane.addInput(
			// 	this.Parent.GetComponent("CarPhysicsComponent"),
			// 	"maxBreakForce",
			// 	{
			// 		min: -10000,
			// 		max: 10000,
			// 		step: 0.1,
			// 	}
			// );

			const btn = this.pane.addButton({
				title: "Increment",
				label: "counter", // optional
			});

			let count = 0;
			btn.on("click", () => {
				count += 1;
				count += 1;
				this.Parent.GetComponent(
					"CarPhysicsComponent"
				).maxBreakForce = count * 10;
				count *= 10;
			});

			const btn2 = this.pane.addButton({
				title: "Increase!",
				label: "decrease", // optional
			});

			btn2.on("click", () => {
				this.HtmlMainContent.style.width = "500px";
				this.HtmlMainContent.style.height = "400px";
			});

			const btn3 = this.pane.addButton({
				title: "decrease!",
				label: "decrease", // optional
			});

			btn3.on("click", () => {
				this.HtmlMainContent.style.width = "200px";
				this.HtmlMainContent.style.height = "200px";

				//this.HtmlMainContent.style.transform = "translate(-50%, -50%)";
			});

			this.pane.addBlade({
				view: "slider",
				label: "brightness",
				min: 0,
				max: 1,
				value: 0.5,
			});
			this.isMainContentVisible = true;
		}
	}
	hideMainContent() {
		if (this.isMainContentVisible) {
			//this.HtmlLabel.removeChild(this.HtmlMainContent);
			//this.HtmlMainContent.style.display = "none";
			this.pane.dispose();
			this.HtmlMainContent.innerHTML = "";
			this.HtmlMainContent.style.opacity = "0";
			this.HtmlMainContent.style.width = "0px";
			this.HtmlMainContent.style.height = "0px";

			//this.pane.dispose();

			this.CSS2DLabel.position.set(0, 120, 0);
			this.isMainContentVisible = false;
		}
	}
	// toggleMainContent() {
	// 	this.isMainContentVisible = !this.isMainContentVisible;
	// 	const mc = this.Parent.Manager.MainController as MainController;
	// 	const CameraController = mc.CameraController as CameraController;

	// 	if (this.isMainContentVisible) {
	// 		this.HtmlLabel.appendChild(this.HtmlMainContent);
	// 		this.CSS2DLabel.position.set(-300, 40, 0);
	// 		//add a tweak pane
	// 		const pane = new Pane({
	// 			container: this.HtmlMainContent,
	// 			title: this.Parent._name,
	// 			expanded: true,
	// 		});

	// 		pane.addInput(CameraController, "IdealLookat", {
	// 			x: { min: -100, max: 100, step: 0.1 },
	// 			y: { min: -100, max: 100, step: 0.1 },
	// 			z: { min: -100, max: 100, step: 0.1 },
	// 		});
	// 		pane.addInput(CameraController, "idealOffset", {
	// 			x: { min: -100, max: 100, step: 0.1 },
	// 			y: { min: -100, max: 100, step: 0.1 },
	// 			z: { min: -100, max: 100, step: 0.1 },
	// 		});
	// 		pane.addInput({ x: 0, y: 0, z: 0 }, "x", {
	// 			min: -10,
	// 			max: 10,
	// 			step: 0.1,
	// 		});
	// 		pane.addInput(
	// 			this.Parent.FindEntity("CarEntity").GetComponent("CarPhysicsComponent"),
	// 			"maxBreakForce",
	// 			{
	// 				min: -10000,
	// 				max: 10000,
	// 				step: 0.1,
	// 			}
	// 		);

	// 		const btn = pane.addButton({
	// 			title: "Increment",
	// 			label: "counter", // optional
	// 		});

	// 		let count = 0;
	// 		btn.on("click", () => {
	// 			count += 1;
	// 			count += 1;
	// 			this.Parent.FindEntity("CarEntity").GetComponent(
	// 				"CarPhysicsComponent"
	// 			).maxBreakForce = count * 10;
	// 			count *= 10;
	// 		});

	// 		const btn2 = pane.addButton({
	// 			title: "Increase!",
	// 			label: "decrease", // optional
	// 		});

	// 		btn2.on("click", () => {
	// 			this.HtmlMainContent.style.width = "500px";
	// 			this.HtmlMainContent.style.height = "400px";
	// 		});

	// 		const btn3 = pane.addButton({
	// 			title: "decrease!",
	// 			label: "decrease", // optional
	// 		});

	// 		btn3.on("click", () => {
	// 			this.HtmlMainContent.style.width = "200px";
	// 			this.HtmlMainContent.style.height = "200px";

	// 			//this.HtmlMainContent.style.transform = "translate(-50%, -50%)";
	// 		});

	// 		pane.addBlade({
	// 			view: "slider",
	// 			label: "brightness",
	// 			min: 0,
	// 			max: 1,
	// 			value: 0.5,
	// 		});
	// 	} else {
	// 		this.CSS2DLabel.position.set(0, 40, 0);

	// 		//remove tweak pane
	// 		if (this.HtmlMainContent.hasChildNodes()) {
	// 			this.HtmlMainContent.removeChild(this.HtmlMainContent.lastChild!);
	// 		}
	// 		this.HtmlMainContent.remove();
	// 	}
	// }

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Update(timeElapsed: number) {
		
		const distanceToCamera = this.Parent.Position.distanceTo(
			this.mainCamera.position
		);
		const b = this.HtmlLabel.firstChild as HTMLElement;
		b.style.pointerEvents = this.mc.htmlOff
			? "none"
			: "auto";
		if (distanceToCamera < 5) {
			b.style.opacity = "0.9";
			//this.HtmlLabel.style.opacity = "0.9";
		} else if (distanceToCamera < 10) {
			b.style.opacity = "0.5";
			//	this.HtmlLabel.style.opacity = "0.5";
		} else if (distanceToCamera < 20) {
			b.style.opacity = "0.3";
			//	this.HtmlLabel.style.opacity = "0.3";
		} else if (distanceToCamera < 40) {
			b.style.opacity = "0.1";
			//	this.HtmlLabel.style.opacity = "0.1";
		} else {
			b.style.pointerEvents = "none";

			b.style.opacity = "0";
			//this.hideMainContent();
			//this.HtmlLabel.style.opacity = "0";
		}
	}
	Destroy(): void {
		this.sphereMesh.parent.remove(this.sphereMesh);
		this.CSS2DLabel.parent.remove(this.CSS2DLabel);
	//	clearInterval(this.ToggleLableInterval);
	}

	InitComponent() {
		if (this.Parent.Name!= null) {
		//	this.initialize();
		}
	
		//this.initialize();
	}
}
export { TitleBarComponent };
