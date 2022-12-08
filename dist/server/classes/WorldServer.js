"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketWrapper = exports.WorldServer = void 0;
const perf_hooks_1 = require("perf_hooks");
const WorldManager_1 = require("./WorldManager");
const gl_matrix_1 = require("gl-matrix");
class SocketWrapper {
    constructor(params) {
        this.socket_ = params.socket;
        this.onMessage = null;
        this.isConnected = true;
        this.SetupSocket_();
    }
    get ID() {
        return this.socket_.id;
    }
    get IsConnected() {
        return this.isConnected;
    }
    SetupSocket_() {
        this.socket_.on("user-connected", () => {
            console.log("socket.id: " + this.socket_.id);
            this.isConnected = true;
        });
        this.socket_.on("disconnect", () => {
            console.log("Client disconnected.");
            this.isConnected = false;
        });
        this.socket_.onAny((e, d) => {
            try {
                if (this.onMessage(e, d) == null) {
                    //	console.log("Unknown command (" + e + "), disconnected.");
                    //this.Disconnect();
                }
            }
            catch (err) {
                //console.error(err);
                //this.Disconnect();
            }
        });
    }
    Disconnect() {
        this.socket_.disconnect(true);
    }
    Destroy() {
        this.socket_.disconnect(true);
        this.socket_ = null;
        this.onMessage = null;
    }
    Send(msg, data) {
        this.socket_.emit(msg, data);
    }
}
exports.SocketWrapper = SocketWrapper;
class WorldServer {
    constructor(io) {
        this.io = io;
        this.WorldManager = new WorldManager_1.WorldManager();
        this.io.on("connection", (socket) => {
            const sw = new SocketWrapper({ socket: socket });
            const params = {
                position: gl_matrix_1.vec3.fromValues(0, 0, 0),
                rotation: gl_matrix_1.quat.fromValues(0, 0, 0, 1),
            };
            this.WorldManager.AddNetworkPLayer(sw, params);
        });
        //this.WorldManager.AddNetworkPLayer();
        this.Run(perf_hooks_1.performance.now());
    }
    Run(t1) {
        setTimeout(() => {
            const t2 = perf_hooks_1.performance.now();
            this.Update((t2 - t1) * 0.001);
            this.Run(t2);
        });
    }
    Update(dt) {
        this.WorldManager.Update(dt);
    }
}
exports.WorldServer = WorldServer;
