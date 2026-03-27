import { Router } from "express";
import { EventController } from "../controllers/event.controller";

const router : Router = Router();

// Wrap async controller to catch errors
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/events", asyncHandler(EventController.create));

export default router;
