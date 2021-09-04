import Proxy from "hypixel-proxy"
import path from "path"
import fs, { PathLike } from "fs"
import os from "os"
import process from "process"
import colors from "colors"

import { HypixelAPI } from "./Api"
import { Gui } from "./Gui"
import { ChatMessage } from "hypixel-proxy/dist/types/ChatMessage"
import { Config } from "./types/Config"
import { AutododgeCommand } from "./commands/AutododgeCommand"
import { Client } from "minecraft-protocol"
import { Server } from "./server/Server"
import { Location } from "hypixel-proxy/dist/types/Location"
import EventEmitter from "events"

let chatStats: ChatStats

export class ChatStats extends EventEmitter {
    private overlayFolder: PathLike
    private configPath: PathLike

    private proxy: Proxy
    private api: HypixelAPI
    private client: Client
    private server: Server

	private location: Location

    public config: Config

    constructor() {
		super()

		chatStats = this

        this.init()
    }

    private init = () => {
        this.overlayFolder = path.join(os.homedir(), "duels_overlay")
        this.configPath = path.join(this.overlayFolder, "config.json")
        this.config = { auth: "mojang", apiKey: "", compactMode: false, autododge: false }

        if (fs.existsSync(this.configPath)) {
            this.config = JSON.parse(fs.readFileSync(this.configPath, { encoding: "utf8" }))
    
            if (this.config.autododge == undefined) this.config.autododge = true
            if (!this.config.auth) this.config.auth = "mojang"
            if (!this.config.apiKey) this.config.apiKey = ""
        } else {
            if (!fs.existsSync(this.overlayFolder))
                fs.mkdirSync(this.overlayFolder, {recursive: true})
            fs.writeFileSync(this.configPath, "{}")
        }

        this.server = new Server(this)
    
        const gui = new Gui()

		console.log("goodbye world")
    
        //gui.clear()
    
        gui.on("redraw", () => {
            draw()
        })
    
        let statusText = ""
    
        const proxy: Proxy = new Proxy(25566, (this.config.auth as "mojang" | "microsoft"))
        const api: HypixelAPI = new HypixelAPI(this.config.apiKey as string)
    
        proxy.registerCommand("autododge", new AutododgeCommand(this).run)
    
        const draw = async () => {
            // await gui.clear()
            // gui.renderText(colors.cyan(" ___                             __        __   "), 1)
            // gui.renderText(colors.cyan("|   | _____ ______   ___________|__|____  |  |  "), 2)
            // gui.renderText(colors.cyan("|   |/     \\\\____ \\_/ __ \\_  __ \\  \\__  \\ |  |  "), 3)
            // gui.renderText(colors.cyan("|   |  Y Y  \\  |_> >  ___/|  | \\/  |/ __ \\|  |__"), 4)
            // gui.renderText(colors.cyan("|___|__|_|  /   __/ \\___  >__|  |__(____  /____/"), 5)
            // gui.renderText(colors.cyan("          \\/|__|        \\/              \\/      "), 6)
            // gui.renderText(statusText, 10)
            // gui.renderText(colors.bgCyan("Open localhost:80 in a web browser to configure settings"), 11)
            // gui.renderText("Connect to localhost:25566 to use the proxy", 12)
            // gui.renderText(colors.bold("Commands:"), 14)
            // gui.renderText("/autododge toggle - toggle autododge", 15)
        }
    
        api.getKeyInfo().then(info => {
            //gui.clear()
            if (!info.success) {
                statusText = colors.bgRed(`${info.cause} (run /api new while connected to proxy)`)
                draw()
            } else {
                statusText = colors.bgGreen("Proxy Ready")
                draw()
            }
        })
    
        let startChunk = true
    
        process.title = "Chat Stats"
    
        proxy.startProxy()
        proxy.on("player_join", async (uuid, username, bot) => {
			const client = proxy.client
            if (!bot) {
                const player = await api.getPlayer(uuid)
    
                if (startChunk) {
                    proxy.writeClient("chat", { message: JSON.stringify({ text: "\n§8§m---------------§8 [ §6IMPERIAL §8] §m---------------\n" }), position: 0 })
                    startChunk = false
                }
                if (player) {
                    // if (uuid == client.uuid) {
                    // 	proxy.writeClient("chat", { message: JSON.stringify({ text: `§9${username == client.username ? username : client.username} ${stats}` }), position: 0 })
                    // } else {
                    // 	proxy.writeClient("chat", { message: JSON.stringify({ text: `§9${username} ${stats}` }), position: 0 })
                    // }
                } else {
                    proxy.writeClient("chat", { message: JSON.stringify({ text: `§cWARNING ${username} is nicked!` }), position: 0 })
                }
            }
        })
    
        proxy.on("chat", (message) => {
            if (!startChunk) proxy.writeClient("chat", { message: JSON.stringify({ text: "\n§8§m-----------------------------------------" }) })
            if ((message as ChatMessage).text) {
                const _message = (message as ChatMessage)
                if (_message.text == "Your new API key is " && _message.color == "green" && _message.extra[0].color == "aqua") {
                    const key: string = _message.extra[0].text
    
                    this.config.apiKey = key
                    api.setKey(key)
                    api.getKeyInfo().then(info => {
                        gui.clear()
                        if (info.success) {
                            statusText = colors.bgGreen("API Key updated")
                            draw()
                            this.updateConfig(this.config)
                            setTimeout(() => {
                                statusText = colors.bgGreen("Proxy ready")
                                draw()
                            }, 5000)
                        }
                    })
                    proxy.writeClient("chat", { message: JSON.stringify({ text: `§6§lIMPERIAL§7: API key has been set!` }) })
                }
            }
            startChunk = true
        })

		proxy.on("connected_remote", () => {
			this.emit("connected")
		})
    
        proxy.on("remote_error", (err) => { console.error(err) })
        proxy.on("client_error", (err) => { console.error(err) })
		// @ts-ignore
		proxy.on("location", (loc) => { this.location = loc })
    }

    public updateConfig = (config: Config) => {
		this.config = config

        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4))
    }

    public getProxy = (): Proxy => {
        return this.proxy
    }

	public getDir = (): string => {
		return this.overlayFolder as string
	}

	public static getChatStats = (): ChatStats => {
		return chatStats
	}
}

new ChatStats()