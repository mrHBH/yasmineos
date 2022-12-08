import express from "express";
import path from "path";
import http from "http";
import { Server, Socket } from "socket.io";
import { WorldServer } from "./classes/WorldServer";
//import {openai} from "openai-api";
const port = Number(process.env.PORT) || (3000 as number);

class App {
	private server: http.Server;
	private port: number;

	private io: Server;
	private clients: any = {};
	World: WorldServer;

	constructor(port: number) {
		this.port = port;
		const app = express();
		process.env["OPENAI_API_KEY"] =
			"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";
		app.use(express.static(path.join(__dirname, "../client")));

		this.server = new http.Server(app);

		this.io = new Server(this.server, {
			cors: {
				origin: "*",
			},
		});

		// 		//connect to chatgpt server and get response
		// 		const answer = async (question: string) => {
		// 			const openai = require("openai-api");
		// 			const openai_api_key = process.env.OPENAI_API_KEY;
		// 			const openai_api = new openai(openai_api_key);
		// 			const prompt = `Q: ${question}

		// A:`;

		// 			const response = await openai_api.complete({
		// 				engine: "davinci",
		// 				prompt: prompt,
		// 				maxTokens: 100,
		// 				temperature: 0.9,
		// 				topP: 1,
		// 				frequencyPenalty: 0,
		// 				presencePenalty: 0,
		// 				stop: ["Q:", "A:"],
		// 			});

		// 			return response.data.choices[0].text;
		// 		};
	}

	public Start() {
		this.server.listen(this.port, () => {
			console.log(`Server listening on port ${this.port}.`);
		});

		this.World = new WorldServer(this.io);
	}
}

new App(port).Start();
