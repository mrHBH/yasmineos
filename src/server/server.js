import express from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { WorldServer } from "./classes/WorldServer";
const port = Number(process.env.PORT) || 3000;
class App {
    constructor(port) {
        this.clients = {};
        this.port = port;
        const app = express();
        app.use(express.static(path.join(__dirname, "../client")));
        this.server = new http.Server(app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
            },
        });
    }
    Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`);
        });
        this.World = new WorldServer(this.io);
    }
}
new App(port).Start();
