/* eslint-disable linebreak-style */
import * as THREE from "three";
import { ArrowHelper } from "three";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";

/**
 * Simple Orbit Camera Controls, an alternative to the default OrbitControls provided by THREE.js examples.
 * Key differences:
 *  1. Handle changing target position differently.
 *  2. Handle lerping differently.
 *  3. Get input from outside, instead of registering to events internally.
 *  4. Shorter, simpler code.
 * Author: Ronen Ness.
 * Since: 09/01/2020.
 */


/**
 * Orbit camera controller.
 */

class SimpleOrbitControls {
	camera: THREE.Camera;
	_targetSpherical: THREE.Spherical;
	_spherical: THREE.Spherical;
	_targetLookat: THREE.Vector3;
	_lookat: THREE.Vector3;
	_targetOffset: THREE.Vector3;
	_offset: THREE.Vector3;
	directionLerpSpeed: number;
	positionLerpSpeed: number;
	distanceMin: number;
	distanceMax: number;
	enabled = true;
	targetHelper: THREE.ArrowHelper;
	memory: {
		position: THREE.Vector3;
		lookat: THREE.Vector3;
		offset: THREE.Vector3;
		spherical: THREE.Spherical;
	};
	processInput: boolean ;
	/**
	 * Create the orbit camera controller.
	 */
	constructor(camera) {
		// store params

		this.camera = camera;
		this.processInput = true;
		//this.scene.add(this.targetHelper);
		// spherical coordinates (rotation + zoom)
		// _targetSpherical = future spherical we transition to using lerp.
		// _spherical = current value.
		this._targetSpherical = new THREE.Spherical();
		this._spherical = new THREE.Spherical();
		this.setFromCamera(camera);
		// position we focus on
		// _targetLookat = future lookat we transition to using lerp.
		// _lookat = current lookat target.
		this._targetLookat = new THREE.Vector3();
		this._lookat = new THREE.Vector3();

		// offset for position and lookat target we focus on
		// _targetOffset = future offset we transition to using lerp.
		// _offset = current offset.
		this._targetOffset = new THREE.Vector3();
		this._offset = new THREE.Vector3();

		// some defaults
		//this.position = this.camera.position;
		this.directionLerpSpeed = 10;
		this.positionLerpSpeed = 10;
		this.distanceMin = 1;
		this.distanceMax = 0;

		this.memory = {
			position: new THREE.Vector3(),
			lookat: new THREE.Vector3(),
			offset: new THREE.Vector3(),
			spherical: new THREE.Spherical(),
		};
	}

	/**
	 * Get current lookat target.
	 */
	get target() {
		return this._offset.clone();
	}

	/**
	 * Set current lookat target.
	 */
	set target(val) {
		this._offset = val.clone();
		this._targetOffset = val.clone();
	}

	SetViewFromCurrentCamera() {
		this._targetSpherical.setFromCartesianCoords(
			this.camera.position.x,
			this.camera.position.y,
			this.camera.position.z
		);
		this._spherical.setFromCartesianCoords(
			this.camera.position.x,
			this.camera.position.y,
			this.camera.position.z
		);

		//get current camera lookat
		const lookat = new THREE.Vector3();
		this.camera.getWorldDirection(lookat);

		this._offset = new THREE.Vector3(0, 0, 0);
		this._targetOffset = new THREE.Vector3(0, 0, 0);
	}

	SetLookAt(lookat) {
		//this._lookat = lookat.clone();
		this._targetLookat = lookat.clone().add(this._offset);
	}

	setFromCamera(camera: THREE.Camera) {
		//	make current view is the same as the camera
		const worldcamera = new THREE.Vector3();
		camera.getWorldPosition(worldcamera);
		this._targetSpherical.setFromCartesianCoords(
			camera.position.x,
			camera.position.y,
			camera.position.z
		);
		this._targetOffset = worldcamera;
	}

	setMemory() {
		this.normalizeAngle();
		this.memory.offset.copy(this._offset);
		this.memory.spherical.copy(this._spherical);
		this.memory.position.copy(this.Position);
		this.memory.lookat.copy(this._lookat);

		console.log(this.memory);
		//return this.memory;

	}

	restoreMemory() {
		this.normalizeAngle();

		//this.enabled = false;
		// this.enabled = false
		// this._targetOffset.copy(this.memory.offset);
		// this._targetSpherical.copy(this.memory.spherical);
		// this.enabled = true;
		// // // this.positionLerpSpeed = 0;
		// // // this.directionLerpSpeed = 0;
		// // // const Tween = new TWEEN.Tween(this._offset)
		// // // 	.to(this.memory.offset, 1210)
		// // // 	.easing(TWEEN.Easing.Quadratic.InOut)
		// // // 	.start()
		// // // 	.onComplete(() => {
		// // // 		//this.enabled = false;
		// // // 		//	this._offset = this.memory.offset;
		// // // 		//	this._spherical = this.memory.spherical;
		// // // 		this._targetSpherical.copy(this.memory.spherical);
		// // // 		this.positionLerpSpeed = 10;
		// // // 		this.directionLerpSpeed = 10;
		// // // 	});

		// // // const Tween2 = new TWEEN.Tween(this._spherical)

		// // // 	.to(this.memory.spherical, 1200)
		// // // 	.easing(TWEEN.Easing.Quadratic.InOut)
		// // // 	.start()
		// // // 	.onComplete(() => {
		// // // 		//this._offset= new THREE.Vector3(0,0,0);
		// // // 		//this._targetOffset = new THREE.Vector3(0,0,0);
		// // // 		this.Position = this.memory.position;

		// // // 		this.SetViewFromCurrentCamera();
				
		// // // 	});

		// // // const tween3 = new TWEEN.Tween(this.Position)
		// // // 	.to(this.memory.position, 1200)
		// // // 	.easing(TWEEN.Easing.Quadratic.InOut)
		// // // 	.start()
		// // // 	.onComplete(() => {
		// // // 		//this.Position = this.memory.position;
		// // // 	});

		// .onStart(() => {
		// 		 this._targetOffset.copy(this.memory.offset);
		// 		 this._targetSpherical.copy(this.memory.spherical);}
		// )

		// this._targetOffset.copy(this.memory.offset);
		// this._targetSpherical.copy(this.memory.spherical);

		//	this._targetOffset.copy(this.memory.offset);
		//		this._targetSpherical.copy(this.memory.spherical);
		this._targetOffset.copy(this.memory.offset);
		this._targetSpherical.copy(this.memory.spherical);
		this._lookat.copy(this.memory.lookat);
		this.Position.copy(this.memory.position);
		//this._offset.copy(this.memory.offset);
		//this._spherical.copy(this.memory.spherical);
	}

	set Enabled(val: boolean) {
		this.enabled = val;
		this._offset = this._targetOffset;
		this._lookat = this._targetLookat;
	}
	get Enabled() {
		return this.enabled;
	}

	normalizeAngle() {
		this._targetSpherical.theta %= Math.PI * 2;
		this._spherical.theta %= Math.PI * 2;

		//this._targetSpherical.phi %= Math.PI / 2;
		//this._spherical.phi %= Math.PI / 2;
	}

	//dolly in and out
	dollyIn(dollyFactor) {
		this.moveTargetForward(dollyFactor);
		this._targetSpherical.radius = 1;
	}

	/**
	 * Rotate camera horizontally.
	 */
	rotateHorizontally(angle) {
		this._targetSpherical.theta += angle;
	}

	/**
	 * Rotate camera vertically.
	 */
	rotateVertically(angle) {
		this._targetSpherical.phi += angle;
	}

	/**
	 * Zoom in / out.
	 */
	zoom(factor) {
		this._targetSpherical.radius += factor;
		if (this._targetSpherical.radius < this.distanceMin) {
			this._targetSpherical.radius = this.distanceMin;
		}
		if (this.distanceMax && this._targetSpherical.radius > this.distanceMax) {
			this._targetSpherical.radius = this.distanceMax;
		}
	}

	/**
	 * Move target by a given vector.
	 */
	moveTargetBy(vector) {
		this._targetOffset.add(vector);
	}

	/**
	 * Get current world direction (from camera).
	 */
	get worldDirection() {
		const target = new THREE.Vector3();
		this.camera.getWorldDirection(target);
		return target;
	}

	/**
	 * Move target forward.
	 */
	moveTargetForward(distance) {
		const target = this.worldDirection;
		target.multiplyScalar(distance);
		this._targetOffset.add(target);
	}

	/**
	 * Move target backwards.
	 */
	moveTargetBackwards(distance) {
		this.moveTargetForward(-distance);
	}

	/**
	 * Get camera position.
	 */
	get Position() {
		return this.camera.position.clone();
	}

	/**
	 * Set camera position.
	 */
	set Position(val) {
		//this._targetSpherical.setFromCartesianCoords(val.x, val.y, val.z);
		this._targetSpherical.setFromVector3(val); // use setFromCartesianCoords(x,y,z)?
	}

	get Sphercial() {
		return this._targetSpherical.clone();
	}

	/**
	 * Move target, horizontally, based on camera's current rotation and up vector.
	 */
	moveOffsetHorizontally(delta) {
		// get left vector without y axis
		const vector = this.worldDirection;
		vector.y = 0;
		vector.normalize().multiplyScalar(delta);
		vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

		// add to target offset
		this._targetOffset.add(vector);
	}
	

	/**
	 * Move target, vertically, based on camera's current rotation and up vector.
	 */
	moveOffsetVertically(delta) {
		// get vector to move vertically, relative to camera's up vector and rotation
		const spherical = new THREE.Spherical();
		spherical.setFromVector3(this.worldDirection);
		spherical.phi += Math.PI / 2;
		const vector = new THREE.Vector3()
			.setFromSpherical(spherical)
			.normalize()
			.multiplyScalar(delta);

		// add to target offset
		this._targetOffset.add(vector);
	}

	/**
	 * Update controller.
	 */
	update(input) {
		// if disabled, do nothing
		if (this.enabled) {
			// process input
			if (input && this.processInput) {
				// get delta time
				const dt = input.deltaTime;

				// rotate horizontally
				const rh = input.rotateHorizontally || 0;
				if (rh !== 0) {
					this.rotateHorizontally(rh * dt);
				}

				// rotate vertically
				const rv = input.rotateVertically || 0;
				if (rv !== 0) {
					this.rotateVertically(rv * dt);
				}

				// zoom in / out
				const zoom = input.zoom || 0;
				if (zoom !== 0) {
					this.zoom(zoom * dt);
				}

				// move target
				let mt = input.moveTarget;
				if (mt) {
					mt = mt.clone().multiplyScalar(dt);
					this.moveTargetBy(mt);
				}

				// move target horizontally
				const mh = input.moveOffsetHorizontally;
				if (mh) {
					this.moveOffsetHorizontally(mh * dt);
				}

				// move target vertically
				const mv = input.moveOffsetVertically;
				if (mv) {
					this.moveOffsetVertically(mv * dt);
				}
			}

			// update spherical rotation
			if (this.directionLerpSpeed) {
				//prevent lerping when target is at the same position as the camera

				this._spherical.theta = THREE.MathUtils.lerp(
					this._spherical.theta,
					this._targetSpherical.theta,
					input.deltaTime * this.directionLerpSpeed
				);
				this._spherical.phi = THREE.MathUtils.lerp(
					this._spherical.phi,
					this._targetSpherical.phi,
					input.deltaTime * this.directionLerpSpeed
				);
			} else {
				this._spherical.theta = this._targetSpherical.theta;
				this._spherical.phi = this._targetSpherical.phi;
			}

			// update position
			if (this.positionLerpSpeed) {
				this._spherical.radius = THREE.MathUtils.lerp(
					this._spherical.radius,
					this._targetSpherical.radius,
					input.deltaTime * this.positionLerpSpeed
				);
				this._lookat.lerp(
					this._targetLookat,
					input.deltaTime * this.positionLerpSpeed
				);
				this._offset.lerp(
					this._targetOffset,
					input.deltaTime * this.positionLerpSpeed
				);
			} else {
				this._spherical.radius = this._targetSpherical.radius;
				this._lookat = this._targetLookat.clone();
				this._offset = this._targetOffset.clone();
			}

			// set camera position
			this._spherical.makeSafe();
			this._targetSpherical.makeSafe();
			this.camera.position.setFromSpherical(this._spherical).add(this._offset);

			// set camera target
			this.camera.lookAt(this._lookat.clone().add(this._offset));
		}
	}

	/**
	 * Dispose the controller.
	 */
	dispose() {
		this.camera = null;
		this._lookat = null;
		this._offset = null;
		this._targetLookat = null;
		this._targetOffset = null;
		this._spherical = null;
		this._targetSpherical = null;
		this.directionLerpSpeed = null;
		this.positionLerpSpeed = null;
	}
}

export { SimpleOrbitControls };
