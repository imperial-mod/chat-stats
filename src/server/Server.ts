import express, { Application } from "express"
import WebSocket, { Server as WebSocketServer } from "ws"
import EventEmitter from "events"
import TypedEmitter from "typed-emitter"

import { ServerEvents } from "../types/ServerEvents"
import { RootRoute } from "./routes/Root"
import { FallbackRoute } from "./routes/Fallback"
import { IncomingMessage } from "http"
import { ImperialWebsocket } from "./ImperialWebsocket"
import { ChatStats } from ".."

export class Server extends (EventEmitter as new () => TypedEmitter<ServerEvents>) {

	private app: Application
	private ws: WebSocketServer
	private chatStats: ChatStats

	constructor(chatStats: ChatStats) {
		super()
		this.chatStats = chatStats

		this.init()
	}

	private init = () => {
		this.app = express()
		this.ws = new WebSocketServer({ port: 81 })

		this.ws.on("connection", (socket: WebSocket, request: IncomingMessage) => {
			const ws = new ImperialWebsocket(socket, this.chatStats)

			socket.on("message", (data) => {
				ws.handlePacket(data)
			})
		})

		this.app.get("/", new RootRoute().get)
		this.app.use(new FallbackRoute().handle)

		this.app.listen(80, () => {
			this.emit("ready", 80)
		})
	}
}