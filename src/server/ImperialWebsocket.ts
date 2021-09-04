// @ts-ignore
import { Authflow, Titles } from "prismarine-auth"
import WebSocket from "ws"
// @ts-ignore
import yggdrasil from "yggdrasil"
import { ChatStats } from ".."

export class ImperialWebsocket {
	private socket: WebSocket
	private chatStats: ChatStats

	constructor(socket: WebSocket, chatStats: ChatStats) {
		this.socket = socket
		this.chatStats = chatStats
	}

	public writePacket = (name: string, data?: any) => {
		const packet = JSON.stringify({ packetType: name, ...data })

		this.socket.send(packet)
	}

	public handlePacket = (rawPacket: string | any) => {
		try {
			const packet: any = JSON.parse(rawPacket)
			const name: string = packet.packetType

			console.log(name, packet)

			switch (name) {
				case "handshake": {
					this.writePacket("handshake", { config: this.chatStats.config })

					break
				}
				case "update_config": {
					this.chatStats.updateConfig(packet.config)

					this.writePacket("updated_config")

					break
				}
				case "authenticate_account": {
					const type = packet.accountType
					const authTimestamp = packet.timestamp

					const ygg = yggdrasil()

					if (type == "microsoft") {
						// @ts-ignore
						const flow = new Authflow(packet.user, this.chatStats.getDir(), {
							password: packet.pass,
							authTitle: Titles.MinecraftJava
						}, (code: any) => {
							this.writePacket("msa_auth_code", {
								code: code.user_code,
								uri: code.verification_uri
							})
						})

						// @ts-ignore
						flow.getMinecraftJavaToken({ fetchProfile: true, fetchEntitlements: true })
							.then((res: any) => {
								console.log(res.token)
								this.writePacket("authenticated_account", {
									username: res.profile.name,
									uuid: res.profile.id,
									timestamp: authTimestamp
								})
							})

						return
					}

					ygg.auth({
						user: packet.user,
						pass: packet.pass,
						requestUser: true
					}).then((res: any) => {
						this.writePacket("authenticated_account", {
							username: res.selectedProfile.name,
							uuid: res.selectedProfile.id,
							timestamp: authTimestamp
						})
					}, (err: any) => {})

					break
				}
			}
		} catch (err) {
			console.log(`Error in packet: ${rawPacket}, ${err}`)
		}
	}
}