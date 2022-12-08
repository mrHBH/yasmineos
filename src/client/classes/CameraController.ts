import { SimpleOrbitControls } from "../SimpleOrbitControls";
import * as THREE from "three";
import { OrbitControlsGizmo } from "../utils/OrbitControlsGizmo";
import { Entity } from "./entity";
import { cpSync } from "fs";
import { ArrowHelper } from "three";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";

class CameraController {
	camera: THREE.PerspectiveCamera;
	orbitControls: SimpleOrbitControls;
	input: any;
	controlsGizmo: OrbitControlsGizmo;
	currentPosition: THREE.Vector3;
	currentLookat: THREE.Vector3;
	target: Entity;
	isFollowing: boolean;
	idealOffset: THREE.Vector3;
	idealLookat: THREE.Vector3;

	originalPosition: THREE.Vector3;
	originalLookat: THREE.Vector3;
	isGoingHome: boolean;
	backupCamera: THREE.PerspectiveCamera;
	speedCoef: number;
	isLerping: any;
	originalSpherical: THREE.Spherical;
	scene: THREE.Scene;
	rayHelper: THREE.ArrowHelper;
	boxMesh: THREE.Mesh;

	constructor(input, camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
		this.input = input;
		this.scene = scene;
		this.camera = camera;
		this.orbitControls = new SimpleOrbitControls(camera);
		this.controlsGizmo = new OrbitControlsGizmo(this.orbitControls, {
			size: 100,
			padding: 8,
		});
		document.body.appendChild(this.controlsGizmo.domElement);

		//create a helper box for orbit controls target , a vector for the offset and a vector for the target
		
		this.boxMesh = new THREE.Mesh(
			new THREE.BoxGeometry(0.1, 0.1, 0.1),
			new THREE.MeshBasicMaterial({ color: "#00ffea"  ,  transparent: true, opacity: 0.1})
		);

		this.scene.add(this.boxMesh);
	}
	set IdealLookat(lookat: THREE.Vector3) {
		this.idealLookat = lookat;
	}
	get IdealLookat() {
		return this.idealLookat;
	}
	get Camera() {
		return this.camera;
	}
	ThirdPersonMode(target: THREE.Object3D, offset: THREE.Vector3) {
		this.camera.position.copy(target.position);
		this.camera.position.add(offset);
		this.camera.lookAt(target.position);
	}

	BirdEyeMode(target: THREE.Object3D, offset: THREE.Vector3) {
		this.camera.position.copy(target.position);
		this.camera.position.add(offset);
		this.camera.lookAt(target.position);
	}

	DisableOrbitControls() {
		this.orbitControls.enabled = false;
	}

	EnableOrbitControls() {
		this.orbitControls.enabled = true;
	}

	SetView(offset: THREE.Vector3, lookat: THREE.Vector3) {
		this.idealOffset = offset;
		this.idealLookat = lookat;
	}

	FollowTarget2(deltaTime: number) {
		const idealOffset = this.idealOffset.clone();
		idealOffset.applyQuaternion(this.target.Quaternion);
		idealOffset.add(this.target.Position);

		const idealLookat = this.idealLookat.clone();
		idealLookat.applyQuaternion(this.target.Quaternion);
		idealLookat.add(this.target.Position);

		const t = 1.0 - Math.pow(this.speedCoef, deltaTime);

		this.currentPosition.lerp(idealOffset, t);
		this.currentLookat.lerp(idealLookat, t);
		this.camera.position.copy(this.currentPosition);
		this.camera.lookAt(this.currentLookat);
	}

	// follow2
	FollowTarget(deltaTime: number) {
		// const quat = this.target.Quaternion.clone();
		// const pos = this.target.Position.clone();
		// const rot = this.target._rotation.clone();

		//	this.orbitControls.target = this.target.Position;

		if (this.target.Quaternion && this.target.Position) {
			const idealOffset = this.idealOffset.clone();
			idealOffset.applyQuaternion(this.target.Quaternion);
			idealOffset.add(this.target.Position);

			const idealLookat = this.idealLookat.clone();
			idealLookat.applyQuaternion(this.target.Quaternion);
			idealLookat.add(this.target.Position);

			const t = 1.0 - Math.pow(this.speedCoef, deltaTime);

			this.currentPosition.lerp(idealOffset, t);
			this.currentLookat.lerp(idealLookat, t);
			//	this.camera.position.copy(this.currentPosition);
			//	this.camera.lookAt(this.currentLookat);
			this.orbitControls._targetLookat = this.currentLookat;
			this.orbitControls.Position = this.currentPosition;
			//this.orbitControls.target = this.target.Position;
		}
		// const a = this.orbitControls._spherical.clone();
		// a.radius = 8;
		// //convert y rotation to  phi
		// //a.phi=THREE.MathUtils.degToRad(this.targetEntity._rotation.y * 2 * Math.PI);
		// console.log( this.target._rotation.y);
		// a.theta = (( this.target._rotation.y + 1) * Math.PI) % 1;
		// a.phi = 0.9;
		// console.log(this.target.Position.y);
		// console.log(this.orbitControls.Sphercial);
		//		a.makeSafe();
	}

	FollowTarget5(deltaTime: number) {
		// const quat = this.target.Quaternion.clone();
		// const pos = this.target.Position.clone();
		// const rot = this.target._rotation.clone();

		//	this.orbitControls.target = this.target.Position;

		if (this.target.Quaternion && this.target.Position) {
			const idealOffset = this.idealOffset.clone();
			idealOffset.applyQuaternion(this.target.Quaternion);
			idealOffset.add(this.target.Position);

			const idealLookat = this.idealLookat.clone();
			idealLookat.applyQuaternion(this.target.Quaternion);
			idealLookat.add(this.target.Position);

			const t = 1.0 - Math.pow(this.speedCoef, deltaTime);



			this.currentPosition.lerp(idealOffset, t);
			this.currentLookat.lerp(idealLookat, t);
			//	this.camera.position.copy(this.currentPosition);
			//	this.camera.lookAt(this.currentLookat);

			const vec2 = 	 this.currentLookat;
		//	vec2.y=3;
		//	vec2.z =3;

			this.orbitControls._targetLookat = this.currentLookat;

			const vec = 	 this.currentPosition;
		//	vec.y=4;
			//vec.z = this.target.Position.z;
		
			this.orbitControls.Position=vec;
		
			//this.orbitControls.target = this.target.Position;
		}
		// const a = this.orbitControls._spherical.clone();
		// a.radius = 8;
		// //convert y rotation to  phi
		// //a.phi=THREE.MathUtils.degToRad(this.targetEntity._rotation.y * 2 * Math.PI);
		// console.log( this.target._rotation.y);
		// a.theta = (( this.target._rotation.y + 1) * Math.PI) % 1;
		// a.phi = 0.9;
		// console.log(this.target.Position.y);
		// console.log(this.orbitControls.Sphercial);
		//		a.makeSafe();
	}

	FollowTarget3(deltaTime: number) {
	
		//just copy the target position 
		this.orbitControls.target = this.target.Position;
	
	
		// this.orbitControls._targetSpherical.theta =  this.target._rotation.y;
		// this.orbitControls._targetSpherical.phi =Math.PI/4 ;
		// this.orbitControls._targetSpherical.radius = 8;

		
		

		// const t = 1.0 - Math.pow(this.speedCoef, deltaTime);
		// this.currentPosition.lerp(this.originalPosition, t);
		// this.currentLookat.lerp(this.originalLookat, t);
		// this.orbitControls._targetSpherical = this.originalSpherical;
	//	this.orbitControls._spherical.theta = this.target._rotation.y;
	//	this.orbitControls._spherical.phi = this.target._rotation.x;
	
	}

	LerpToPlace(deltaTime: number) {
		const t = 1.0 - Math.pow(this.speedCoef, deltaTime);
		this.currentPosition.lerp(this.originalPosition, t);
		this.currentLookat.lerp(this.originalLookat, t);
		this.orbitControls._targetSpherical = this.originalSpherical;

		if (this.currentPosition.distanceTo(this.originalPosition) < 0.01) {
			this.isLerping = false;
			//	this.orbitControls.enabled = true;
		}
	}

	StartFollowingCar(target: Entity , speedCoef: number, offset: THREE.Vector3, lookat: THREE.Vector3 , spherical: THREE.Spherical) {
	

		
		this.speedCoef = speedCoef;
		//this.orbitControls.normalizeAngle();

		this.isFollowing = true;
		this.target = target;
		this.idealOffset = offset;
		this.idealLookat = lookat;
		this.originalSpherical = spherical;


		 this.currentLookat = this.orbitControls._lookat.clone();

		 this.currentPosition = this.orbitControls.Position.clone();

		this.orbitControls.processInput=false;

		// this.orbitControls._targetOffset = offset;
		// this.orbitControls._targetLookat = lookat;
		// this.orbitControls._targetSpherical = spherical; 

		//this.orbitControls.directionLerpSpeed = 0;

	
	
	}

	StartFollowing(
		entity: Entity,
		Speed: number,
		idealOffset: THREE.Vector3,
		idealLookat: THREE.Vector3
	) {
		//	this.orbitControls.enabled = false;
		//this.orbitControls.setMemory();

		this.speedCoef = Speed;
		this.orbitControls.normalizeAngle();

		this.isFollowing = true;
		this.target = entity;
		this.idealOffset = idealOffset;
		this.idealLookat = idealLookat;

		this.currentPosition = this.orbitControls.Position.clone();
		this.currentLookat = this.orbitControls._lookat.clone();
		this.backupCamera = this.camera.clone();

		this.originalLookat = this.orbitControls._lookat.clone();
		this.originalPosition = this.orbitControls.Position.clone();
		this.originalSpherical = this.orbitControls.Sphercial.clone();

		this.orbitControls.processInput=false;

		this.orbitControls._targetOffset = new THREE.Vector3();
		this.orbitControls.positionLerpSpeed = 0;
		this.orbitControls.directionLerpSpeed = 0;
	}

	//Home position

	StopFollowing() {
	//	this.orbitControls.enabled = true;
		this.orbitControls.processInput=true;
		//this.orbitControls.normalizeAngle();



		// this.isFollowing = false;
		// this.isLerping = true;
		// this.orbitControls.normalizeAngle();
		// this.orbitControls._targetLookat = new THREE.Vector3();
		// this.orbitControls.target = this.target.Position;

		this.isFollowing = false;
		this.isLerping = true;

		const target = this.target.Position.clone();
		const camera = new THREE.Vector3(0, 3, 0);
		const spherical = this.originalSpherical.clone();	
		spherical.setFromVector3(camera.sub(target));
		//spherical.radius = 10;
		// spherical.phi = -Math.PI / 2;
		// spherical.theta = Math.PI / 2;

		


		//this.orbitControls._targetSpherical = spherical;
		//this.orbitControls._targetOffset = new THREE.Vector3();
		//this.orbitControls.Position = 	this.currentPosition;
		// this.orbitControls._targetLookat = new THREE.Vector3(0, 0, 0);
		// this.orbitControls._lookat = new THREE.Vector3(0, 0, 0);
		// this.orbitControls._targetSpherical = spherical;
		// this.orbitControls._spherical = spherical;
		// this.orbitControls._targetOffset = new THREE.Vector3();
		// this.orbitControls._offset = new THREE.Vector3();

		console.log(this.orbitControls._targetLookat);
		//this.orbitControls.target= this.currentPosition;
		//this.orbitControls._targetOffset = new THREE.Vector3();
		//this.orbitControls._lookat = new THREE.Vector3();
		

//		this.orbitControls._targetLookat=this.currentLookat ;
		//this.orbitControls.target = target;
		
		this.orbitControls.positionLerpSpeed = 10;
		this.orbitControls.directionLerpSpeed = 10;

		//this.orbitControls._targetSpherical = this.originalSpherical;
		//	this.orbitControls._targetLookat = this.originalLookat;
		//	this.orbitControls.Position = this.target.Position.clone();
		//	this.orbitControls.SetViewFromCurrentCamera();
		//this.orbitControls.target= this.target.Position;
		//this.orbitControls.SetLookAt(this.target.Position);
		//this.target = null;

		//
	}

	UpdateOrbitControls(timeElapsed: number) {
		const rotateCamera = this.input.mouseDown(this.input.MouseButtons.right);
		const moveCamera = this.input.mouseDown(this.input.MouseButtons.left);
		const mouseDelta = this.input.mouseDelta;

		// zoom value
		let zoom = this.input.mouseWheel;
		//zoom=zoom+160
		if (this.input.down("up_arrow")) {
			this.orbitControls.update({
				deltaTime: timeElapsed,
				moveOffsetVertically: -500,
			});
		}

		if (this.input.down("z")) {
			this.orbitControls.update({
				deltaTime: timeElapsed,
				moveTargetForward: 5000,
				//     -86.50108998617313 -410.69511237116984 182.3565797990458
			});
		}

		if (this.input.down("x")) {
			//project mouse position to world
			this.orbitControls.target = this.target.Position;
		}
		if (this.input.pressed("n3")) {
			this.orbitControls.setMemory();
		}
		if (this.input.pressed("n2")) {
			this.orbitControls.restoreMemory();
		}

		if (this.input.keyDown(this.input.KeyboardKeys.shift)) {
			if (this.target) {
				//	this.orbitControls._targetOffset = new THREE.Vector3();

				//this.FollowTarget(timeElapsed);
				//	this.orbitControls.target = this.target.Position;
				//	this.orbitControls.Position = this.target.Position;
				//lerp position
				//this.orbitControls.Position.lerp(this.target.Position, 0.1);
				// 		const a = this.orbitControls._spherical.clone();
				// 		a.radius = 8;
				// 		//convert y rotation to  phi
				// 		//a.phi=THREE.MathUtils.degToRad(this.target._rotation.y * 2 * Math.PI);
				// 		console.log(this.target._rotation.y);
				// 		// a.theta = ((this.target._rotation.y + 1) * Math.PI) % 1;
				// 		// a.phi = 0.9;
				// 		// console.log(this.target._rotation.y);
				// 		// console.log(this.orbitControls.Sphercial);
				// //		a.makeSafe();
				// //		this.simpleOrbitControls._targetSpherical = a;
			}
		}

		if (this.input.keyDown(this.input.KeyboardKeys.g)) {
			this.orbitControls.dollyIn(1);
		}
		if (this.input.keyDown(this.input.KeyboardKeys.b)) {
			this.orbitControls.dollyIn(-1);
		}

		if (this.input.down("down_arrow"))
			this.orbitControls.update({
				deltaTime: timeElapsed,
				moveOffsetVertically: 500,
			});

		if (this.input.down("left_arrow"))
			this.orbitControls.update({
				deltaTime: timeElapsed,
				moveOffsetHorizontally: 500,
			});

		if (this.input.down("right_arrow"))
			this.orbitControls.update({
				deltaTime: timeElapsed,
				moveOffsetHorizontally: -500,
			});

		// if (this.input.down("z")) {
		// 	this.orbitControls.update({
		// 		deltaTime: timeElapsed,
		// 		moveTargetForward: 1500,
		// 	});
		// }
		if (this.input.down("page_up")) zoom += 100;

		if (this.input.down("page_down")) zoom -= 100;

		// update controls
		this.orbitControls.update({
			deltaTime: timeElapsed,
			rotateHorizontally: rotateCamera ? -mouseDelta.x / 1.6 : 0,
			rotateVertically: rotateCamera ? -mouseDelta.y / 1.6 : 0,
			moveOffsetVertically: (moveCamera ? -mouseDelta.y : 0) * 5,
			moveOffsetHorizontally: (moveCamera ? mouseDelta.x : 0) * 5,
			zoom: zoom * 0.8,
		});

		//when mouse is clicked , the intersection point becomes the lookat point
		//if (this.input.mouseDown(this.input.MouseButtons.left)) {
		//this.orbitControls._lookat = this.input.intersectionPoint;
		//create a ray from the camera to the intersection point
		// if (this.input.released("mouse_left")) {
		// 	const mousepos = this.input.mousePosition;
		// 	const ray = new THREE.Raycaster(
		// 		this.camera.position,
		// 		new THREE.Vector3(
		// 			(mousepos.x / window.innerWidth) * 2 - 1,
		// 			-(mousepos.y / window.innerHeight) * 2 + 1,
		// 			0.5
		// 		)
		// 			.unproject(this.camera)
		// 			.sub(this.camera.position)
		// 			.normalize()
		// 	);
		// 	const intersects = ray.intersectObjects(this.scene.children, true);
		// 	if (intersects.length > 0) {
		// 		//	this.orbitControls._lookat = intersects[0].point;
		// 		//	this.orbitControls._targetOffset = new THREE.Vector3();
		// 		const arrowHelper = new THREE.ArrowHelper(
		// 			ray.ray.direction,
		// 			ray.ray.origin,
		// 			ray.ray.origin.distanceTo(intersects[0].point),
		// 			"#ff0000",
		// 			0.3,
		// 			0.1
		// 		);

				
		// 		const head=arrowHelper.cone as THREE.Mesh;
		// 		const body=arrowHelper.line as THREE.Line;
		// 		const material=new THREE.MeshBasicMaterial({color:"#0011ff" ,transparent:true,opacity:0.5});
		// 		head.material=  material ;
		// 		body.material=material ;	
				
		// 		console.log(intersects[0]);
		// 	//	this.scene.add(arrowHelper);

		// 		//fade arrow 
		// 		const tween = new TWEEN.Tween(arrowHelper.cone.material)
		// 			.to({ opacity: 0 }, 2000)
		// 			.easing(TWEEN.Easing.Quadratic.Out)
		// 			.onUpdate(() => {
		// 				//make body shorter
		// 				arrowHelper.line.scale.y -= 0.01;})
		// 			.onComplete(() => {
		// 				this.scene.remove(arrowHelper);
		// 			})
		// 			.start();



		// 		// setTimeout(() => {
		// 		// 	//decay the opacity of the arrow until it disappears
		// 		// 	const decay = () => {
		// 		// 		arrowHelper.material.opacity -= 0.01;
		// 		// 		if (arrowHelper.material.opacity > 0) {
		// 		// 			setTimeout(decay, 100);
		// 		// 		} else {
		// 		// 			this.scene.remove(arrowHelper);
		// 		// 		}
		// 		// 	};
		// 		// 			//delete the arrow

							


					
		// 		// }, 3000);
		// 	}
		// 	//create arrow helper

		// 	// this.orbitControls.SetLookAt(intersects[0].point);
		// 	// this.orbitControls.target = intersects[0].point.clone().addVectors(intersects[0].point, this.orbitControls._targetOffset);
		// 	//  this.orbitControls._targetOffset = new THREE.Vector3();

		// 	// //offset orbit controls position to be behind the target
		// 	// this.orbitControls._spherical.radius = 8;
		// 	// this.orbitControls._spherical.phi = 0.9;
		// 	// this.orbitControls._spherical.theta = ((this.target._rotation.y + 1) * Math.PI) % 1;
		// 	// this.orbitControls._spherical.makeSafe();

		// 	//make the orbit controls position the same as the target
		// 	// this.orbitControls.Position = intersects[0].point;
		// 	// this.orbitControls._lookat = intersects[0].point;
		// 	//this.orbitControls._targetOffset = new THREE.Vector3();

		// 	// //visualize the ray as an arrow
		// 	// if (!this.rayHelper){this.scene.add(this.rayHelper);}
		// 	// this.rayHelper = new THREE.ArrowHelper(
		// 	// 	ray.ray.direction,
		// 	// 	ray.ray.origin,
		// 	// 	100,
		// 	// 	0xff0000
		// 	// );

		// 	//castt the ray
		// 	//const intersects = ray.intersectObjects(this.scene.children, true);

		// 	console.log("mouse down");
		// }

		// }
	}

	Update(deltaTime: number) {
		if (this.isFollowing && this.target) {
			this.FollowTarget5(deltaTime);
		} else if (this.isLerping) {
			//this.LerpToPlace(deltaTime);
		}

		this.controlsGizmo.update(deltaTime);
		this.UpdateOrbitControls(deltaTime);
		if (this.boxMesh) {
			this.boxMesh.position.copy(this.orbitControls.target);
		}
	}
}

export { CameraController };
