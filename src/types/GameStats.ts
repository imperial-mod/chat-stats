export interface GameStats {
	[key: string]: {
		value: string | number
		pattern: string[]
	}
}