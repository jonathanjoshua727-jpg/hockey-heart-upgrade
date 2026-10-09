import { Router, type IRouter } from "express";
import { requireAdmin } from "../lib/adminToken";
import { paymentSettingsSchema } from "./paymentSettingsSchema";
import {
  getPaymentSettings,
  savePaymentSettings,
} from "../lib/paymentSettings";

const router: IRouter = Router();

// Public donor-facing settings. Contains no gateway credentials or secrets.
router.get("/payment-settings", async (_req, res) => {
  const settings = await getPaymentSettings();
  res.json({
    cardEnabled: settings.cardEnabled,
    bankTransferEnabled: settings.bankTransferEnabled,
    bankTransferProviderName: settings.bankTransferProviderName,
    cryptoEnabled: settings.cryptoEnabled,
    cryptoWallets: settings.cryptoWallets,
  });
});

router.get("/admin/payment-settings", requireAdmin, async (_req, res) => {
  res.json(await getPaymentSettings());
});

router.put("/admin/payment-settings", requireAdmin, async (req, res) => {
  const parsed = paymentSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payment settings." });
    return;
  }
  res.json(await savePaymentSettings(parsed.data));
});

export default router;