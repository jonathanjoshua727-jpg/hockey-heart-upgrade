import assert from "node:assert/strict";
import test from "node:test";
import { paymentSettingsSchema } from "./paymentSettingsSchema.ts";

const emptySettings = {
  cardEnabled: true,
  bankTransferEnabled: false,
  bankTransferProviderName: "Flutterwave",
  cryptoEnabled: false,
  cryptoWallets: {
    bitcoin: "",
    ethereum: "",
    usdtTrc20: "",
    usdtErc20: "",
    solana: "",
  },
  bankDetails: {
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    instructions: "",
  },
};

test("accepts settings before provider credentials or bank details are entered", () => {
  assert.deepEqual(
    paymentSettingsSchema.safeParse(emptySettings).success,
    true,
  );
});

test("rejects malformed settings instead of silently defaulting fields", () => {
  const invalid = paymentSettingsSchema.safeParse({
    ...emptySettings,
    cryptoWallets: { bitcoin: "" },
  });

  assert.equal(invalid.success, false);
});
