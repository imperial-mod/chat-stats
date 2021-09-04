import { ChatStats } from ".."
import { Config } from "../types/Config"
import { Command } from "./Command"

export class AutododgeCommand extends Command {
	private config: Config
	private chatStats: ChatStats

	constructor(chatStats: ChatStats) {
		super()

		this.config = chatStats.config
		this.chatStats = chatStats
	}

	public run = async (subCommand: string) => {
		const proxy = this.chatStats.getProxy()

		this.config = this.chatStats.config

		switch (subCommand) {
			case "toggle": {
				this.config.autododge = !!!this.config.autododge
				if (this.config.autododge) proxy.writeClient("chat", { message: JSON.stringify({ text: "§6§lIMPERIAL§7: autododge toggled on" }) })
				else proxy.writeClient("chat", { message: JSON.stringify({ text: "§6§lIMPERIAL§7: autododge toggled off" }) })
				
				this.chatStats.updateConfig(this.config)

				break
			}
		}
	}
}