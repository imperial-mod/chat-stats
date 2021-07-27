import fetch from "node-fetch"

export class HypixelAPI {
	private key: string

    constructor(key: string) {
        this.key = key
    }

    getPlayer = async (uuid: string) => {
        const res = await fetch(`https://api.hypixel.net/player?key=${this.key}&uuid=${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return (json as any).player
    }

    getGuild = async (uuid: string) => {
        const res = await fetch(`https://api.hypixel.net/guild?key=${this.key}&player=${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return (json as any).guild
    }

    getPlayerCount = async () => {
        const res = await fetch(`https://api.hypixel.net/playerCount?key=${this.key}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return (json as any).playerCount
    }

    getStatus = async (uuid: string) => {
        const res = await fetch(`https://api.hypixel.net/status?key=${this.key}&uuid=${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return (json as any).status
    }

    getLeaderboards = async () => {
        const res = await fetch(`https://api.hypixel.net/leaderboards?key=${this.key}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return (json as any).leaderboards
    }

    getRecentGames = async (uuid: string) => {
        const res = await fetch(`https://api.hypixel.net/recentGames?key=${this.key}&uuid=${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return (json as any).recentGames
    }

    getGetWatchdogStats = async () => {
        const res = await fetch(`https://api.hypixel.net/watchdogstats?key=${this.key}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return (json as any).watchdogstats
    }

    getFriends = async (uuid: string) => {
        const res = await fetch(`https://api.hypixel.net/friends?key=${this.key}&uuid=${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return (json as any).records
    }

    getKeyInfo = async () => {
        const res = await fetch(`https://api.hypixel.net/key?key=${this.key}`)

        const json = await res.json()

        return json
    }

	setKey = (key: string) => {
		this.key = key
	}
}