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

export const DEFAULT_PAYMENT_SETTINGS: PublicPaymentSettings = {
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
    accountName: "Hockey Heart Initiative",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    instructions:
      "Please include your full name and email address as the payment reference so we can match your donation.",
  },
};

const BANK_PROFILE_PREFIX = "hhi-provider-profile:v1:";

function decodeBankProfile(rawBankName: string): {
  providerName: string;
  bankName: string;
} {
  if (!rawBankName.startsWith(BANK_PROFILE_PREFIX)) {
    return {
      providerName: DEFAULT_PAYMENT_SETTINGS.bankTransferProviderName,
      bankName: rawBankName,
    };
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
      return {
        providerName: parsed.providerName,
        bankName: parsed.bankName,
      };
    }
  } catch {
    // Malformed tagged values stay private and fall back to the connected
    // provider label rather than being reflected to public donors.
  }

  return {
    providerName: DEFAULT_PAYMENT_SETTINGS.bankTransferProviderName,
    bankName: "",
  };
}

function encodeBankProfile(providerName: string, bankName: string): string {
  return `${BANK_PROFILE_PREFIX}${JSON.stringify({ providerName, bankName })}`;
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
    bankDetails: {
      bankName: bankProfile.bankName,
      accountName: row.accountName,
      accountNumber: row.accountNumber,
      routingNumber: row.routingNumber,
      swiftCode: row.swiftCode,
      instructions: row.bankInstructions,
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
    bankName: encodeBankProfile(
      settings.bankTransferProviderName,
      settings.bankDetails.bankName,
    ),
    accountName: settings.bankDetails.accountName,
    accountNumber: settings.bankDetails.accountNumber,
    routingNumber: settings.bankDetails.routingNumber,
    swiftCode: settings.bankDetails.swiftCode,
    bankInstructions: settings.bankDetails.instructions,
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