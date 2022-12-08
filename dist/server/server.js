"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const WorldServer_1 = require("./classes/WorldServer");
const port = Number(process.env.PORT) || 3000;
class App {
    constructor(port) {
        this.clients = {};
        this.port = port;
        const app = (0, express_1.default)();
        process.env["OPENAI_API_KEY"] =
            "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";
        app.use(express_1.default.static(path_1.default.join(__dirname, "../client")));
        this.server = new http_1.default.Server(app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: "*",
            },
        });
        //connect to chatgpt server and get response
        const answer = async (question) => {
            const openai = require("openai-api");
            const openai_api_key = process.env.OPENAI_API_KEY;
            const openai_api = new openai(openai_api_key);
            const prompt = `Q: ${question}

A:`;
            const response = await openai_api.complete({
                engine: "davinci",
                prompt: prompt,
                maxTokens: 100,
                temperature: 0.9,
                topP: 1,
                frequencyPenalty: 0,
                presencePenalty: 0,
                stop: ["Q:", "A:"],
            });
            return response.data.choices[0].text;
        };
    }
    Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`);
        });
        this.World = new WorldServer_1.WorldServer(this.io);
    }
}
new App(port).Start();
