export function getPaymentSettings(): PaymentSettings {
  const stored = read<PaymentSettings & { paystackSecretKey?: string }>(KEYS.payments, DEFAULT_PAYMENT);
  const safeStored = {
    ...DEFAULT_PAYMENT,
    ...stored,
    cryptoWallets: {
      ...DEFAULT_PAYMENT.cryptoWallets,
      ...(stored?.cryptoWallets ?? {}),
    },
    bankDetails: {
      ...DEFAULT_PAYMENT.bankDetails,
      ...(stored?.bankDetails ?? {}),
    },
  };

  let changed = false;
  if (!safeStored.bankTransferProviderName) {
    safeStored.bankTransferProviderName = DEFAULT_PAYMENT.bankTransferProviderName;
    changed = true;
  }

  if ("paystackSecretKey" in safeStored) {
    delete safeStored.paystackSecretKey;
    changed = true;
  }

  if (Object.values(safeStored.bankDetails).some(Boolean)) {
    safeStored.bankDetails = { ...DEFAULT_PAYMENT.bankDetails };
    changed = true;
  }

  if (changed) {
    write(KEYS.payments, safeStored);
  }

  return safeStored;
}

export function savePaymentSettings(settings: PaymentSettings) {
  write(KEYS.payments, {
    ...DEFAULT_PAYMENT,
    ...settings,
    cryptoWallets: {
      ...DEFAULT_PAYMENT.cryptoWallets,
      ...(settings?.cryptoWallets ?? {}),
    },
    bankDetails: {
      ...DEFAULT_PAYMENT.bankDetails,
      ...(settings?.bankDetails ?? {}),
    },
  });
}
