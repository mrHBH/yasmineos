import { SpatialHashGrid } from "./SpatialHashGrid";
import { quat, vec3 } from "gl-matrix";
import { WorldEntity } from "./WorldEntity";
import { WorldAIClient, WorldNetworkClient, WorldClient } from "./WorldClient";
import * as CANNON from "cannon-es";

const _TICK_RATE = 0.025;

class WorldManager {
	hashGrid: SpatialHashGrid;
	entities_: WorldClient[];
	ids_: number;
	tickTimer_: number;
	PhysicsWorld: CANNON.World;
	groundMaterial: CANNON.Material;
	slipperyMaterial: CANNON.Material;
	physicsbox: CANNON.Box;
	physicsboxBody: CANNON.Body;
	constructor() {
		this.hashGrid = new SpatialHashGrid(
			[
				[-4000, -4000],
				[4000, 4000],
			],
			[1000, 1000]
		);
		this.ids_ = 0;
		this.PhysicsWorld = new CANNON.World();
		this.PhysicsWorld.gravity.set(0, -0.11, 0.1);
		//this.PhysicsWorld.defaultContactMaterial.contactEquationStiffness = 1e7;
		//this.PhysicsWorld.defaultContactMaterial.contactEquationRelaxation = 4;

		this.groundMaterial = new CANNON.Material("groundMaterial");
		this.groundMaterial.friction = 0.00015;
		this.groundMaterial.restitution = 0.00025;
		this.slipperyMaterial = new CANNON.Material("slipperyMaterial");
		this.slipperyMaterial.friction = 0.015;
		this.slipperyMaterial.restitution = 0.25;

		const groundShape = new CANNON.Box(new CANNON.Vec3(25, 1, 25));
		const groundBody = new CANNON.Body({
			mass: 0,
			material: this.slipperyMaterial,
		});

		groundBody.addShape(groundShape);
		groundBody.position.x = 0;
		groundBody.position.y = -1;
		groundBody.position.z = 0;
		this.PhysicsWorld.addBody(groundBody);

		this.physicsbox= new CANNON.Box(new CANNON.Vec3(1, 1, 1));
		this.physicsboxBody = new CANNON.Body({
			mass: 4.0008,
			material: this.slipperyMaterial,

		});

		this.physicsboxBody.addShape(this.physicsbox);
		this.physicsboxBody.position.x = 0;
		this.physicsboxBody.position.y = 3;
		this.physicsboxBody.position.z = 0;

		this.PhysicsWorld.addBody(this.physicsboxBody);


		// setInterval(() => {
		// 	console.log(this.physicsboxBody.position);
		// }, 1000);

		this.initSampleScene();

		// setInterval(() => {

		// 	for (const Element  of this.entities_) {

		// 		console.log(Element.entity_.ID + " " + Element.entity_.position_+ " " + Element.client_.isConnected);
		// 	}
		// }, 1000);
	}
	initSampleScene() {
		//spawn 1000 entities in random positions all over the map and make sure they are not overlapping
		this.entities_ = [];
		for (let i = 0; i < 50; i++) {
			const e = new WorldEntity({
				id: this.ids_++,
				position: [Math.random() * 1060 , 0, Math.random() * 1060 ],
				rotation: quat.create(),
				grid: this.hashGrid,
			});

			e.accountInfo_ = {
				name: "A" + e.ID,
				//isMobile: true,
			};

			const worldAIClient = new WorldAIClient(e);
			//randomly make some of the entities mobile
			worldAIClient.IsMobile = Math.random() > 0.5;
			e.characterInfo_ = {
				class: "blue",
				inventory: [],
			};
			if (worldAIClient.IsMobile) {
				e.characterInfo_.class = "red";
			} else {
				e.characterInfo_.class = "blue";
			}

			this.entities_.push(worldAIClient);
			
		}

		const e = new WorldEntity({
			id: 65,
			position: vec3.fromValues(0, 0, 12),
			rotation: quat.fromValues(0, 0, 0, 1),
			grid: this.hashGrid,
		});
		e.accountInfo_ = {
			name: "aliveWorldEntityWithAIClient",
		};
		e.characterInfo_ = {
			class: "cyan",
			inventory: [],
		};
		console.log(e.GetDescription());

		const worldClient = new WorldAIClient(e);
		worldClient.IsMobile = true;

		this.entities_.push(worldClient);

		const r = new WorldEntity({
			id: 999,
			position: vec3.fromValues(0, 0, 6),
			rotation: quat.fromValues(0, 0, 0, 1),
			grid: this.hashGrid,
		});
		r.accountInfo_ = {
			name: "JustAWorldEntity",
		};
		r.characterInfo_ = {
			class: "green",
			inventory: [],
		};
		// const worldClient2 = new WorldAIClient(r);
		// worldClient2.IsMobile = false;

		// this.entities_.push(worldClient2);

		// const b = new WorldEntity({
		// 	id: 68,
		// 	position: vec3.fromValues(0, 0, 10),
		// 	rotation: quat.fromValues(0, 0, 0, 1),
		// 	grid: this.hashGrid,
		// });
		// e.accountInfo_ = {
		// 	name: "testNotMobile",
		// };
		// this.entities_ = [];
		//	const worldClientnotmobile = new WorldAIClient(b);
		//	worldClientnotmobile.IsMobile = true;
		//this.entities_.push(worldClientnotmobile);
	}

	AddNetworkPLayer(client, params) {
		const e = new WorldEntity({
			id: this.ids_++,
			position: params.position,
			rotation: params.rotation,
			grid: this.hashGrid,
		});
		e.accountInfo_ = {
			name: "AhumanControlledEntity" + e.ID,
		};
		e.characterInfo_ = {
			class: "purple",
			inventory: [],
		};

		//console.log(e);
		const worldNetworkClient = new WorldNetworkClient(client, e);
		this.entities_.push(worldNetworkClient);
	}

	Update(dt: number) {
		this.TickClientState_(dt);
		this.UpdateEntities_(dt);
		//console.log(dt);
		this.PhysicsWorld.step(dt);
	//	console.log(this.physicsboxBody.position);
		//	this.UpdateSpawners_(dt);
		//const now = performance.now();
		//	console.log(1 / dt);
	}
	UpdateEntities_(dt: number) {
		const dead = [];
		const alive = [];

		for (let i = 0; i < this.entities_.length; ++i) {
			const e = this.entities_[i];

			e.Update(dt);

			if (e.entity_.id_ === 65) {

				vec3.set(e.entity_.position_, this.physicsboxBody.position.x, this.physicsboxBody.position.y, this.physicsboxBody.position.z);
			}
			if (e.IsDead) {
				console.log("killed it off");
				dead.push(e);
			} else {
				alive.push(e);
			}
		}

		this.entities_ = alive;

		for (const d of dead) {
			d.OnDeath();
			d.Destroy();
		}
	}

	TickClientState_(timeElapsed) {
		this.tickTimer_ += timeElapsed;
		if (this.tickTimer_ < _TICK_RATE) {
			return;
		}

		this.tickTimer_ = 0.0;

		for (let i = 0; i < this.entities_.length; ++i) {
			this.entities_[i].UpdateClientState_();
		}
	}
}

export { WorldManager };
