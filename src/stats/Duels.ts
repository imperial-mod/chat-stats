import Proxy from "hypixel-proxy"
import { Formatting } from "../Formatting"

export class Duels {
	private config: any

	constructor(config: any) {
		this.config = config
	}

	public setConfig = (config: any) => {
		this.config = config
	}

	public getStats = (player: any, uuid: string, clientUuid: string, proxy: Proxy): string => {
		const threatLevels = [
			"gray",
			"white",
			"gold",
			"red",
			"dark_red",
			"dark_blue",
			"light_purple",
			"dark_purple"
		]

		if (player.stats) {
			const stats = player.stats["Duels"]

			if (stats) {
				const wins = stats.wins | 0
				const losses = Math.max(stats.losses | 0, 1)
				const kills = stats.kills | 0
				const deaths = Math.max(stats.deaths | 0, 1)
				const winstreak = stats.current_winstreak | 0
				const bestWinstreak = stats.best_overall_winstreak | 0

				const wlr = wins/losses
				const kdr = kills/deaths

				const wlrColor = threatLevels[Math.floor(Math.min(wlr/5, threatLevels.length-1))]
				const kdrColor = threatLevels[Math.floor(Math.min(kdr/5, threatLevels.length-1))]
				const winstreakColor = threatLevels[Math.floor(Math.min(winstreak/25, threatLevels.length-1))]
				const bestWinstreakColor = threatLevels[Math.floor(Math.min(bestWinstreak/25, threatLevels.length-1))]

				if (this.config.autododge && ((winstreak == bestWinstreak && bestWinstreak >= 15) || winstreak >= 50 || bestWinstreak >= 50 || wlr >= 3 || kdr >= 3) && uuid != clientUuid) {
					proxy.writeServer("chat", { message: "/l" })
					return "§cDODGED"
				}

				return `§fWLR: ${Formatting[wlrColor]}${wlr.toFixed(2)} §f| KDR: ${Formatting[kdrColor]}${kdr.toFixed(2)} §f| WS: ${Formatting[winstreakColor]}${winstreak} §f| BWS: ${Formatting[bestWinstreakColor]}${bestWinstreak} §f| W: §7${wins} §f| L: §7${losses}`
			}
		}

		return "§fWLR: §70 §f| KDR: §70 §f| WS: §70 §f| BWS: §70 §f| W: §70 §f| L: §70"
	}
}