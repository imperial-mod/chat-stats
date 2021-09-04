import fs from "fs/promises"
import path from "path"

import { Request, Response } from "express"
import { Route } from "./Route"

export class RootRoute extends Route {
	public get = async (req: Request, res: Response) => {
		res.end(
			await fs.readFile(path.join(__dirname, "../views/index.htm"), {encoding: "utf8"})
		)
	}
}