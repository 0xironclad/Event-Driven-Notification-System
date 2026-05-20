import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";

const router: Router = Router();

const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get("/notifications", asyncHandler(NotificationController.getRecent));

export default router;
