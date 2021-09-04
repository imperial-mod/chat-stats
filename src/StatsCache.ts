export class StatsCache {
	private cache: Map<string, any> = new Map<string, any>()
	private cacheSize: number = 300

	constructor(cacheSize: number) {
		this.cacheSize = cacheSize
	}

	public add = (uuid: string, data: any) => {
		if (this.cache.size >= this.cacheSize) {
			this.cache.delete(this.cache.keys().next().value)
			this.cache.set(uuid, data)
		}
	}

	public get = (uuid: string): any => {
		return this.cache.get(uuid)
	}
}