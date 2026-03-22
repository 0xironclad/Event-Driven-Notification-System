import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { env } from "./config/env";

dotenv.config();

const app: Express = express();
const PORT = env.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Event-Driven Notification System API" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
