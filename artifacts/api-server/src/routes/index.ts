import { Router, type IRouter } from "express";
import healthRouter from "./health";
import donationsRouter from "./donations";
import webhookRouter from "./webhook";
import adminRouter from "./admin";
import paymentSettingsRouter from "./paymentSettings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(donationsRouter);
router.use(webhookRouter);
router.use(adminRouter);
router.use(paymentSettingsRouter);

export default router;
