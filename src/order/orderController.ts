import { Request, Response } from "express";

export class OrderController {
    create = async (req: Request, res: Response) => {
        res.status(200).json({ success: true })
    }
}