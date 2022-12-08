"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldEntity = void 0;
const gl_matrix_1 = require("gl-matrix");
class WorldEntity {
    constructor(params) {
        this.id_ = params.id;
        this.state_ = "Ideling";
        this.position_ = gl_matrix_1.vec3.clone(params.position);
        this.rotation_ = gl_matrix_1.quat.clone(params.rotation);
        this.events_ = [];
        this.grid_ = params.grid;
        this.gridClient_ = this.grid_.NewClient([this.position_[0], this.position_[2]], [10, 10]);
        this.gridClient_.entity = this;
        this.updateTimer_ = 0.0;
    }
    Destroy() {
        this.grid_.Remove(this.gridClient_);
        this.gridClient_ = null;
    }
    get ID() {
        return this.id_;
    }
    get Valid() {
        return this.gridClient_ != null;
    }
    get Health() {
        return this.stats_.health;
    }
    GetDescription() {
        return {
            account: this.accountInfo_,
            character: this.characterInfo_,
        };
    }
    CreatePlayerPacket_() {
        return {
            id: this.ID,
            desc: this.GetDescription(),
            transform: this.CreateTransformPacket_(),
        };
    }
    CreateStatsPacket_() {
        return [this.ID, this.stats_];
    }
    CreateEventsPacket_() {
        return this.events_;
    }
    CreateTransformPacket_() {
        return [
            this.state_,
            [...this.position_],
            [...this.rotation_],
        ];
    }
    UpdateTransform(transformData) {
        //	console.log("--------------------------------------> transformData: ");
        //	console.log(typeof transformData);
        this.state_ = transformData[0];
        this.position_ = gl_matrix_1.vec3.fromValues(...transformData[1]);
        this.rotation_ = gl_matrix_1.quat.fromValues(...transformData[2]);
        this.UpdateGridClient_();
    }
    UpdateGridClient_() {
        this.gridClient_.position = [this.position_[0], this.position_[2]];
        this.grid_.UpdateClient(this.gridClient_);
    }
    SetState(s) {
        if (this.state_ != "death") {
            this.state_ = s;
        }
    }
    FindNear(radius, includeSelf = false) {
        let nearby = this.grid_
            .FindNear([this.position_[0], this.position_[2]], [radius, radius])
            .map((c) => c.entity);
        if (!includeSelf) {
            const _Filter = (e) => {
                return e.ID != this.ID;
            };
            nearby = nearby.filter(_Filter);
        }
        return nearby;
    }
    Update(dt) {
        //this.UpdateGridClient_();
        //
    }
}
exports.WorldEntity = WorldEntity;
