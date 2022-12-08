import * as THREE from "three";
import { createMachine, interpret, StateMachine } from "xstate";
import { tween, Tween, TWEEN } from "three/examples/jsm/libs/tween.module.min";
import { Component } from "./entity";
import * as CANNON from "cannon-es";
import { PhysicsManager } from "./PhysicsManager";

const GROUP1 = 1;
const GROUP2 = 2;
const GROUP3 = 4;

class PhysicalCharacterController extends Component {
	decceleration_: THREE.Vector3;
	params_: any;
	acceleration_: THREE.Vector3;
	velocity_: THREE.Vector3;
	group_: THREE.Group;
	animations_: THREE.AnimationAction[] = [];
	stateMachine_: any;
	target_: any;
	bones_: THREE.Bone[] = [];
	_mixer: THREE.AnimationMixer;
	AnimationFSM_: any;
	AnimationFSMService_: any;
	isColliding_ = false;
	tweens_: Tween[] = [];
	world: CANNON.World;
	canJump = true;
	leftFootMesh: any;
	leftFootBody: CANNON.Body;
	rightFootBody: CANNON.Body;
	rightFootMesh: any;
	leftHandMesh: any;
	rightHandMesh: any;
	rightHandBody: CANNON.Body;
	leftHandBody: CANNON.Body;

	body: CANNON.Body;

	// previousState_: string = 'Idelingg'
	// currentState_: string = 'Idelingg'

	constructor(params: any) {
		super();
		this.params_ = params;
		this.world = params.world;
	}
	SetState(state: string) {
		if (
			state === "StoppingRunnning" &&
			this.AnimationFSMService_.state.value != "StoppingRunnning"
		) {
			this.AnimationFSMService_.send("STOP");
			return;
		}
		if (state === "SlowWalking") {
			this.AnimationFSMService_.send("SLOWWALK");
			return;
		}

		if (state == "Ideling") {
			this.AnimationFSMService_.send("STOP");
			return;
		}

		if (
			state == "Walking" &&
			this.AnimationFSMService_.state.value != "Walking"
		) {
			this.AnimationFSMService_.send("STOP");
			this.AnimationFSMService_.send("WALK");
			return;
		}

		if (
			state == "Running" &&
			this.AnimationFSMService_.state.value != "Running"
		) {
			this.AnimationFSMService_.send("WALK");
			this.AnimationFSMService_.send("RUN");
			return;
		}

		if (state === "BackwardWalking") {
			this.AnimationFSMService_.send("BACKWARDWALK");
			return;
		}

		if (state === "TurningLeft") {
			this.AnimationFSMService_.send("TURNLEFT");
			return;
		}

		if (state === "TurningRight") {
			this.AnimationFSMService_.send("TURNRIGHT");
			return;
		}

		// //this.AnimationFSMService_.stop();
		// 	if (this.AnimationFSMService_.state.value != state) {
		// 		this.AnimationFSMService_.stop();
		// 		this.AnimationFSMService_.start(state);
		// 	}
	}
	GoToPoint(walkToPoint: THREE.Vector3) {

		// make it sp tje character is facing the point and applying a force in the direction of the point
		const controlObject = new THREE.Object3D();
		controlObject.position.copy(this.group_.position);
		controlObject.quaternion.copy(this.group_.quaternion);
		controlObject.lookAt(walkToPoint);

		const distance = controlObject.position.distanceTo(walkToPoint);
		//clear current tweens
		this.tweens_.forEach((t) => {
			t.stop();
		});
		this.tweens_ = [];
		const tweenToPosition = new TWEEN.Tween(controlObject.position)
			.to(walkToPoint, (1000 / 2) * distance)
			//.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(() => {
				if (this.isColliding_) {
					this.AnimationFSMService_.send("STOP");
					tweenToPosition.stop();
				}
				this.Parent.SetPosition(controlObject.position);
			})
			.onStart(() => {
				this.AnimationFSMService_.send("WALK");
			})
			.start()
			.onComplete(() => {
				this.AnimationFSMService_.send("STOP");
				this.tweens_ = [];
			})
			.onStop(() => {
				this.AnimationFSMService_.send("STOP");
				this.tweens_ = [];
			});
		this.Parent.SetQuaternion(controlObject.quaternion);
		this.tweens_.push(tweenToPosition);
	}

	InitEntity() {
		this.Init_();
	}

	Destroy() {
		this.tweens_.forEach((t) => {
			t.stop();
		});
		this.params_.scene.remove(this.group_);
		this.world.removeBody(this.body);
	}

	Init_() {
		this.decceleration_ = new THREE.Vector3(-0.005, -0.001, -7.0);
		this.acceleration_ = new THREE.Vector3(1, 0.125, 5.0);
		this.velocity_ = new THREE.Vector3(0, 0, 0);
		this.group_ = new THREE.Group();
		//add is entity to group
		this.group_.userData.EntityGroup = this.Parent;
		this.params_.scene.add(this.group_);
		//this.animations_ = {};

		this.LoadModels_();
		this.AddPhysicsBody();
		this.CreateFSM_();
	}

	//
	AddPhysicsBody() {
		//const colliderShape = new CANNON.Sphere(0.35);

		const colliderShape = new CANNON.Box(new CANNON.Vec3(0.0025, 0.9, 0.0015));
		this.body = new CANNON.Body({
			mass: 9000,
			//collisionFilterGroup: GROUP1, // Put the sphere in group 1
			//collisionFilterMask: GROUP2 | GROUP3, // It can only collide with group 2 and 3
		});
		this.body.addShape(colliderShape, new CANNON.Vec3(0, 0.9, 0));
		this.body.allowSleep = false;
		//this.body.addShape(colliderShape, new CANNON.Vec3(0, 0.95, 0));

		//this.body.addShape(colliderShape, new CANNON.Vec3(0, 1.6, 0));

		//this.body.position.set(0, 10, 0);
		this.body.linearDamping = 0.1;
		this.body.angularFactor.set(0, 1, 0); // prevents rotation X,Z axis
		//this.body.fixedRotation = true;
		//this.body.

		//const left foot body
		const leftFootColliderShape = new CANNON.Box(
			new CANNON.Vec3(0.075, 0.125, 0.065)
		);
		//attach left foot to body
		this.leftFootBody = new CANNON.Body({
			mass: 1,

			//	collisionFilterGroup: GROUP1, // Put the sphere in group 1
			//	collisionFilterMask: GROUP2 | GROUP3, // It can only collide with group 2 and 3
		});

		const rightFootColliderShape = new CANNON.Box(
			new CANNON.Vec3(0.075, 0.125, 0.065)
		);
		//attach right foot to body
		this.rightFootBody = new CANNON.Body({
			mass: 1,

			//	collisionFilterGroup: GROUP1, // Put the sphere in group 1
			//	collisionFilterMask: GROUP2 | GROUP3, // It can only collide with group 2 and 3
		});

		this.leftFootBody.addShape(
			leftFootColliderShape,
			new CANNON.Vec3(0, -0.15, 0)
		);
		this.rightFootBody.addShape(
			rightFootColliderShape,
			new CANNON.Vec3(0, -0.15, 0)
		);
		this.rightFootBody.fixedRotation = true;
		this.rightFootBody.allowSleep = false;
		this.leftFootBody.fixedRotation = true;
		this.leftFootBody.allowSleep = false;
		//	this.leftFootBody.position.set(0,1, 2);

		this.leftHandBody = new CANNON.Body({
			mass: 900,

			//	collisionFilterGroup: GROUP1, // Put the sphere in group 1
			//	collisionFilterMask: GROUP2 | GROUP3, // It can only collide with group 2 and 3
		});
		this.leftHandBody.allowSleep = false;
		this.rightHandBody = new CANNON.Body({
			mass: 900,

			//	collisionFilterGroup: GROUP1, // Put the sphere in group 1
			//		collisionFilterMask: GROUP2 | GROUP3, // It can only collide with group 2 and 3
		});
		this.rightHandBody.allowSleep = false;

		const leftHandColliderShape = new CANNON.Box(
			new CANNON.Vec3(0.05, 0.09, 0.01)
		);
		const rightHandColliderShape = new CANNON.Box(
			new CANNON.Vec3(0.05, 0.09, 0.01)
		);

		this.leftHandBody.addShape(
			leftHandColliderShape,
			new CANNON.Vec3(0, 0, 0.0)
		);
		this.rightHandBody.addShape(
			rightHandColliderShape,
			new CANNON.Vec3(0, 0, 0)
		);

		this.leftHandBody.fixedRotation = true;
		this.rightHandBody.fixedRotation = true;

		this.world.addBody(this.body);
		this.world.addBody(this.leftFootBody);

		this.world.addBody(this.rightFootBody);
		this.world.addBody(this.leftHandBody);
		this.world.addBody(this.rightHandBody);
	}

	CreateFSM_() {
		this.AnimationFSM_ =
			/** @xstate-layout N4IgpgJg5mDOIC5QGMAWBDATu5AXMmAdAJIRgA2AlgHZQDEA6gIIAyA0oqAA4D2sluSj2qcQAD0QBGACwAmQgE4A7ADZJsyQFYlCzZoDMC-QBoQAT0QBabdMJaFklcpU6Z0gL7vTaLDnxFSChp6AGUWAHkGZnZRXn5BYVEJBE1pBUIABgAOWSysjOlpLJVpA1MLBEtpSXSVFSzNWX0MpX1W2Q8vEB9sPAISMipaOgAhJgBhNmYAJQARaI4kEDiBIREl5Mtm-UJDVtaFQqLDTXKrJvSlJVkFWSvqjTlPbwxe-wGg4YAVAFVpgDlpsQAOIACS+sT4q0SGys0hUdhUuTu0n0bVUp3MVn0DUIWQUugUSNkBSaKme3Vefn6gSG9F+AJYAFEAGIQpYrBLrUCbJQZBFGe4qbZ1OpnSqSdSEQoZO58yX6JH8ik9akBQbBOgABR+IVBkPiaySVmK8nxhU0GQc2UasnFlkkzWlWn0JPUBja0iUKqpfXVn3oACkfgBZLUG6Hc8RWEqaaX1XKGRWyPRKe1pDKEHSyFMZSWSFpaTQ+3x+whagCusFQmpCX3C4Y5UK5xsq+mqhFz+kkrRK5sk4tRCLqRL58JTqOLXVVZcr1c1CwjLdhEpkWTxLQ6d3xCgy-Ptip2NytXtdWVUaJLb36XwrmGowWmlCgqFwdDrDaXRpXW1kCK0wpOHu-KHuKKj8oQ4GaMUloZO2kpTi8pbvLe97BCwYAAGZvh+jbcM2348tiTp6ComhqH+jpKA0YHwpBPapEomhUeeiGUsh-QMOg5AANa1vWeHLARMJEZUKYIiKhQaNBGSNCo9p3LsCgNLcDjdi0eZXmqhBcbxmrTD8-xfiJ0aVNouw4voBgFF6jhZOKBbyJaLhoi4zkNGxM7vCMOA8QA7lgEC6Xxwy4cZUabCmOy6EUBj5LkOQ4uK7brkSBIEi4Vo9qUWlltMFbUA+wyLk2homckShaHYPbnspkpZIqA5YggVm2A0Vz8kWNqdEh15EPlhX8Z+pWRq21iGJkqgOOBjo4uo4odFm1GNEo1QFlZBT6Ll7whOQPB+cFQ2CZyhGmZYGiSFmZEyOo1Hwg1drNc0l25DUlqtcx6jbf0u37YdxWsIs+FlRF2KKS00g2spnUuPJzUlMODFesxbSsd9RAhLgPBcFwj4FUV9AGf8-zEP8wK4VqTKzOFY0TtKOL8mpaSOsKyVEpB2jKTojSOKtnm+u8gYVgAtrjtAspgPDC5jlDkOQdAsEw-zUyNy6iZYOg7Huip6ESbQyAo9oGLYPZNNRsqGAWU5dNQPBkPASxeTSGq0DTP6VZmzQFCUsn5Km6alFmu7thoBRwUx6PllWNau6rp2bLdl1eocuj1IUhjSOKyh4jUbRonIsodOS04Czed4E0+L64G76tqZk6mAatIeG81fNZu2cEQzm3ZZJHqEExh2E12d6g9niOhp0YBStCY8NwbsVyHO9Kb4rIkf-VAw-JGi65WmoxSNXk1yYhUCM5x6QEFgS3olxxRA+cg-mBRvW9WHol0xaPc17q0yVpJ2WQ3pwVSJ9GQkcBoE1fggHs0V4Q4m0PVV6LcKiOnSG4ZifIyJGCcL3W+fVCC-QOtxEKm847lUQHIJyRQ1A805gSTOzVLCAMyA8ewVo9ClFwb1bSmNsZiygBA4IUCrIImojmO46IOppienmABNRKpXHPNkHskchai2CBLKWMs5ZQMsPUBElEHClB0Exc89oSg7FSDmSqaIeyKPRro9QuhpQ6DSORLI6dDj2kqnGRoVlUwdA0pITwnggA */
			createMachine(
				{
					context: {
						initialDelayer: {},
					},
					id: "character",
					initial: "Ideling",
					states: {
						Ideling: {
							entry: "StartIdeling",
							on: {
								WALK: {
									cond: "canWalk",
									target: "Walking",
								},
								SLOWWALK: {
									cond: "canWalk",
									target: "SlowWalking",
								},
								BACKWARDWALK: {
									target: "BackwardWalking",
								},
								TURNRIGHT: {
									target: "TurningRight",
								},
								TURNLEFT: {
									target: "TurningLeft",
								},
								PUSH: {
									target: "Pushing",
								},
								JUMP: {
									target: "JumpingFromStill",
								},
							},
						},
						Pushing: {
							entry: "StartPushing",
							on: {
								STOP: {
									target: "Ideling",
								},
								WALK: {
									cond: "canWalk",
									target: "Walking",
								},
							},
						},
						TurningRight: {
							entry: "StartTurningRight",
							on: {
								STOP: {
									target: "Ideling",
								},
							},
						},
						TurningLeft: {
							entry: "StartTurningLeft",
							on: {
								STOP: {
									target: "Ideling",
								},
							},
						},
						Walking: {
							entry: "StartWalking",
							on: {
								STOP: {
									target: "Ideling",
								},
								RUN: {
									target: "Running",
								},
							},
						},
						BackwardWalking: {
							entry: "StartBackwardWalking",
							on: {
								STOP: {
									target: "Ideling",
								},
							},
						},
						Running: {
							entry: "StartRunning",
							on: {
								WALK: {
									cond: "canWalk",
									target: "Walking",
								},
								STOP: {
									target: "StoppingRunning",
								},
							},
						},
						SlowWalking: {
							entry: "StartSlowWalking",
							on: {
								STOP: {
									target: "Ideling",
								},
								WALK: {
									cond: "canWalk",
									target: "Walking",
								},
							},
						},
						StoppingRunning: {
							entry: "StartStoppingRunning",
							on: {
								RUNNINGSTOPPED: {
									target: "Ideling",
								},
							},
						},
						JumpingFromStill: {
							entry: "StartJumping",
							on: {
								LAND: {
									target: "Ideling",
								},
							},
						},
					},
				},
				{
					actions: {
						StartWalking: (context, event) => {
							// console.log("StartedWalking");
							// console.log(this.AnimationFSMService_.state.value);
							// console.log(
							// 	"History: " + this.AnimationFSMService_._state.history.value
							// );

							const curAction =
								this.animations_[this.AnimationFSMService_.state.value];

							const prevAction =
								this.animations_[
									this.AnimationFSMService_._state.history.value
								];

							curAction.time = 0.0;
							curAction.enabled = true;
							curAction.setEffectiveTimeScale(1.0);
							curAction.setEffectiveWeight(1.0);
							curAction.crossFadeFrom(prevAction, 0.25, true);
							curAction.play();
						},
						StartJumping: (context, event) => {
							const curAction =
								this.animations_[this.AnimationFSMService_.state.value];

							const prevAction =
								this.animations_[
									this.AnimationFSMService_._state.history.value
								];

							curAction.time = 0.0;
							curAction.enabled = true;
							curAction.setEffectiveTimeScale(1.0);
							curAction.setEffectiveWeight(1.0);
							curAction.crossFadeFrom(prevAction, 0.25, true);
							curAction.play();

							setTimeout(() => {
								this.AnimationFSMService_.send("LAND");
							}, (curAction.getClip().duration * 1000) / 1);
						},
						StartPushing: (context, event) => {
							const curAction =
								this.animations_[this.AnimationFSMService_.state.value];

							const prevAction =
								this.animations_[
									this.AnimationFSMService_._state.history.value
								];

							curAction.time = 0.0;
							curAction.enabled = true;
							curAction.setEffectiveTimeScale(1.0);
							curAction.setEffectiveWeight(1.0);
							curAction.crossFadeFrom(prevAction, 0.15, true);
							curAction.play();
						},
						StartSlowWalking: (context, event) => {
							const curAction =
								this.animations_[this.AnimationFSMService_.state.value];
							const prevAction =
								this.animations_[
									this.AnimationFSMService_._state.history.value
								];

							curAction.time = 0.0;
							curAction.enabled = true;
							curAction.setEffectiveTimeScale(1.0);
							curAction.setEffectiveWeight(1.0);
							curAction.crossFadeFrom(prevAction, 0.25, true);
							curAction.play();

							//    console.log(this.AnimationFSMService_.history.value.toString())
						},
						StartBackwardWalking: (context, event) => {
							const curAction =
								this.animations_[this.AnimationFSMService_.state.value];
							const prevAction =
								this.animations_[
									this.AnimationFSMService_._state.history.value
								];

							curAction.time = 0.0;
							curAction.enabled = true;
							curAction.setEffectiveTimeScale(1.0);
							curAction.setEffectiveWeight(1.0);
							curAction.crossFadeFrom(prevAction, 0.25, true);
							curAction.play();

							//    console.log(this.AnimationFSMService_.history.value.toString())
						},
						StartRunning: (context, event) => {
							const previousState =
								this.AnimationFSMService_._state.history.value;
							const curAction =
								this.animations_[this.AnimationFSMService_.state.value];
							const prevAction =
								this.animations_[
									this.AnimationFSMService_._state.history.value
								];

							curAction.enabled = true;

							if (previousState == "Walking") {
								const ratio =
									curAction.getClip().duration / prevAction.getClip().duration;
								curAction.time = prevAction.time * ratio;
							} else {
								curAction.time = 0.0;
								curAction.setEffectiveTimeScale(-1.6);
								curAction.setEffectiveWeight(1.0);
							}

							curAction.crossFadeFrom(prevAction, 0.1, true);
							curAction.play();
						},
						StartStoppingRunning: (context, event) => {
							const curAction =
								this.animations_[this.AnimationFSMService_.state.value];
							const prevAction =
								this.animations_[
									this.AnimationFSMService_._state.history.value
								];

							curAction.enabled = true;
							curAction.setEffectiveWeight(1.0);
							curAction.setEffectiveTimeScale(1);

							curAction.reset();
							curAction.setLoop(THREE.LoopOnce, 1);
							curAction.clampWhenFinished = true;
							curAction.crossFadeFrom(prevAction, 0.3, true);
							curAction.play();

							setTimeout(() => {
								this.AnimationFSMService_.send("RUNNINGSTOPPED");
							}, (curAction.getClip().duration * 1000) / 1);
						},
						StartIdeling: (context, event) => {
							if (this.AnimationFSMService_ !== undefined) {
								const curAction =
									this.animations_[this.AnimationFSMService_.state.value];
								const prevAction =
									this.animations_[
										this.AnimationFSMService_._state.history.value
									];

								curAction.time = 0.0;
								curAction.enabled = true;
								curAction.setEffectiveTimeScale(1.0);
								curAction.setEffectiveWeight(1.0);
								curAction.crossFadeFrom(prevAction, 0.25, false);
								curAction.play();
							} else {
								console.log("FSM Service not defined , probably initial Idle");
							}
						},
						StartTurningRight: (context, event) => {
							const curAction =
								this.animations_[this.AnimationFSMService_.state.value];
							const prevAction =
								this.animations_[
									this.AnimationFSMService_._state.history.value
								];

							curAction.time = 0.0;
							curAction.enabled = true;
							curAction.setEffectiveTimeScale(1.0);
							curAction.setEffectiveWeight(1.0);
							curAction.crossFadeFrom(prevAction, 0.65, true);
							curAction.play();
						},
						StartTurningLeft: (context, event) => {
							const curAction =
								this.animations_[this.AnimationFSMService_.state.value];
							const prevAction =
								this.animations_[
									this.AnimationFSMService_._state.history.value
								];

							curAction.time = 0.0;
							curAction.enabled = true;
							curAction.setEffectiveTimeScale(1.0);
							curAction.setEffectiveWeight(1.0);
							curAction.crossFadeFrom(prevAction, 0.65, true);
							curAction.play();
						},
					},
					guards: {
						IsWalking: (context, event) => {
							return true;
						},

						canWalk: (context, event) => {
							return !this.isColliding_;
						},
					},
					delays: {
						BOREDOM_DELAY: (context, event) => {
							return 1000;
						},
					},
				}
			);

		this.AnimationFSMService_ = interpret(this.AnimationFSM_)
			.start()
			.onTransition((state) => {
				// if (state.history !== undefined) {
				// }

				if (state?.changed) {
					if (this.AnimationFSM_.context.initialDelayer !== undefined) {
						//clearTimeout(this.AnimationFSM_.context.initialDelayer);
					}
				}
			});
	}
	GetState() {
		return this.AnimationFSMService_.state.value;
	}
	UpdateFSM(input: any) {
		if (
			input._keys.space 
		) {
			this.AnimationFSMService_.send("JUMP");

		}
		if (input._keys.forward && this.isColliding_) {
			this.AnimationFSMService_.send("PUSH");
		}
		if (input._keys.left) {
			this.AnimationFSMService_.send("TURNLEFT");
		}
		if (input._keys.right) {
			this.AnimationFSMService_.send("TURNRIGHT");
		}
		if (
			!input._keys.left &&
			!input._keys.right &&
			(this.AnimationFSMService_.state.value == "TurningLeft" //||
				//this.AnimationFSMService_.state.value == "TurningRight"
			)
		) {
			this.AnimationFSMService_.send("STOP");
		}

		if (
			input._keys.forward &&
			input._keys.shift &&
			this.AnimationFSMService_.state.value == "Walking"
		) {
			this.AnimationFSMService_.send("RUN");
		}
		if (
			input._keys.forward &&
			input._keys.shift &&
			this.AnimationFSMService_.state.value == "Ideling"
		) {
			this.AnimationFSMService_.send("SLOWWALK");
		}
		if (
			input._keys.forward &&
			(this.AnimationFSMService_.state.value == "Ideling" ||
				this.AnimationFSMService_.state.value == "SlowWalking" ||
				this.AnimationFSMService_.state.value == "Pushing") &&
			!input._keys.shift
		) {
			this.AnimationFSMService_.send("WALK");
		}
		if (
			input._keys.forward &&
			this.AnimationFSMService_.state.value == "Pushing" &&
			input._keys.shift
		) {
			this.AnimationFSMService_.send("WALK");
		}

		if (
			input._keys.forward &&
			this.AnimationFSMService_.state.value == "Running" &&
			!input._keys.shift
		) {
			this.AnimationFSMService_.send("WALK");
		}
		if (
			!input._keys.forward &&
			(this.AnimationFSMService_.state.value == "Walking" ||
				this.AnimationFSMService_.state.value == "Running" ||
				this.AnimationFSMService_.state.value == "SlowWalking" ||
				this.AnimationFSMService_.state.value == "Pushing")
		) {
			this.AnimationFSMService_.send("STOP");
		}
		if (input._keys.backward) {
			this.AnimationFSMService_.send("BACKWARDWALK");
		}
		if (
			!input._keys.backward &&
			this.AnimationFSMService_.state.value == "BackwardWalking"
		) {
			this.AnimationFSMService_.send("STOP");
		}
	}

	InitComponent() {
		this._RegisterHandler("health.death", (m: any) => {
			this.OnDeath_(m);
		});
		this._RegisterHandler("update.position", (m: { value: THREE.Vector3 }) => {
			this.OnUpdatePosition_(m);
		});
		this._RegisterHandler("update.rotation", (m: any) => {
			this.OnUpdateRotation_(m);
		});
	}

	OnUpdatePosition_(msg: { value: THREE.Vector3 }) {
		this.group_.position.copy(msg.value);
	}

	OnUpdateRotation_(msg: { value: THREE.Quaternion }) {
		this.group_.quaternion.copy(msg.value);
	}

	OnDeath_(msg: any) {
		this.stateMachine_.SetState("death");
	}

	LoadModels_() {
		//   const classType = this.params_.desc.character.class;
		//   const model= this.params_.threedObject

		this.target_ = this.params_.model;

		//this.animations_= this.params_.loadedAnimations
		// this.target_.scale.setScalar(modelData.scale);
		this.target_.visible = false;

		this.group_.add(this.target_);

		//this.bones_ = {};
		this.target_.traverse((c: { skeleton: { bones: any } }) => {
			if (!c.skeleton) {
				return;
			}
			for (const b of c.skeleton.bones) {
				this.bones_[b.name] = b;
			}
		});
	//	console.log(this.bones_);
		this.AddColliders();

		this.target_.traverse(
			(c: {
				castShadow: boolean;
				receiveShadow: boolean;
				material: { map: { encoding: THREE.TextureEncoding } };
			}) => {
				c.castShadow = true;
				c.receiveShadow = true;
				if (c.material && c.material.map) {
					c.material.map.encoding = THREE.sRGBEncoding;
				}
			}
		);
		this.parent_._mesh = this.target_;
		this._mixer = new THREE.AnimationMixer(this.target_);
		for (const anim in this.params_.animations) {
			this.animations_[anim] = this._mixer.clipAction(
				this.params_.animations[anim]
			);
		}

		this.target_.visible = true;

		this.Broadcast({
			topic: "load.character",
			model: this.target_,
			bones: this.bones_,
		});
	}

	AddColliders() {
		//create a cylinder mesh
		const geometry = new THREE.CylinderGeometry(39, 39, 70, 32);
		const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const spineCollider = new THREE.Mesh(geometry, material);
		spineCollider.visible = false;
		spineCollider.userData.parent = this.parent_;
		spineCollider.userData.name = "torso";
		spineCollider.position.add(new THREE.Vector3(0, 0, 10));
		this.bones_["mixamorigSpine"].add(spineCollider);
		this.leftFootMesh = this.bones_["mixamorigLeftToe_End"];
		this.rightFootMesh = this.bones_["mixamorigRightToe_End"];

		this.leftHandMesh = this.bones_["mixamorigLeftHandMiddle3"];
		this.rightHandMesh = this.bones_["mixamorigRightHandMiddle3"];

		// const headCollider = new THREE.Mesh(
		// 	new THREE.SphereGeometry(8, 32, 32),
		// 	new THREE.MeshBasicMaterial({ color: 0xffff00 })
		// );
		// this.bones_["mixamorigLeftHand"].add(headCollider);
	}

	_FindIntersections(
		pos: THREE.Vector3,
		oldPos: THREE.Vector3,
		dir: THREE.Vector3
	) {
		// const _IsAlive = (c) => {
		//     const h = c.entity.GetComponent('HealthComponent')
		//     if (!h) {
		//         return true
		//     }
		//     return h.Health > 0
		// }
		const _isCollidable = (c: any) => {
			const co = this.GetComponent("ColliderComponent");
			if (co) {
				return true;
			}
		};

		const grid = this.GetComponent("SpatialGridController");
		const nearby = grid
			.FindNearbyEntities(2)
			.filter((e: any) => _isCollidable(e))
			.map((a: { entity: { _mesh: any } }) => a.entity._mesh);

		const midpos = pos.clone().add(new THREE.Vector3(0, 1.1, 0));

		const ray = new THREE.Raycaster(midpos, dir);
		const collisions = [];
		const intersects = ray.intersectObjects(nearby, true);
		if (intersects.length > 0) {
			if (intersects[0].distance < 0.85)
				collisions.push(intersects[0].object.userData.parent);
			//	console.log(intersects[0]);

			//if the object is already colliding , push back the group in the opposite direction of the ray

			if (intersects[0].distance < 0.6) {
				if (this.AnimationFSMService_.state.value == "Pushing") {
					this.group_.position.add(dir.multiplyScalar(-1).multiplyScalar(0.01));
					
				}
				//console.log(intersects[0].distance);
			}

				//console.log(intersects[0].distance);
			


		}

		return collisions;
	}

	getAcceleration(state: string) {
		switch (state) {
			case "Ideling":
				return 0;
			case "Walking":
				return 2;
			case "Running":
				return 5;
			case "BackwardWalking":
				return 0.7;
			case "SlowWalking":
				return 0.5;

			case "Pushing":
				return 0.5;
			default:
				return 0;
		}
	}

	Update(timeInSeconds: number) {
		// make the left foot body follow the left foot bone
		//console.log(this.leftFootMesh.position);
		/* #region  Fix Limbs Colliders to according meshes */

		this.leftFootBody.position.copy(
			this.leftFootMesh.getWorldPosition(new THREE.Vector3())
		);
		this.leftFootBody.quaternion.copy(
			this.leftFootMesh.getWorldQuaternion(new THREE.Quaternion())
		);
		this.leftFootBody.velocity.set(0, 0, 0);
		this.leftFootBody.angularVelocity.set(0, 0, 0);

		this.rightFootBody.position.copy(
			this.rightFootMesh.getWorldPosition(new THREE.Vector3())
		);
		this.rightFootBody.quaternion.copy(
			this.rightFootMesh.getWorldQuaternion(new THREE.Quaternion())
		);

		this.rightFootBody.velocity.set(0, 0, 0);
		this.rightFootBody.angularVelocity.set(0, 0, 0);

		this.leftHandBody.position.copy(
			this.leftHandMesh.getWorldPosition(new THREE.Vector3())
		);
		this.leftHandBody.quaternion.copy(
			this.leftHandMesh.getWorldQuaternion(new THREE.Quaternion())
		);
		this.leftHandBody.velocity.set(0, 0, 0);
		this.leftHandBody.angularVelocity.set(0, 0, 0);

		this.rightHandBody.position.copy(
			this.rightHandMesh.getWorldPosition(new THREE.Vector3())
		);
		this.rightHandBody.quaternion.copy(
			this.rightHandMesh.getWorldQuaternion(new THREE.Quaternion())
		);
		this.rightHandBody.velocity.set(0, 0, 0);
		this.rightHandBody.angularVelocity.set(0, 0, 0);
		/* #endregion */
		this.body.quaternion.set(
			this.group_.quaternion.x,
			this.group_.quaternion.y,
			this.group_.quaternion.z,
			this.group_.quaternion.w
		);

		if (timeInSeconds > 1) {
			return;
		}
		if (this._mixer) {
			this._mixer.update(timeInSeconds);
		}

		this.input = this.GetComponent("CharacterInput");
		if (this.input == undefined) {
			this.Parent.SetPosition(this.body.position);
			this.Parent.SetQuaternion(this.body.quaternion);
			return;
		}

		if (this.tweens_.length == 0) {
			this.UpdateFSM(this.input);
		}
		// this.stateMachine_.Update(timeInSeconds, input)

		// HARDCODED
		this.Broadcast({
			topic: "player.action",
			action: "Hola!",
			//action: this.AnimationFSMService_.state.value,
			//  action: this.stateMachine_._currentState.Name,
		});

		const velocity = this.velocity_;
		const frameDecceleration = new THREE.Vector3(
			velocity.x * this.decceleration_.x,
			velocity.y * this.decceleration_.y,
			velocity.z * this.decceleration_.z
		);
		frameDecceleration.multiplyScalar(timeInSeconds);
		frameDecceleration.z =
			Math.sign(frameDecceleration.z) *
			Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

		velocity.add(frameDecceleration);

		const controlObject = this.group_;
		const _Q = new THREE.Quaternion();
		const _A = new THREE.Vector3();
		const _R = controlObject.quaternion.clone();

		const acc = this.acceleration_.clone();

		acc.multiplyScalar(
			this.getAcceleration(this.AnimationFSMService_.state.value)
		);

		if (this.input._keys.forward) {
			velocity.z += acc.z * timeInSeconds;
		}

		if (this.input._keys.backward) {
			velocity.z -= acc.z * timeInSeconds;
		}
		if (this.input._keys.left) {
			_A.set(0, 1, 0);
			_Q.setFromAxisAngle(
				_A,
				4.0 * Math.PI * timeInSeconds * this.acceleration_.y
			);
			_R.multiply(_Q);

			this.body.quaternion.set(_R.x, _R.y, _R.z, _R.w);
		}
		if (this.input._keys.right) {
			_A.set(0, 1, 0);
			_Q.setFromAxisAngle(
				_A,
				4.0 * -Math.PI * timeInSeconds * this.acceleration_.y
			);
			_R.multiply(_Q);

			this.body.quaternion.set(_R.x, _R.y, _R.z, _R.w);

			//this.body_.rotation.y -= 0.1;
		}

		controlObject.quaternion.copy(_R);

		const oldPosition = new THREE.Vector3();
		oldPosition.copy(controlObject.position);

		const forward = new THREE.Vector3(0, 0, 1);
		forward.applyQuaternion(controlObject.quaternion);
		forward.normalize();

		const forwardDir = forward.clone().multiplyScalar(Math.sign(velocity.z));

		const sideways = new THREE.Vector3(1, 0, 0);
		sideways.applyQuaternion(controlObject.quaternion);
		sideways.normalize();

		sideways.multiplyScalar(velocity.x * timeInSeconds);
		forward.multiplyScalar(velocity.z * timeInSeconds);

		// if (this.input._keys.forward) {
		// 	this.body.velocity.x = (forwardDir.x * acc.z) / 2;
		// 	this.body.velocity.z = (forwardDir.z * acc.z) / 2;

		// 	//this.body.applyImpulse(new CANNON.Vec3(0, 1, 0), new CANNON.Vec3(0, 0, 0));
		// }
		const contactNormal = new CANNON.Vec3();
		const upAxis = new CANNON.Vec3(0, 1, 0);

		this.body.addEventListener("collide", (e) => {
			//console.log(e.target);

			const contact = e.contact;
			//	console.log(contactNormal.dot(upAxis));

			if (contact.bi.id == this.body.id) {
				contact.ni.negate(contactNormal);
				// Do something
			} else {
				contactNormal.copy(contact.ni);
				// Do something else
			}
			if (contactNormal.dot(upAxis) < 1.45) {
				if (!this.canJump) {
					console.log("can jump");
				}
				// The contact normal is pointing towards the player
				// Do something

				this.canJump = true;
			}
		});

		if (this.input._keys.space && this.canJump) {
			this.canJump = false;
			this.body.velocity.y = 5;
		}

		const pos = controlObject.position.clone();
		pos.add(forward);
		pos.add(sideways);

		const collisions = this._FindIntersections(pos, oldPosition, forwardDir);
		if (collisions.length > 0) {
			if (!this.isColliding_  && this.AnimationFSMService_.state.value != "Pushing") {
				this.AnimationFSMService_.send("STOP");
			}
			this.isColliding_ = true;
			this.AnimationFSMService_.send("PUSH");

			//check if colliding entity has  a physics component
			const physicsComponent = collisions[0].GetComponent("PhysicsComponent");
			if (physicsComponent) {
				//check mass 
				if (physicsComponent.body.mass == 0) {
					return;
				}
				//if so, apply force to it
				// physicsComponent.body.applyImpulse(
				// 	new CANNON.Vec3(20, 0, 20),
				// 	new CANNON.Vec3(10, 0, 10)
				// );
			}
			

			
		//	console.log(collisions);
			//return;
		} else {
			this.isColliding_ = false;
		}
		//this.isColliding_ = false;

		// 

		controlObject.position.set(pos.x, this.body.position.y, pos.z);
		this.body.position.set(pos.x, this.body.position.y, pos.z);
		//const vec = new THREE.Vector3(this.Parent.Position.x, this.body.position.y,this.body.position.z);
		// this.Parent.SetPosition(
		// 	new THREE.Vector3(
		// 		this.body.position.x,
		// 		this.body.position.y,
		// 		this.body.position.z
		// 	)
		// );

		this.Parent.SetPosition(controlObject.position);
		this.Parent.SetQuaternion(controlObject.quaternion);
	}
}
class CharacterInput extends Component {
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

export { PhysicalCharacterController, CharacterInput };
