import * as THREE from "three";
import { createMachine, interpret, StateMachine } from "xstate";
import { tween, Tween, TWEEN } from "three/examples/jsm/libs/tween.module.min";
import { Component } from "./entity";

class CharacterController extends Component {
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

	// previousState_: string = 'Idelingg'
	// currentState_: string = 'Idelingg'

	constructor(params: any) {
		super();
		this.params_ = params;
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
		this.CreateFSM_();
	}

	CreateFSM_() {
		this.AnimationFSM_ =
			/** @xstate-layout N4IgpgJg5mDOIC5QGMAWBDATu5AXMmAdAJIRgA2AlgHZQDEA6gIIAyA0oqAA4D2sluSj2qcQAD0QBGACwAmQgE4A7ADZJsyQFYlCzZoDMC-QBoQAT0QBabdMJaFklcpU6Z0gL7vTaLDnxFSChp6AGUWAHkGZnZRXn5BYVEJBEtZaQVCQyM5fVkADlklE3MrSQdCJSVZBUKlaXUZWU9vDGw8AhIyKlo6ACEmAGE2ZgAlABFojiQQOIEhEWnky30ABn1M5X0ihWldvMNNUwsU2UMKqprK+o05ZpAfNv9OoJ6AFQBVEYA5EeIAcQAEq9Ynw5olFlZpCo7Cp8oVpPotqpDiUUvo8ppCHkFLoFLDZCscio7g8-B1At16B9viwAKIAMWB01mCQWoCWShW0KMVxUq30KkFKiOpXUhF2K1qK0kkgFBOJXnurTJAS6wToAAV3iEASD4vMklZKus0oTZHpVGt0SKTjJMnk5DolLLYZI8iTle0iBqAK6wVDqkKvcIavVgtniKz6eqEc1rSRFFTSbH1G0I6GCvGcqHmhGaD2+L2EX3+9WTMOsw1omNx-QJgXJnaSNOqQgqPKyzTVC5lKEFx4dV4+zDUYIjShQVC4OhBkMVg0QtGyaFaPlOFYbtfFY4qLltlaaPIqTQb6My-OK0lFocj4IsMAAM2ns9DzNBlcXy1WhD0x7Uy9lJQMRtJMMwTTRpCUTRALyKD+xVQgGHQcgAGtA2DV9uHfBd2Ssc1oX5JM5C0PID2XG1UiUDYMRqBw6xWTlJHgoskNQ9URneL553BXCUm0TJ0X0AxCUgxw8htSRJR-LkigFKCuQxC8WkLJ5ehwFCAHcsAgVi0J6F9uIjJZzXWXRkwMUj8gKa1UWjPJFCcHEsxWBw6iUpUVI6EYfWoUcenLN99R4yMEAg+RYXMwkMVXcTUUsWV1j5dRVF2Q8NHdS9PSebzfPQudAvDKtrDOBinEcaVEQ7WQbTSc4MXhGU1hPBFmKeEJyB4DTdLyzCZmw4LjJlCpjxkZKHXbXIbVWSRYw7XQmukaD1Fajp2s67r-NYKYsKCoyo0KQgGOkFYaNItQXGFVFQLbcDIOgrZYPcq82twHguC4McfL8+gOK+L5iC+P4Xw1WkxkMorc3FdEuTo9IXW3RBDAzbQFFg3QNBcRbPEVageDIeBpme8k1VocHP2dFZMg3KFjsPA9tAo1KKgUNZiMJNY4MyzzvT9ANSYKj9eOsaDFAghp0UkhiEYQHNxVOBwqp0ZMkxWogb2+8dJ1wMmhb0GazPFjsNyKG1hPFIikwg6CHQUVXCHVu9H21gWcJC4X9bFjQJeN6XNFR6STxkSpnTdJ6so6DaoB1kK3RmuQ0gJXZktUJQKNDuxVCcI8swxSU7bU5BNO0yPo6WPXReuWUjalqb0lmsoTyExaZRkO2cu+0upCKRQoXRbQZQKOaJLONxoM5Y8jCzu21q65C9Kjl2BqkApY0PUiO3-BFowo3JMRzWoanqFLp9e97Pty-mdsKxchOhIDZAfopg85VPbOlevlATIDOQ7JRVc7lITpYzHTkBaXclUKLXXsGJaMbllDY3cEAA */
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
									target: "Jumping",
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
						Jumping: {
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
								curAction.crossFadeFrom(prevAction, 0.25, true);
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
							const secAction = this.animations_["Ideling"];
							secAction.enabled = true;
							secAction.time = 0.0;
							secAction.setEffectiveTimeScale(1.0);
							secAction.setEffectiveWeight(30.0);
							secAction.play();
							curAction.time = 0.0;
							curAction.enabled = true;
							curAction.setEffectiveTimeScale(1.0);
							curAction.setEffectiveWeight(1.0);
							curAction.crossFadeFrom(prevAction, 0.25, true);
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
							curAction.crossFadeFrom(prevAction, 0.25, true);
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
			input._keys.space &&
			this.AnimationFSMService_.state.value !== "Jumping"
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
			(this.AnimationFSMService_.state.value == "TurningLeft" ||
				this.AnimationFSMService_.state.value == "TurningRight")
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
			const co = c.GetComponent("ColliderComponent");
			if (co) {
				return true;
			}
		};

		const grid = this.GetComponent("SpatialGridController");
		const nearby = grid
			.FindNearbyEntities(2)
			.map((e) => e.entity)
			.filter((e: any) => _isCollidable(e))
			.map((e: any) => e.Mesh);
		// .map((a: { entity: { _mesh: any } }) => a.entity._mesh);

		//	console.log(nearby)
		const midpos = pos.clone().add(new THREE.Vector3(0, 0.8, 0));

		const ray = new THREE.Raycaster(midpos, dir);
		const collisions = [];
		const intersects = ray.intersectObjects(nearby, true);

		if (intersects.length > 0) {
			//	console.log ( intersects[0].distance);
			if (intersects[0].distance < 0.65)
				collisions.push(intersects[0].object.userData.parent);
			//	console.log(intersects[0]);

			//if the object is already colliding , push back the group in the opposite direction of the ray
			if (intersects[0].distance < 0.4) {
				this.group_.position.add(dir.multiplyScalar(-1).multiplyScalar(0.11));
			}

			if (intersects[0].distance < 0.4) {
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
				return 1150;
			case "BackwardWalking":
				return 0.7;
			case "SlowWalking":
				return 0.5;
			default:
				return 0;
		}
	}

	Update(timeInSeconds: number) {
		if (timeInSeconds > 1) {
			return;
		}
		if (this._mixer) {
			this._mixer.update(timeInSeconds);
		}

		this.input = this.GetComponent("CharacterInput");
		if (this.input == undefined) {
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
		}
		if (this.input._keys.right) {
			_A.set(0, 1, 0);
			_Q.setFromAxisAngle(
				_A,
				4.0 * -Math.PI * timeInSeconds * this.acceleration_.y
			);
			_R.multiply(_Q);
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

		const pos = controlObject.position.clone();
		pos.add(forward);
		pos.add(sideways);

		const collisions = this._FindIntersections(pos, oldPosition, forwardDir);
		if (collisions.length > 0) {
			if (!this.isColliding_) {
				this.AnimationFSMService_.send("STOP");
			}
			this.isColliding_ = true;

			return;
		}
		this.isColliding_ = false;

		controlObject.position.copy(pos);
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

export { CharacterController, CharacterInput };
