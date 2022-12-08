import { Entity } from "./entity";
import { MainController } from "./MainController";

class EntityManager {
	_ids: number;
	_entitiesMap: { [id: string]: Entity } = {};
	_entities: Entity[];
	mainController: MainController;
	constructor(mc: MainController) {
		this.mainController = mc;
		this._ids = 0;
		this._entitiesMap = {};
		this._entities = [];
	}

	get Entities() {
		return this._entities;
	}
	get MainController() {
		return this.mainController;
	}

	_GenerateName() {
		this._ids += 1;

		return "__name__" + this._ids;
	}

	Get(n: string) {
		return this._entitiesMap[n];
	}

	Filter(cb: (e: Entity) => boolean) {
		return this._entities.filter(cb);
	}

	Add(e: Entity, n: string) {
		if (!n) {
			n = this._GenerateName();
		}

		this._entitiesMap[n] = e;
		this._entities.push(e);

		e.SetParent(this);
		e.SetName(n);
		e.InitEntity();
	}

	SetActive(e: Entity, b: unknown) {
		const i = this._entities.indexOf(e);

		if (!b) {
			if (i < 0) {
				return;
			}

			this._entities.splice(i, 1);
		} else {
			if (i >= 0) {
				return;
			}

			this._entities.push(e);
		}
	}

	Update(timeElapsed: number) {
		const dead = [];
		const alive = [];
		for (let i = 0; i < this._entities.length; ++i) {
			const e = this._entities[i];

			e.Update(timeElapsed);

			if (e.dead_) {
				dead.push(e);
			} else {
				alive.push(e);
			}
		}

		for (let i = 0; i < dead.length; ++i) {
			const e = dead[i];

			delete this._entitiesMap[e.Name];
			if (this.mainController.activeEntities.indexOf(e) >= 0) {
				this.mainController.activeEntities.splice(
					this.mainController.activeEntities.indexOf(e),
					1
				);
			}

			e.Destroy();
		}

		this._entities = alive;
	}
}

export { EntityManager };
