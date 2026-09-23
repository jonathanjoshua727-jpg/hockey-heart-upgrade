import { db, paymentSettingsTable, type PaymentSetting } from "@workspace/db";

export interface PublicPaymentSettings {
  cardEnabled: boolean;
  bankTransferEnabled: boolean;
  bankTransferProviderName: string;
  cryptoEnabled: boolean;
  cryptoWallets: {
    bitcoin: string;
    ethereum: string;
    usdtTrc20: string;
    usdtErc20: string;
    solana: string;
  };
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode: string;
    instructions: string;
  };
}

const EMAIL_DONATION_LABEL = "Email donation request";

export const DEFAULT_PAYMENT_SETTINGS: PublicPaymentSettings = {
  // Card and bank requests are handled by email until an administrator
  // configures a real payment provider. They must not invoke a missing gateway.
  cardEnabled: true,
  bankTransferEnabled: true,
  bankTransferProviderName: EMAIL_DONATION_LABEL,
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
    accountName: "Hockey Heart Initiative",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    instructions: "",
  },
};

const BANK_PROFILE_PREFIX = "hhi-provider-profile:v1:";

function decodeBankProfile(rawBankName: string | null | undefined): {
  providerName: string;
  bankName: string;
} {
  if (!rawBankName?.startsWith(BANK_PROFILE_PREFIX)) {
    return { providerName: EMAIL_DONATION_LABEL, bankName: "" };
  }

  try {
    const parsed = JSON.parse(rawBankName.slice(BANK_PROFILE_PREFIX.length)) as {
      providerName?: unknown;
      bankName?: unknown;
    };
    if (
      typeof parsed.providerName === "string" &&
      parsed.providerName.trim() &&
      typeof parsed.bankName === "string"
    ) {
      return { providerName: parsed.providerName, bankName: parsed.bankName };
    }
  } catch {
    // Treat malformed provider metadata as the email-request fallback.
  }

  return { providerName: EMAIL_DONATION_LABEL, bankName: "" };
}

function encodeBankProfile(providerName: string): string {
  return `${BANK_PROFILE_PREFIX}${JSON.stringify({
    providerName: providerName.trim() || EMAIL_DONATION_LABEL,
    bankName: "",
  })}`;
}

function toPublic(row: PaymentSetting): PublicPaymentSettings {
  const bankProfile = decodeBankProfile(row.bankName);
  return {
    cardEnabled: row.cardEnabled,
    bankTransferEnabled: row.bankTransferEnabled,
    bankTransferProviderName: bankProfile.providerName,
    cryptoEnabled: row.cryptoEnabled,
    cryptoWallets: {
      bitcoin: row.bitcoinWallet,
      ethereum: row.ethereumWallet,
      usdtTrc20: row.usdtTrc20Wallet,
      usdtErc20: row.usdtErc20Wallet,
      solana: row.solanaWallet,
    },
    // Never expose bank credentials or instructions through the public API.
    bankDetails: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
      instructions: "",
    },
  };
}

export async function getPaymentSettings(): Promise<PublicPaymentSettings> {
  const [row] = await db.select().from(paymentSettingsTable).limit(1);
  return row ? toPublic(row) : DEFAULT_PAYMENT_SETTINGS;
}

export async function savePaymentSettings(
  settings: PublicPaymentSettings,
): Promise<PublicPaymentSettings> {
  const now = new Date();
  const values = {
    id: 1,
    cardEnabled: settings.cardEnabled,
    bankTransferEnabled: settings.bankTransferEnabled,
    cryptoEnabled: settings.cryptoEnabled,
    bitcoinWallet: settings.cryptoWallets.bitcoin,
    ethereumWallet: settings.cryptoWallets.ethereum,
    usdtTrc20Wallet: settings.cryptoWallets.usdtTrc20,
    usdtErc20Wallet: settings.cryptoWallets.usdtErc20,
    solanaWallet: settings.cryptoWallets.solana,
    bankName: encodeBankProfile(settings.bankTransferProviderName),
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    bankInstructions: "",
    updatedAt: now,
  };
  const [row] = await db
    .insert(paymentSettingsTable)
    .values(values)
    .onConflictDoUpdate({
      target: paymentSettingsTable.id,
      set: values,
    })
    .returning();
  return toPublic(row);
}
