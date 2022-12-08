/* eslint-disable @typescript-eslint/no-empty-function */
import { vec3 } from "gl-matrix";
class WorldClient {
    constructor(client, entity) {
        this.entity_ = entity;
        // Hack
        //	this.entity_.onEvent_ = (t, d) => this.OnEntityEvent_(t, d);
        this.client_ = client;
        this.client_.onMessage = (e, d) => this.OnMessage_(e, d);
        this.client_.Send("world.player", this.entity_.CreatePlayerPacket_());
        this.client_.Send("world.stats", this.entity_.CreateStatsPacket_());
        this.timeout_ = 600;
        this.entityCache_ = {};
        // Hack
        entity.parent_ = this;
    }
    Destroy() {
        this.client_.Disconnect();
        this.client_ = null;
        this.entity_.Destroy();
        this.entity_ = null;
    }
    OnDeath() { }
    OnEntityEvent_(t, d) {
        if (t == "attack.damage") {
            this.OnDamageEvent_(d);
        }
    }
    OnMessage_(evt, data) {
        this.timeout_ = 3;
        if (evt == "world.update") {
            this.entity_.UpdateTransform(data);
            return true;
        }
        if (evt == "world.requestCacheRefresh") {
            this.client_.Send("world.cacheRefresh", "");
            // if (data == this.client_.ID) {
            // 	this.entityCache_ = {};
            // }
            this.entityCache_ = {};
            return true;
        }
        if (evt == "chatMessage") {
            this.OnChatMessage_(data);
            return true;
        }
        return false;
    }
    OnDamageEvent_(_) { }
    OnChatMessage_(message) {
        console.log("Chat message: " + message);
        const chatMessage = {
            name: this.entity_.accountInfo_.name,
            text: message,
        };
        this.BroadcastChat(chatMessage);
    }
    BroadcastChat(chatMessage) {
        const nearby = this.entity_.FindNear(50, true);
        for (let i = 0; i < nearby.length; ++i) {
            const n = nearby[i];
            n.parent_.client_.Send("chatMessage", chatMessage);
        }
    }
    get IsDead() {
        return this.timeout_ <= 0.0;
    }
    OnUpdate_(timeElapsed) { }
    OnUpdateClientState_() { }
    UpdateClientState_() {
        this.OnUpdateClientState_();
    }
    Update(timeElapsed) {
        this.timeout_ -= timeElapsed;
        this.entity_.Update(timeElapsed);
        this.OnUpdate_(timeElapsed);
    }
}
class FakeClient {
    constructor() {
        this.isConnected = true;
    }
    Send(msg, data) { }
    Disconnect() { }
}
class WorldAIClient extends WorldClient {
    constructor(entity) {
        console.log("New AI client connected: " + entity.id_);
        //console.log(entity);
        super(new FakeClient(), entity);
        this.deathTimer_ = 0.0;
        this.direction = 1;
        //AI Core
        setInterval(() => {
            this.direction = this.direction * -1;
        }, 5000);
    }
    get IsDead() {
        return this.deathTimer_ >= 30.0;
    }
    set IsMobile(value) {
        this.isMobile = value;
    }
    get IsMobile() {
        return this.isMobile;
    }
    OnDeath() {
        this.onDeath_();
    }
    Disconnect() { }
    OnUpdateClientState_() { }
    OnUpdate_(timeElapsed) {
        if (this.isMobile) {
            const movement = vec3.fromValues(0.0, 0, this.direction * 0.5);
            vec3.scale(movement, movement, timeElapsed * 10.0);
            vec3.add(this.entity_.position_, this.entity_.position_, movement);
            this.entity_.UpdateGridClient_();
            this.entity_.state_ = "Running";
        }
    }
}
class WorldNetworkClient extends WorldClient {
    constructor(client, entity) {
        super(client, entity);
    }
    OnUpdate_(timeElapsed) { }
    // get IsDead() {
    // 	return this.client_.isConnected;
    // }
    get IsDead() {
        return !this.client_.isConnected;
    }
    OnUpdateClientState_() {
        const _Filter = (e) => {
            return e.ID != this.entity_.ID;
        };
        const nearby = this.entity_.FindNear(250, false).filter((e) => _Filter(e));
        const updates = [
            {
                id: this.entity_.ID,
                //stats: this.entity_.CreateStatsPacket_(),
                events: this.entity_.CreateEventsPacket_(),
            },
        ];
        const newCache_ = {};
        for (const n of nearby) {
            // We could easily trim this down based on what we know
            // this client saw last. Maybe do it later.
            let cur = {};
            if (!(n.ID in this.entityCache_)) {
                //console.log("New entity: " + n.ID);
                cur = {
                    id: n.ID,
                    transform: n.CreateTransformPacket_(),
                    stats: n.CreateStatsPacket_(),
                    events: n.CreateEventsPacket_(),
                    desc: n.GetDescription(),
                };
            }
            else {
                cur = {
                    id: n.ID,
                    transform: n.CreateTransformPacket_(),
                    stats: n.CreateStatsPacket_(),
                    events: n.CreateEventsPacket_(),
                };
            }
            newCache_[n.ID] = cur;
            updates.push(cur);
        }
        this.entityCache_ = newCache_;
        this.client_.Send("world.update", updates);
    }
}
export { WorldAIClient, WorldNetworkClient, WorldClient };
