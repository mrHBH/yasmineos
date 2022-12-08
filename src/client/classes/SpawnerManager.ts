import * as THREE from "three";
import { ColliderComponent } from "./ColliderComponent";
import { Entity } from "./entity";
import { EntityManager } from "./EntityManager";
import { MainController } from "./MainController";
import { SpatialGridController } from "./SpatialGridController";
import { SpatialHashGrid } from "./SpatialHashGrid";
import { TitleBarComponent } from "./TitleBarComponent";
import { LoadingManager } from "./LoadingManager";
import { CharacterController, CharacterInput } from "./PLayerEntity";
import { NetworkPlayerController } from "./NeworkPlayerController";
import { NetworkEntityController } from "./NeworkEntityController";
import {PhysicsManager} from "./PhysicsManager";
import {PhysicalCharacterController} from "./PLayerEntityPhysical";
import {CarPhysicsComponent} from "./CarPhysicsComponent";

class SpawnerManager {
	entityManager: EntityManager;
	mainController: MainController;
	grid: SpatialHashGrid;
	scene: THREE.Scene;
	loadingManager: LoadingManager;
	physicsManager: PhysicsManager;

	constructor(params) {
		this.entityManager = params.entityManager;
		this.mainController = params.mainController;
		this.grid = params.grid;
		this.scene = params.scene;
		this.loadingManager = params.loadingManager;
		this.physicsManager = params.physicsManager;
	}

	CreatePlayableCharacter(attributes: any) {
		const params = {
			model: this.loadingManager.GetColoredModel(attributes.color),
			animations: this.loadingManager.GetAnimations(),
			scene: this.scene,
		};

		//make new player entity with the random name
		const newPLayer = new Entity();
		newPLayer.AddComponent(new CharacterController(params), "CharacterController");
		newPLayer.AddComponent(new TitleBarComponent(), "TitleBarComponent");
		newPLayer.AddComponent(new ColliderComponent(), "ColliderComponent");
		newPLayer.AddComponent(new SpatialGridController({ grid: this.grid }), "SpatialGridController");

		return newPLayer;
	}

	SpawnCar(attributes: any) {



		
		const geometry2 = new THREE.BoxGeometry(4, 1, 2);
		const CarEntity = new Entity();

		// CarEntity.AddComponent(new ColliderComponent(), "ColliderComponent");
		CarEntity.AddComponent(
			new SpatialGridController({ grid: this.grid }),
			"SpatialGridController"
		);
		CarEntity._RegisterHandler("player.action", (a: any) => {
			console.log(a.action);
		});
		//create wheel meshes
		CarEntity.AddComponent(
			new CarPhysicsComponent({
				physicsManager: this.physicsManager,
				mass: 150,
				geometry: geometry2,
				scene: this.scene,
			}),
			"CarPhysicsComponent"
		);
		CarEntity.AddComponent(new TitleBarComponent(), "TitleBarComponent");
		// CarEntity.AddComponent(
		// 	new CarInputComponent({
		// 		input: this.stinput,
		// 	}),
		// 	"CarInputComponent"
		// );
		CarEntity.SetPosition(attributes.position);

		this.entityManager.Add(CarEntity, attributes.name);
		return CarEntity;
	
	}


	CreatePhysicalCharacter(attributes: any) {
		const params = {
			model: this.loadingManager.GetColoredModel(attributes.color),
			animations: this.loadingManager.GetAnimations(),
			scene: this.scene,
			world: this.physicsManager.world,
		};

		//make new player entity with the random name
		const newPLayer = new Entity();
		newPLayer.AddComponent(new PhysicalCharacterController(params), "PhysicalCharacterController");
		newPLayer.AddComponent(new TitleBarComponent(), "TitleBarComponent");
		newPLayer.AddComponent(new ColliderComponent(), "ColliderComponent");
		newPLayer.AddComponent(new SpatialGridController({ grid: this.grid }), "SpatialGridController");
		this.entityManager.Add(newPLayer, attributes.name);
		newPLayer.SetPosition(attributes.position);
		this.mainController.SetTargetEntity(newPLayer);
		return newPLayer as Entity;

	}

	spawnLocalPlayer(attributes: any) {
		const newPLayer = this.CreatePlayableCharacter(attributes);
	
		this.entityManager.Add(newPLayer, attributes.name);
		newPLayer.SetPosition(attributes.position);
		this.mainController.SetTargetEntity(newPLayer);
		return newPLayer as Entity;
	}

	spawnOnlinePlayer(attributes: any) {
		const newPLayer = this.CreatePlayableCharacter(attributes);
		newPLayer.AddComponent(new NetworkPlayerController(attributes.net), "NetworkPlayerController");
		this.entityManager.Add(newPLayer, attributes.name);
		newPLayer.SetPosition(attributes.position);

		
		this.mainController.SetTargetEntity(newPLayer);
		return newPLayer;
	}

	spawnOnlineEntity(attributes: any) {

		//check if entity already exists
		if (this.entityManager.Get(attributes.name)) {
			return;
		}
		//parse color from attributes
		let color = 0x000000;
		switch (attributes.color) {
		case "red":
			color = 0xff0000;
			break;
		case "green":
			color = 0x00ff00;
			break;
		case "blue":
			color = 0x0000ff;
			break;
		case "yellow":
			color = 0xffff00;
			break;
		case "purple":
			color = 0xff00ff;
			break;
		case "cyan":
			color = 0x00ffff;
			break;
		case "white":
			color = 0xffffff;
			break;
		default:
			break;
		}

		const params = {
			model: this.loadingManager.GetColoredModel(color),
			animations: this.loadingManager.GetAnimations(),
			scene: this.scene,
		};

		const newPLayer = new Entity();
		newPLayer.AddComponent(new CharacterController(params), "CharacterController");
		newPLayer.AddComponent(new TitleBarComponent(), "TitleBarComponent");
		newPLayer.AddComponent(new ColliderComponent(), "ColliderComponent");
		newPLayer.AddComponent(new SpatialGridController({ grid: this.grid }), "SpatialGridController");
		newPLayer.AddComponent(new NetworkEntityController(), "NetworkEntityController");
		this.entityManager.Add(newPLayer, attributes.name);
		newPLayer.SetPosition(attributes.position);

		return newPLayer;
	}

	// if (!this.networkManager.isConnected) {
	// 	const newPLayer = this.CreatePlayableCharacter(attributes);
	// 	newPLayer.AddComponent(new NetworkPlayerController(this.networkManager));
	// 	this.entityManager.Add(newPLayer, attributes.name);
	// 	newPLayer.SetPosition(attributes.position);
	// } else {
	// 	console.log("already connected");
	// }
}

export { SpawnerManager };
