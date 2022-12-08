import { io, Socket } from "socket.io-client";
import { EntityManager } from "./EntityManager";
import { SpawnerManager } from "./SpawnerManager";
import * as THREE from "three";
class NetworkManager {
	socket: Socket;
	id: string;
	entityManager: EntityManager;
	spawner: SpawnerManager;
	playerID: string;

	constructor(params) {
		this.spawner = params.spawner;
		this.playerID = null;
		this.entityManager = params.entityManager;

		//
	}

	get isConnected() {
		if (this.socket) {
			return this.socket.connected;
		} else {
			return false;
		}
	}

	Connect() {
		if (!this.isConnected) {
			console.log("connecting...");
			this.socket = io();
			this.socket.on("connect", () => {
				console.log("connected !");
			});
			this.socket.on("disconnect", () => {
				console.log("disconnected !");
				//this.Disconnect();
			});
			this.socket.onAny((e, d) => {
				this.OnMessage(e, d);
			});
		} else {
			console.log("already connected");
		}
	}
	GetEntityID_(serverID) {
		if (serverID == this.playerID) {
			return "player" + serverID;
		} else {
			return "__nOpc__" + serverID;
		}
	}
	OnMessage(e: string, d: any) {
		if (e == "world.player") {
			console.log("player connected", d);

			// this.spawner.spawnOnlinePlayer({
			// 	name: this.GetEntityID_(d.id),
			// 	position: new THREE.Vector3(0, 0, 0),
			// });
			this.id = d.id;
		} else if (e == "world.update") {
			for (const u of d) {
				const id = this.GetEntityID_(u.id);

				let npc = null;
				if ("desc" in u) {
					npc = this.spawner.spawnOnlineEntity({
						name: id,
						position:  new THREE.Vector3(...u.transform[1]),
						color: u.desc.character.class,
						acc: u.desc.account,
					});

					// npc.Broadcast({
					// 	topic: "network.inventory",
					// 	inventory: u.desc.character.inventory,
					// });
				} else {
					npc = this.entityManager.Get(id);
					if (npc) {
						npc.Broadcast({
							topic: "network.update",
							transform: u.transform,
							//stats: u.stats,
							//events: events,
						});
						// }
						// return;
					}
					if (!npc && u.id != this.id) {
						//request new cache
						this.socket.emit("world.requestCacheRefresh", u.id);
						
					}
					// 	return;
					// } else {
					// 	console.log("updataing npc", u.id);

					// 	npc.Broadcast({
					// 		topic: "network.update",
					// 		transform: u.transform,
					// 		//stats: u.stats,
					// 		//events: events,
					// 	});
					// }
				}

				// npc.Broadcast({
				// 	topic: "network.update",
				// 	transform: u.transform,
				// 	//stats: u.stats,
				// 	//events: events,
				// });

				// //const spawaner= this.params.spawner;
				// check if descriptor is valid

				//console.log("world.update", d);
			}
		} else if (e == "world.cacheRefresh") {
			console.log("world.requestCacheRefresh", d);
			//	window.alert("world.requestCacheRefresh");
			//	this.socket.emit("world.requestCacheRefresh", d);
		}

		else if (e == "chatMessage") {
			console.log("chatMessage", d);
			//	window.alert("world.requestCacheRefresh");
			//	this.socket.emit("world.requestCacheRefresh", d);
		}
		//throw new Error("Method not implemented.");
	}

	SendChatMessage(message: string) {
		console.log("SendChatMessage", message);
		this.socket.emit("chatMessage", message);
	}

	SendTransformUpdate(transform) {
		//	console.log("SendTransformUpdate", transform);
		this.socket.emit("world.update", transform);
	}

	onDisconnect() {
		//
	}

	Disconnect() {
		console.log("disconnecting...");
		if (this.socket) {
			this.socket.disconnect();
			this.onDisconnect();
			//this.socket.close();
		}
		this.socket = null;
	}
}

export { NetworkManager };
