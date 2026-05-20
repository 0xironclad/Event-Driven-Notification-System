import { Router } from "express";
import healthRoutes from "./health.routes";
import eventRoutes from "./event.routes";
import preferencesRoutes from "./preferences.routes";
import notificationRoutes from "./notification.routes";

const router: Router = Router();

// Mount routes
router.use(healthRoutes);
router.use(eventRoutes);
router.use(preferencesRoutes);
router.use(notificationRoutes);

export default router;
