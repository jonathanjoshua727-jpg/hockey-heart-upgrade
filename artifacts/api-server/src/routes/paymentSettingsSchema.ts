import { z } from "zod/v4";

const text = (max: number) => z.string().trim().max(max);

export const paymentSettingsSchema = z.object({
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
