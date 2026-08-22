import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { requireAdmin } from "../lib/adminToken";
import {
  getPaymentSettings,
  savePaymentSettings,
} from "../lib/paymentSettings";

const router: IRouter = Router();

const text = (max: number) => z.string().trim().max(max);
const paymentSettingsSchema = z.object({
  cardEnabled: z.boolean(),
  bankTransferEnabled: z.boolean(),
  bankTransferProviderName: z.string().trim().min(1).max(120),
  cryptoEnabled: z.boolean(),
  cryptoWallets: z.object({
    bitcoin: text(300),
    ethereum: text(300),
    usdtTrc20: text(300),
    usdtErc20: text(300),
    solana: text(300),
  }),
  bankDetails: z.object({
    bankName: text(200),
    accountName: text(200),
    accountNumber: text(100),
    routingNumber: text(100),
    swiftCode: text(100),
    instructions: text(1_000),
  }),
});

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