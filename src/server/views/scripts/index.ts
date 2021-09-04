interface Account {
	uuid: string,
	token: string,
	email: string,
	username: string
}

class WebSocketHandler {
	private socket: WebSocket

	public onready: () => void
	public onaccountauth: (code: {code: string, uri: string}) => void
	public config: any

	constructor() {
		this.init()
	}

	private init = () => {
		this.socket = new WebSocket(`ws://${location.hostname}:81`)

		this.socket.addEventListener("open", () => {
			this.writePacket("handshake")
		})

		this.socket.addEventListener("message", (ev) => {
			const data = ev.data

			this.handlePacket(data)
		})

		this.socket.addEventListener("close", (ev) => {
			console.log(`Websocket closed code: ${ev.code}`)
		})
	}

	private writePacket = (name: string, data: any = {}) => {
		const packet = JSON.stringify({ packetType: name, ...data })
	
		this.socket.send(packet)
	}

	private handlePacket = (rawPacket: string | any) => {
		try {
			const packet = JSON.parse(rawPacket)
			const name = packet.packetType
	
			delete packet.packetType
	
			const data = packet

			switch (name) {
				case "handshake": {
					this.config = data.config
					this.onready()
				}
				case "set_config": {
					this.config = data.config
				}
				case "msa_auth_code": {
					this.onaccountauth(data)
				}
			}
	
			console.log(name, data)
		} catch {
	
		}
	}

	public writeConfig = (config: any) => {
		this.writePacket("update_config", { config })
	}
}

class GuiBuilder {
	private colors: {colors: {[key: string]: string}, shadows: {[key: string]: string}}

	constructor() {
		this.init()
	}

	private init = () => {
		fetch("/assets/colors.json").then((res) => {
			res.json().then(colors => this.colors = colors)
		})
	}

	public createToggle = (event: ((ev: Event, state: boolean) => void), enabled: boolean = false): HTMLLabelElement => {
		const wrapper = document.createElement("label")
		const input = document.createElement("input")
		const slider = document.createElement("span")

		input.type = "checkbox"

		wrapper.className = "settings-toggle setting"
		slider.className = "toggle-slider"
		
		wrapper.appendChild(input)
		wrapper.appendChild(slider)

		if (enabled) // chance of it being undefined
			input.checked = true 

		input.addEventListener("change", (ev) => {
			event(ev, input.checked)
		})

		return wrapper
	}

	public createLabel = (labelTitle: string): HTMLSpanElement => {
		const label = document.createElement("span")

		label.className = "setting-label"
		label.innerText = labelTitle

		return label
	}

	public createInlineLabel = (labelTitle: string): HTMLSpanElement => {
		const label = this.createLabel(labelTitle)
		label.classList.add("inline")
		return label
	}

	public createTextInput = (change: (value: string) => void, value: string = ""): HTMLInputElement => {
		const input = document.createElement("input")

		input.className = "settings-input wide"
		input.value = value
		input.addEventListener("input", () => {
			change(input.value)
		})

		return input
	}

	public createNumberInput = (change: (value: number) => void, value: number = 0, min: number = 0, max?: number): HTMLInputElement => {
		const input = document.createElement("input")

		input.type = "number"
		input.step = "0"
		input.min = min.toString()
		if (max) {
			input.max = max.toString()
		}
		input.value = value.toString()
		input.className = "settings-input setting"

		input.addEventListener("input", (ev) => {
			let val = parseFloat(input.value)

			if (max && val > max) {
				input.value = max.toString()
				val = max
			} else if (val < min) {
				val = min
				input.value = min.toString()
			}

			change(val)
		})

		return input
	}

	public createSeperator = (): HTMLDivElement => {
		const seperator = document.createElement("div")

		seperator.className = "group-organizer"

		return seperator
	}

	public createAccountList = (accounts: Account[]): HTMLDivElement => {
		const accountList = document.createElement("div")

		if (accounts && accounts.length > 0) {
			for (const account of accounts) {
				const accountElement = document.createElement("div")
				const accountName = document.createElement("span")

				accountName.innerText = account.username
			}
		} else {
			
		}

		return accountList
	}
}

class WebGui {
	private socketHandler: WebSocketHandler = new WebSocketHandler()
	private guiBuilder: GuiBuilder = new GuiBuilder()

	constructor() {
		this.socketHandler.onready = this.buildGui
	}

	private buildGui = () => {
		const config = this.socketHandler.config

		const proxySettings = document.querySelector("#settings-proxy") as HTMLDivElement

		proxySettings.appendChild(this.guiBuilder.createLabel("API Key"))
		proxySettings.appendChild(this.guiBuilder.createTextInput((val) => {
			config.apiKey = val
			this.socketHandler.writeConfig(config)
		}, config.apiKey))

		this.buildAutododgeSettings(config)
	}

	private buildAutododgeSettings = (config: any) => {
		const autododgeSettings = document.getElementById("settings-dodge") as HTMLDivElement

		if (!config.autododgeOpt) {
			config.autododgeOpt = {}
			this.socketHandler.writeConfig(config)
		}
		if (!config.autododgeOpt.duels) {
			config.autododgeOpt.duels = {}
		}

		autododgeSettings.appendChild(this.guiBuilder.createInlineLabel("Enabled"))
		autododgeSettings.appendChild(this.guiBuilder.createToggle((ev, state) => {
			config.autododge = state
			this.socketHandler.writeConfig(config)
		}, config.autododge))
		autododgeSettings.appendChild(this.guiBuilder.createInlineLabel("Dodge nicks"))
		autododgeSettings.appendChild(this.guiBuilder.createToggle((ev, state) => {
			config.autododgeOpt.dodgeNicks = state
			this.socketHandler.writeConfig(config)
		}, config.autododgeOpt.dodgeNicks))

		autododgeSettings.appendChild(this.guiBuilder.createSeperator())

		autododgeSettings.appendChild(this.guiBuilder.createLabel("Duels"))

		autododgeSettings.appendChild(this.guiBuilder.createInlineLabel("Dodge on BWS"))
		autododgeSettings.appendChild(this.guiBuilder.createToggle((ev, state) => {
			config.autododgeOpt.dodgeBws = state
			this.socketHandler.writeConfig(config)
		}, config.autododgeOpt.dodgeBws))
		autododgeSettings.appendChild(this.guiBuilder.createLabel(""))

		autododgeSettings.appendChild(this.guiBuilder.createInlineLabel("Max WLR"))
		autododgeSettings.appendChild(this.guiBuilder.createNumberInput((val) => {
			config.autododgeOpt.duels.max_wlr = val
			this.socketHandler.writeConfig(config)
		}, config.autododgeOpt.duels.max_wlr))
		autododgeSettings.appendChild(this.guiBuilder.createInlineLabel("Max KDR"))
		autododgeSettings.appendChild(this.guiBuilder.createNumberInput((val) => {
			config.autododgeOpt.duels.max_kdr = val
			this.socketHandler.writeConfig(config)
		}, config.autododgeOpt.duels.max_kdr))
		autododgeSettings.appendChild(this.guiBuilder.createInlineLabel("Max WS"))
		autododgeSettings.appendChild(this.guiBuilder.createNumberInput((val) => {
			config.autododgeOpt.duels.max_ws = val
			this.socketHandler.writeConfig(config)
		}, config.autododgeOpt.duels.max_ws))
		autododgeSettings.appendChild(this.guiBuilder.createInlineLabel("Max BWS"))
		autododgeSettings.appendChild(this.guiBuilder.createNumberInput((val) => {
			config.autododgeOpt.duels.max_bws = val
			this.socketHandler.writeConfig(config)
		}, config.autododgeOpt.duels.max_bws))
		autododgeSettings.appendChild(this.guiBuilder.createInlineLabel("Max Wins"))
		autododgeSettings.appendChild(this.guiBuilder.createNumberInput((val) => {
			config.autododgeOpt.duels.max_wins = val
			this.socketHandler.writeConfig(config)
		}, config.autododgeOpt.duels.max_wins))
		autododgeSettings.appendChild(this.guiBuilder.createInlineLabel("Min Wins"))
		autododgeSettings.appendChild(this.guiBuilder.createNumberInput((val) => {
			config.autododgeOpt.duels.min_wins = val
			this.socketHandler.writeConfig(config)
		}, config.autododgeOpt.duels.min_wins))
		autododgeSettings.appendChild(this.guiBuilder.createInlineLabel("Max Melee Aim"))
		autododgeSettings.appendChild(this.guiBuilder.createNumberInput((val) => {
			config.autododgeOpt.duels.max_aim = val
			this.socketHandler.writeConfig(config)
		}, config.autododgeOpt.duels.max_aim, 0, 100))
	}
}

(window as any).webGui = new WebGui()