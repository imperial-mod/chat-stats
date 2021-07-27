import EventEmitter from "events"
import colors from "colors"

export class Gui extends EventEmitter {
	private width: number = process.stdout.columns+8

	constructor() {
		super()

		this.watch()
	}

	public clear = (): Promise<void> => {
		return new Promise((resolve) => {
			process.stdout.cursorTo(0, 0, () => {
				process.stdout.clearScreenDown(() => {
					resolve()
				})
			})
		})
	}

	private watch = () => {
		process.stdout.on("resize", async () => {
			//await this.clear()
			this.width = process.stdout.columns+8
			this.emit("redraw")
		})
	}

	public renderText = (text: string, line: number = 0, center: boolean = true) => {
		const textPos = Math.ceil((this.width / 2) - colors.stripColors(text).length / 2)

		process.stdout.cursorTo(0, line)

		let string = ""

		for (let i = 0; i <= this.width; i++) {
			if (i == textPos) {
				string += text
				i += colors.stripColors(text).length
			} else
				string += " "
		}

		process.stdout.write(string)
	}
}