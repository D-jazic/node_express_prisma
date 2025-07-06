import { Request, Response, Router } from "express";

const rootRoutes = Router();

// Just pass the function reference
rootRoutes.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Welcome to the API" });
});


export default rootRoutes;