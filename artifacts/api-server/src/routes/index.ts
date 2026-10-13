import { Router, type IRouter } from "express";
import healthRouter from "./health";
import donationsRouter from "./donations";
import webhookRouter from "./webhook";
import adminRouter from "./admin";
import paymentSettingsRouter from "./paymentSettings";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(donationsRouter);
router.use(webhookRouter);
router.use(adminRouter);
router.use(paymentSettingsRouter);
router.use(contactRouter);

export default router;
