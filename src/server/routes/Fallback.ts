import { Request, Response } from "express"
import { Route } from "./Route"
import fs from "fs/promises"
import path from "path"

export class FallbackRoute extends Route {
	public handle = async (req: Request, res: Response) => {
		const filePath = path.join(__dirname, "../views/", req.path)
		try {
			await fs.readFile(filePath)
			res.end(await fs.readFile(filePath))
		} catch {
			res.status(404).json("Could not find what you were looking for (404)")
		}
	}
}