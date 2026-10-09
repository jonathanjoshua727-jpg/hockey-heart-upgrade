import { useState, useEffect, useCallback } from "react";
import {
  logActivity,
  type PaymentSettings,
} from "@/lib/contentStore";
import {
  Save,
  ShieldAlert,
  Bitcoin,
  Wallet,
} from "lucide-react";
import {
  fetchAdminPaymentSettings,
  saveAdminPaymentSettings,
} from "@/lib/donationApi";

const EMPTY_PAYMENT_SETTINGS: PaymentSettings = {
  paystackPublicKey: "",
  paystackEnabled: false,

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

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizePaymentSettings(value: unknown): PaymentSettings {
  const source =
    value && typeof value === "object"
      ? (value as Partial<PaymentSettings>)
      : {};

  const wallets = source.cryptoWallets ?? EMPTY_PAYMENT_SETTINGS.cryptoWallets;
  const bankDetails = source.bankDetails ?? EMPTY_PAYMENT_SETTINGS.bankDetails;

  return {
    paystackPublicKey: asString(
      source.paystackPublicKey,
    ),

    paystackEnabled: asBoolean(
      source.paystackEnabled,
      false,
    ),

    cardEnabled: asBoolean(
      source.cardEnabled,
      EMPTY_PAYMENT_SETTINGS.cardEnabled,
    ),

    bankTransferEnabled: asBoolean(
      source.bankTransferEnabled,
      EMPTY_PAYMENT_SETTINGS.bankTransferEnabled,
    ),

    bankTransferProviderName: asString(
      source.bankTransferProviderName,
      EMPTY_PAYMENT_SETTINGS.bankTransferProviderName,
    ),

    cryptoEnabled: asBoolean(
      source.cryptoEnabled,
      EMPTY_PAYMENT_SETTINGS.cryptoEnabled,
    ),

    cryptoWallets: {
      bitcoin: asString(wallets.bitcoin),
      ethereum: asString(wallets.ethereum),
      usdtTrc20: asString(wallets.usdtTrc20),
      usdtErc20: asString(wallets.usdtErc20),
      solana: asString(wallets.solana),
    },

    bankDetails: {
      bankName: asString(bankDetails.bankName),
      accountName: asString(bankDetails.accountName),
      accountNumber: asString(bankDetails.accountNumber),
      routingNumber: asString(bankDetails.routingNumber),
      swiftCode: asString(bankDetails.swiftCode),
      instructions: asString(bankDetails.instructions),
    },
  };
}

export function PaymentSection() {
  const [settings, setSettings] =
    useState<PaymentSettings>(
      EMPTY_PAYMENT_SETTINGS,
    );

  const [loading, setLoading] = useState(true);
  const [serverSettingsLoaded, setServerSettingsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const serverSettings = await fetchAdminPaymentSettings();
      setSettings(normalizePaymentSettings(serverSettings));
      setServerSettingsLoaded(true);
    } catch (error) {
      console.error(
        "Payment settings: failed to load server settings",
        error,
      );
      setLoadError(
        error instanceof Error
          ? `Could not load server payment settings: ${error.message}`
          : "Could not load server payment settings.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleSave() {
    setSaving(true);
    setSaveError("");

    try {
      const normalized =
        normalizePaymentSettings(settings);

      const savedSettings =
        await saveAdminPaymentSettings(
          normalized,
        );

      setSettings(
        normalizePaymentSettings(
          savedSettings,
        ),
      );

      logActivity(
        "SAVE",
        "Payments",
        "Payment gateway and payment settings updated",
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save payment settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  function update(
    patch: Partial<PaymentSettings>,
  ) {
    setSettings((current) => ({
      ...current,
      ...patch,
    }));
  }

  function updateWallet(
    key: keyof PaymentSettings["cryptoWallets"],
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      cryptoWallets: {
        ...current.cryptoWallets,
        [key]: value,
      },
    }));
  }

  function updateBankDetail(
    key: keyof PaymentSettings["bankDetails"],
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      bankDetails: {
        ...current.bankDetails,
        [key]: value,
      },
    }));
  }

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]";

  if (loading || !serverSettingsLoaded) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          Payment Management
        </h2>
        {loading ? (
          <p className="text-sm text-gray-600">
            Loading confirmed server payment settings…
          </p>
        ) : (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>
              {loadError ||
                "Server payment settings could not be loaded. Local defaults are not confirmed settings and cannot be saved."}
            </p>
            <button
              type="button"
              onClick={() => void loadSettings()}
              className="mt-3 rounded-lg border border-red-300 px-4 py-2 font-semibold hover:bg-red-100"
            >
              Retry loading settings
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Payment Management
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Configure the payment methods and details shown to donors.
        </p>
      </div>

      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />

        <div className="text-sm text-amber-800">
          <strong>Security note:</strong>{" "}
          Flutterwave credentials are managed as server-side Netlify
          environment variables and are never entered or displayed here.
        </div>
      </div>

      {/* PAYMENT METHODS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">
          Payment Methods
        </h3>

        <div className="space-y-4">
          {([
            {
              key: "cardEnabled",
              label: "Credit / Debit Card",
              desc: "Card payments processed through the active secure gateway.",
            },
            {
              key: "bankTransferEnabled",
              label: "Bank Transfer",
              desc: "Show bank transfer options supported by the configured payment setup.",
            },
            {
              key: "cryptoEnabled",
              label: "Cryptocurrency",
              desc: "Show configured cryptocurrency wallet addresses to donors.",
            },
          ] as const).map(
            ({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {label}
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    {desc}
                  </p>
                </div>

                <button
                  type="button"
                  aria-pressed={settings[key]}
                  onClick={() =>
                    update({
                      [key]: !settings[key],
                    })
                  }
                  className={`mt-0.5 shrink-0 w-10 h-6 rounded-full transition-colors cursor-pointer ${
                    settings[key]
                      ? "bg-[#0a1f44]"
                      : "bg-gray-200"
                  } relative`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      settings[key]
                        ? "translate-x-5"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ),
          )}
        </div>
      </div>

      {/* BANK TRANSFER */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>

          <div>
            <h3 className="font-bold text-gray-900">
              Bank Transfer Provider Profile
            </h3>

            <p className="text-xs text-gray-500 mt-0.5">
              Display information for bank transfer
              donations.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Changing this display profile does not connect
          a new payment gateway.
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Provider / bank display name
          </label>

          <input
            value={
              settings.bankTransferProviderName
            }
            onChange={(event) =>
              update({
                bankTransferProviderName:
                  event.target.value,
              })
            }
            placeholder="e.g. Flutterwave"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            {
              key: "bankName",
              label: "Bank Name",
              placeholder: "e.g. Chase Bank",
            },
            {
              key: "accountName",
              label: "Account Name",
              placeholder:
                "Hockey Heart Initiative",
            },
            {
              key: "accountNumber",
              label: "Account Number",
              placeholder:
                "XXXXXXXXXXXX",
            },
            {
              key: "routingNumber",
              label: "Routing Number (ABA)",
              placeholder: "XXXXXXXXX",
            },
            {
              key: "swiftCode",
              label: "SWIFT / BIC Code",
              placeholder:
                "e.g. CHASUS33",
            },
          ] as const).map(
            ({
              key,
              label,
              placeholder,
            }) => (
              <div
                key={key}
                className="space-y-1.5"
              >
                <label className="text-sm font-medium text-gray-700">
                  {label}
                </label>

                <input
                  value={
                    settings.bankDetails[key]
                  }
                  onChange={(event) =>
                    updateBankDetail(
                      key,
                      event.target.value,
                    )
                  }
                  placeholder={placeholder}
                  className={inputCls}
                />
              </div>
            ),
          )}

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Transfer instructions
            </label>

            <textarea
              value={
                settings.bankDetails.instructions
              }
              onChange={(event) =>
                updateBankDetail(
                  "instructions",
                  event.target.value,
                )
              }
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Include the donor's name and email as the payment reference..."
            />
          </div>
        </div>
      </div>

      {/* CRYPTO */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <Bitcoin className="w-4 h-4 text-orange-500" />
          </div>

          <h3 className="font-bold text-gray-900">
            Cryptocurrency Wallet Addresses
          </h3>
        </div>

        <p className="text-sm text-gray-500">
          Enter receiving wallet addresses. Leave a
          currency blank to show "Coming Soon".
        </p>

        <div className="space-y-4">
          {([
            {
              key: "bitcoin",
              label: "Bitcoin (BTC)",
              placeholder: "bc1q…",
            },
            {
              key: "ethereum",
              label: "Ethereum (ETH)",
              placeholder: "0x…",
            },
            {
              key: "usdtTrc20",
              label: "USDT (TRC20 — Tron)",
              placeholder: "T…",
            },
            {
              key: "usdtErc20",
              label:
                "USDT (ERC20 — Ethereum)",
              placeholder: "0x…",
            },
            {
              key: "solana",
              label: "Solana (SOL)",
              placeholder: "…",
            },
          ] as const).map(
            ({
              key,
              label,
              placeholder,
            }) => (
              <div
                key={key}
                className="space-y-1.5"
              >
                <label className="text-sm font-medium text-gray-700">
                  {label}
                </label>

                <input
                  value={
                    settings.cryptoWallets[key]
                  }
                  onChange={(event) =>
                    updateWallet(
                      key,
                      event.target.value,
                    )
                  }
                  placeholder={`${placeholder} (leave blank for Coming Soon)`}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
                />
              </div>
            ),
          )}
        </div>
      </div>

      {/* SAVE */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || loading || !serverSettingsLoaded}
          className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0a1f44]/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />

          {saving
            ? "Saving…"
            : "Save Payment Settings"}
        </button>

        {saved && (
          <span className="text-green-600 text-sm font-medium">
            ✓ Settings saved successfully
          </span>
        )}
      </div>
    </div>
  );
}