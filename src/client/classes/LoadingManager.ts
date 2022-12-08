/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-empty */
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import * as SkeletonUtils from "../utils/SkeletonUtils";

class LoadingManager {
	loader = new GLTFLoader();
	colladLoader = new ColladaLoader();
	threedObject!: any;
	parent: any;
	rawModel: THREE.Object3D<THREE.Event>;
	rawAnimations: {};

	constructor() {}

	LoadModel() {
		this.loader.load(
			"./models/ybot2.glb",
			(gltf) => {
				gltf.scene.updateMatrixWorld(true);
				gltf.scene.traverse(function (child) {
					if ((child as THREE.Mesh).isMesh) {
						const m = child as THREE.Mesh;
						m.castShadow = true;
						m.frustumCulled = false;
						m.geometry.computeVertexNormals();
					}
				});
				gltf.scene.updateWorldMatrix(true, true);
				this.rawModel = SkeletonUtils.clone(gltf.scene);

				this.rawAnimations = {};
				this.loader.load(
					"models/ybot2@walking.glb",
					(GLTF) => {
						this.rawAnimations["Walking"] = (GLTF as any).animations[0];
					},
					(xhr: any) => {
						if (xhr.loaded == 94632) {
						}
					},
					(error) => {
						console.log(error);
					}
				);
				// Bored Animation
				this.loader.load(
					"models/ybot@OIdle.glb",
					(GLTF) => {
						this.rawAnimations["Bored"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//::::::::

				// //Jumping UP
				// this.loader.load(
				// 	"models/ybot2@JumpRunning.glb",
				// 	//"models/ybot@KickToGroin.glb",

				// 	(GLTF) => {
				// 		(GLTF as any).animations[0].tracks.shift();
				// 		this.rawAnimations["Jumping"] = (GLTF as any).animations[0];
				// 	},
				// 	(xhr) => {
				// 		if (xhr.loaded == 1087804) {
				// 		}
				// 	},
				// 	(error) => {
				// 		console.log("animation error");
				// 		console.log(error);
				// 	}
				// );
				// //::::::::

				// // Jumping Animation
				// this.loader.load(
				// 	"models/ybot@Jumping.glb",
				// 	//"models/ybot@KickToGroin.glb",

				// 	(GLTF) => {
				// 		(GLTF as any).animations[0].tracks.shift();
				// 		this.rawAnimations["Jumping"] = (GLTF as any).animations[0];
				// 	},
				// 	(xhr) => {
				// 		if (xhr.loaded == 1087804) {
				// 		}
				// 	},
				// 	(error) => {
				// 		console.log("animation error");
				// 		console.log(error);
				// 	}
				// );
				// //::::::::

				// Jumping Animation
				this.loader.load(
					"models/ybot2@JumpFromStill.glb",
					//"models/ybot@KickToGroin.glb",

					(GLTF) => {
						//	(GLTF as any).animations[0].tracks.shift();
						this.rawAnimations["JumpingFromStill"] = (
							GLTF as any
						).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//::::::::

				// Dying Forward1 Animation
				this.loader.load(
					"models/ybot2@DyingForward.glb",
					//"models/ybot@KickToGroin.glb",

					(GLTF) => {
						(GLTF as any).animations[0].tracks.shift();
						this.rawAnimations["Dying1"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//::::::::

				// Dying Forward2 Animation
				this.loader.load(
					"models/ybot2@DyingForward2.glb",
					//"models/ybot@KickToGroin.glb",

					(GLTF) => {
						(GLTF as any).animations[0].tracks.shift();
						this.rawAnimations["Dying2"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//::::::::

				// Bored Animation
				this.loader.load(
					"models/ybot@smoking.glb",
					(GLTF) => {
						(GLTF as any).animations[0].tracks.shift();
						this.rawAnimations["Smoking"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);

				// Bored Animation
				this.loader.load(
					"models/ybot@JumpingUP.glb",
					(GLTF) => {
						this.rawAnimations["JumpingUp"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//::::::::

				// Bored Animation
				this.loader.load(
					"models/ybot@FallingIdle.glb",
					(GLTF) => {
						this.rawAnimations["FallingIdle"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//::::::::

				// Bored Animation
				this.loader.load(
					"models/ybot@HardLanding.glb",
					(GLTF) => {
						this.rawAnimations["HardLanding"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//::::::::

				// Slow Walk Animation
				this.loader.load(
					"models/ybot2@Slowwalking.glb",
					(GLTF) => {
						this.rawAnimations["SlowWalking"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//running Animation
				this.loader.load(
					"models/ybot2@Run.glb",
					(GLTF) => {
						this.rawAnimations["Running"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//Stop Running Animation
				this.loader.load(
					"models/ybot2@RunToStop.glb",
					(GLTF) => {
						(GLTF as any).animations[0].tracks.shift();

						this.rawAnimations["StoppingRunning"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//Punching Animation
				this.loader.load(
					"models/ybot@Punch.glb",
					(GLTF) => {
						this.rawAnimations["Punching"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//Kicking Animation
				this.loader.load(
					"models/ybot@kick.glb",
					(GLTF) => {
						this.rawAnimations["Kicking"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//Arrogant Walking Animation
				this.loader.load(
					"models/ybot@walking2.glb",
					(GLTF) => {
						this.rawAnimations["Walking2"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
							//  this.threedObject.animations['OIdle'].play()
							//  this.setaction('OIdle')
							//  window.alert("Loading Complete")
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//backwardwalking Animation
				this.loader.load(
					"models/ybot2@backwardwalking.glb",
					(GLTF) => {
						this.rawAnimations["BackwardWalking"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);

				//backwardwalking Animation
				this.loader.load(
					"models/ybot2@backwardwalking.glb",
					(GLTF) => {
						this.rawAnimations["TurningLeft"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				//backwardwalkingM Mirrored Animation
				this.loader.load(
					"models/ybot2@backwardwalkingM.glb",
					(GLTF) => {
						this.rawAnimations["TurningRight"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);

				this.loader.load(
					"models/ybot@turnLeft15.glb",
					(GLTF) => {
						this.rawAnimations["TurningLefti"] = (GLTF as any).animations[0];

						//r this.threedObject.animations["OIdle"].play()
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				this.loader.load(
					"models/ybot@turnRight15.glb",
					(GLTF) => {
						(GLTF as any).animations[0].tracks.shift();

						this.rawAnimations["TurningRighti"] = (GLTF as any).animations[0];
						// this.threedObject.animations['TurnRight'].play()
						//r this.threedObject.animations["OIdle"].play()
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
							//  this.threedObject.animations['OIdle'].play()
							//  this.setaction('OIdle')
							//  window.alert("Loading Complete")
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				this.loader.load(
					"models/ybot2@Pushing.glb",
					(GLTF) => {
						this.rawAnimations["Pushing"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				this.loader.load(
					"models/ybot2@Idle.glb",
					(GLTF) => {
						this.rawAnimations["Ideling"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				this.loader.load(
					"models/ybot@SittingIdle.glb",
					(GLTF) => {
						this.rawAnimations["IdelingSitting"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				this.loader.load(
					"models/ybot@StandingUp.glb",
					(GLTF) => {
						this.rawAnimations["StandingUp"] = (GLTF as any).animations[0];
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
				this.loader.load(
					"models/ybot@salute.glb",
					(GLTF) => {
						this.rawAnimations["Saluting"] = (GLTF as any).animations[0];

						//r this.threedObject.animations["OIdle"].play()
					},
					(xhr) => {
						if (xhr.loaded == 1087804) {
							//  this.threedObject.animations['OIdle'].play()
							//  this.setaction('OIdle')
							//  window.alert("Loading Complete")
						}
					},
					(error) => {
						console.log("animation error");
						console.log(error);
					}
				);
			},

			(xhr: any) => {
				// if (xhr.loaded == 2233444) {
				// 	setTimeout(() => {
				// 		this.parent.initialize();
				// 	}, 1000);
				//}
			},
			(error) => {
				console.log(error);
			}
		);

		//window.alert('Player init')
		//return this.loadModel('models/threedObject.glb')
	}

	async LoadPiano() {
		return this.colladLoader.loadAsync(
			// resource URL
			"./models/piano.dae",
			// called when the resource is loaded
			
		);

		
	}

	GetRawModel() {
		return SkeletonUtils.clone(this.rawModel);
	}

	GetColoredModel(color: number) {
		const model = SkeletonUtils.clone(this.rawModel);
		model.traverse((child) => {
			if (child instanceof THREE.Mesh && child.name == "Alpha_Surface") {
				child.material = new THREE.MeshLambertMaterial({
					color: color,
					//	flatShading: (Math.random() > 0.5 ? true : false) ,
					wireframe: Math.random() > 0.5 ? true : false,
					transparent: Math.random() > 0.5 ? true : false,
					opacity: 0.8,
				});
			}
			// pick white or black randomly

			if (child instanceof THREE.Mesh && child.name == "Alpha_Joints") {
				child.material = new THREE.MeshPhongMaterial({
					color: Math.random() > 0.5 ? 0xffffff : 0x000000,
					//flatShading: (Math.random() > 0.5 ? true : false) ,
					wireframe: Math.random() > 0.5 ? true : false,
					transparent: Math.random() > 0.5 ? true : false,
					opacity: 0.8,
				});
			}
		});
		return model;
	}

	GetAnimations() {
		return this.rawAnimations;
	}
}

export { LoadingManager };
