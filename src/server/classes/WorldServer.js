import { performance } from "perf_hooks";
import { WorldManager } from "./WorldManager";
import { vec3, quat } from "gl-matrix";
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
class WorldServer {
    constructor(io) {
        this.io = io;
        this.WorldManager = new WorldManager();
        this.io.on("connection", (socket) => {
            const sw = new SocketWrapper({ socket: socket });
            const params = {
                position: vec3.fromValues(0, 0, 0),
                rotation: quat.fromValues(0, 0, 0, 1),
            };
            this.WorldManager.AddNetworkPLayer(sw, params);
        });
        //this.WorldManager.AddNetworkPLayer();
        this.Run(performance.now());
    }
    Run(t1) {
        setTimeout(() => {
            const t2 = performance.now();
            this.Update((t2 - t1) * 0.001);
            this.Run(t2);
        });
    }
    Update(dt) {
        this.WorldManager.Update(dt);
    }
}
export { WorldServer, SocketWrapper };
