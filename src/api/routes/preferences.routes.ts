import { Router } from "express";
import { PreferencesController } from "../controllers/preferences.controller";

const router: Router = Router();

const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/preferences/:userId", asyncHandler(PreferencesController.getByUser));
router.post("/preferences", asyncHandler(PreferencesController.upsert));

export default router;
