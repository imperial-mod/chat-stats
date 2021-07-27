import Proxy from "hypixel-proxy"
import path from "path"
import fs from "fs"
import os from "os"
import process from "process"
import { HypixelAPI } from "./Api"
import { Duels } from "./stats/Duels"
import colors from "colors"
import { Gui } from "./Gui"
import { ChatMessage } from "hypixel-proxy/dist/types/ChatMessage"

const overlayFolder = path.join(os.homedir(), "duels_overlay")
const configPath = path.join(overlayFolder, "config.json")
let config = { auth: "mojang", apiKey: "", autododge: true }
if (fs.existsSync(configPath)) {
	config = JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }))

	if (config.autododge == undefined) config.autododge = true
	if (!config.auth) config.auth = "mojang"
	if (!config.apiKey) config.apiKey = ""
} else {
	if (!fs.existsSync(overlayFolder))
		fs.mkdirSync(overlayFolder, {recursive: true})
	fs.writeFileSync(configPath, "{}")
}

const gui = new Gui()

gui.clear()

gui.on("redraw", () => {
	draw()
})

let statusText = ""

const proxy: Proxy = new Proxy(25566, (config.auth as "mojang" | "microsoft"))
const api: HypixelAPI = new HypixelAPI(config.apiKey)

const duels = new Duels(config)

proxy.registerCommand("autododge", (subCommand: string) => {
	switch(subCommand) {
		case "toggle":
			config.autododge = !!!config.autododge
			if (config.autododge) proxy.writeClient("chat", { message: JSON.stringify({ text: "§6§lIMPERIAL§7: autododge toggled on" }) })
			else proxy.writeClient("chat", { message: JSON.stringify({ text: "§6§lIMPERIAL§7: autododge toggled off" }) })
			duels.setConfig(config)
			writeConfig()
			break
	}
})

const writeConfig = () => {
	fs.writeFileSync(configPath, JSON.stringify(config))
}

const wait = (): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, 2000)
	})
}

const draw = async () => {
	await gui.clear()
	gui.renderText(colors.cyan(" ___                             __        __   "), 1)
	gui.renderText(colors.cyan("|   | _____ ______   ___________|__|____  |  |  "), 2)
	gui.renderText(colors.cyan("|   |/     \\\\____ \\_/ __ \\_  __ \\  \\__  \\ |  |  "), 3)
	gui.renderText(colors.cyan("|   |  Y Y  \\  |_> >  ___/|  | \\/  |/ __ \\|  |__"), 4)
	gui.renderText(colors.cyan("|___|__|_|  /   __/ \\___  >__|  |__(____  /____/"), 5)
	gui.renderText(colors.cyan("          \\/|__|        \\/              \\/      "), 6)
	gui.renderText(statusText, 10)
	gui.renderText("Connect to localhost:25566 to use the proxy", 11)
	gui.renderText(colors.bold("Commands:"), 13)
	gui.renderText("/autododge toggle - toggle autododge", 14)
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
	if (!bot) {
		const player = await api.getPlayer(uuid)
		const client = proxy.client

		if (startChunk) {
			proxy.writeClient("chat", { message: JSON.stringify({ text: "\n§8§m---------------§8 [ §6IMPERIAL §8] §m---------------\n" }), position: 0 })
			startChunk = false
		}
		if (player) {
			const stats = duels.getStats(player, uuid, proxy.client.uuid, proxy)
			if (uuid == client.uuid) {
				proxy.writeClient("chat", { message: JSON.stringify({ text: `§9${username == client.username ? username : client.username} ${stats}` }), position: 0 })
			} else {
				proxy.writeClient("chat", { message: JSON.stringify({ text: `§9${username} ${stats}` }), position: 0 })
			}
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

			config.apiKey = key
			api.setKey(key)
			api.getKeyInfo().then(info => {
				gui.clear()
				if (info.success) {
					statusText = colors.bgGreen("API Key updated")
					draw()
					writeConfig()
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

proxy.on("remote_error", (err) => { console.error(err) })
proxy.on("client_error", (err) => { console.error(err) })