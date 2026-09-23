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

const EMPTY_PROVIDER_LABEL = "No payment provider configured";

export const DEFAULT_PAYMENT_SETTINGS: PublicPaymentSettings = {
  // No card/bank gateway is connected. Keep these disabled until a provider
  // is implemented and configured server-side.
  cardEnabled: false,
  bankTransferEnabled: false,
  bankTransferProviderName: EMPTY_PROVIDER_LABEL,
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
    return { providerName: EMPTY_PROVIDER_LABEL, bankName: "" };
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
    // Treat malformed provider metadata as unconfigured.
  }

  return { providerName: EMPTY_PROVIDER_LABEL, bankName: "" };
}

function encodeBankProfile(providerName: string, bankName: string): string {
  return `${BANK_PROFILE_PREFIX}${JSON.stringify({ providerName, bankName })}`;
}

function toPublic(row: PaymentSetting): PublicPaymentSettings {
  const bankProfile = decodeBankProfile(row.bankName);
  return {
    // The previous gateway has intentionally been removed. These remain off
    // until a replacement provider is implemented server-side.
    cardEnabled: false,
    bankTransferEnabled: false,
    bankTransferProviderName: bankProfile.providerName,
    cryptoEnabled: row.cryptoEnabled,
    cryptoWallets: {
      bitcoin: row.bitcoinWallet,
      ethereum: row.ethereumWallet,
      usdtTrc20: row.usdtTrc20Wallet,
      usdtErc20: row.usdtErc20Wallet,
      solana: row.solanaWallet,
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
    // Never enable an unconfigured gateway from the admin display settings.
    cardEnabled: false,
    bankTransferEnabled: false,
    cryptoEnabled: settings.cryptoEnabled,
    bitcoinWallet: settings.cryptoWallets.bitcoin,
    ethereumWallet: settings.cryptoWallets.ethereum,
    usdtTrc20Wallet: settings.cryptoWallets.usdtTrc20,
    usdtErc20Wallet: settings.cryptoWallets.usdtErc20,
    solanaWallet: settings.cryptoWallets.solana,
    bankName: encodeBankProfile(
      settings.bankTransferProviderName || EMPTY_PROVIDER_LABEL,
      "",
    ),
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
