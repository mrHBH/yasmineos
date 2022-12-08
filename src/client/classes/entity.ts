/* eslint-disable @typescript-eslint/no-empty-function */
import * as THREE from "three";
import { EntityManager } from "./EntityManager";


class Entity {
	_name: string;
	_components: Component[] = [];
	_position: THREE.Vector3;
	_rotation: THREE.Quaternion;
	_handlers: {
		[topic: string]: ((message: unknown) => void )[];
	} = {};
	_mesh!: THREE.Mesh;
	parent_!: EntityManager;
	dead_: boolean;
	constructor() {
		this._name = "";
		this._position = new THREE.Vector3();
		this._rotation = new THREE.Quaternion();
		this._handlers = {};
		this.dead_ = false;
	}

	Destroy() {
		console.log("Destroying entity " + this.Name);
		for (const k in this._components) {
			this._components[k].Destroy();
		}
		for (const a in this) {
			//console.log("deleting " + a);
			delete this[a];
		}
	}

	_RegisterHandler(topic: string, h: (m: unknown) => void) {
		if (!(topic in this._handlers)) {
			this._handlers[topic] = [];
		}
		this._handlers[topic].push(h);
	}

	SetParent(p) {
		this.parent_ = p;
	}

	SetName(n) {
		this._name = n;
	}

	get Name() {
		return this._name;
	}

	get Manager() {
		return this.parent_;
	}

	get Mesh() {
		return this._mesh;
	}
	set Mesh(m) {
		this._mesh = m;
	}

	SetActive(b) {
		this.parent_.SetActive(this, b);
	}

	SetDead() {
		this.dead_ = true;
	}

	AddComponent(c: Component, n: string) {
		c.SetParent(this);
		const j = this.GetComponent(n);
		if (!j) {
			this._components[n] = c;

			c.InitComponent();
		}
	}

	InitEntity() {
		for (const k in this._components) {
			this._components[k].InitEntity();
		}
	}

	RemoveComponent(n) {
		const c = this.GetComponent(n);
		if (c) {
			c.Destroy();
			delete this._components[n];
		}
	}

	GetComponent(n) {
		return this._components[n];
	}

	FindEntity(n) {
		return this.parent_.Get(n);
	}

	Broadcast(msg) {

		//  console.log(this.Name + msg);
		if (!(msg.topic in this._handlers)) {
			return;
		}
		for (const curHandler of this._handlers[msg.topic]) {
			curHandler(msg);
		}
	}

	SetPosition(p) {
		this._position.copy(p);
		this.Broadcast({
			topic: "update.position",
			value: this._position,
		});
	}

	SetQuaternion(r) {
		this._rotation.copy(r);
		this.Broadcast({
			topic: "update.rotation",
			value: this._rotation,
		});
	}

	get Position() {
		return this._position;
	}

	get Quaternion() {
		return this._rotation;
	}

	Update(timeElapsed) {
		for (const k in this._components) {
			this._components[k].Update(timeElapsed);
		}
	}
}

class Component {	
	
	[x: string]: any;
	parent_: Entity;
	constructor() {
		this.parent_ = null;
	}

	Destroy() {}

	SetParent(p) {
		this.parent_ = p;
	}

	InitComponent() {}

	InitEntity() {}

	GetComponent(n) {
		return this.parent_.GetComponent(n);
	}

	get Manager() {
		return this.parent_.Manager;
	}

	get Parent() {
		return this.parent_;
	}

	FindEntity(n) {
		return this.parent_.FindEntity(n);
	}

	Broadcast(m) {
		this.parent_.Broadcast(m);
	}

	Update(_) {}

	_RegisterHandler(topic: string, h: (m: {  value: unknown }) => void) {
		this.parent_._RegisterHandler(topic, h);
	}
}

export { Entity, Component};
