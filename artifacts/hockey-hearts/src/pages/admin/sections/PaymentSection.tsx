import { useState, useEffect } from "react";
import {
  getPaymentSettings,
  logActivity,
  type PaymentSettings,
} from "@/lib/contentStore";
import { Save, ShieldAlert, Bitcoin, Wallet, CreditCard } from "lucide-react";
import {
  fetchAdminPaymentSettings,
  saveAdminPaymentSettings,
} from "@/lib/donationApi";

const EMPTY_PAYMENT_SETTINGS: PaymentSettings = {
  activeProvider: null,

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

function normalizeActiveProvider(
  value: unknown,
): PaymentSettings["activeProvider"] {
  if (value === "flutterwave" || value === "paystack") {
    return value;
  }

  return null;
}

function normalizePaymentSettings(value: unknown): PaymentSettings {
  const source =
    value && typeof value === "object"
      ? (value as Partial<PaymentSettings>)
      : {};

  const wallets =
    source.cryptoWallets && typeof source.cryptoWallets === "object"
      ? source.cryptoWallets
      : {};

  const bankDetails =
    source.bankDetails && typeof source.bankDetails === "object"
      ? source.bankDetails
      : {};

  return {
    activeProvider: normalizeActiveProvider(source.activeProvider),

    paystackPublicKey: asString(source.paystackPublicKey),
    paystackEnabled: asBoolean(source.paystackEnabled, false),

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
  const [settings, setSettings] = useState<PaymentSettings>(
    EMPTY_PAYMENT_SETTINGS,
  );

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      setLoading(true);
      setSaveError("");

      let localSettings: PaymentSettings;

      try {
        localSettings = normalizePaymentSettings(getPaymentSettings());
      } catch (error) {
        console.error(
          "Payment settings: failed to load local settings",
          error,
        );

        localSettings = EMPTY_PAYMENT_SETTINGS;
      }

      if (mounted) {
        setSettings(localSettings);
      }

      try {
        const serverSettings = await fetchAdminPaymentSettings();

        if (mounted) {
          setSettings(normalizePaymentSettings(serverSettings));
        }
      } catch (error) {
        console.error(
          "Payment settings: failed to load server settings",
          error,
        );

        if (mounted) {
          setSaveError(
            error instanceof Error
              ? `Could not load server payment settings: ${error.message}`
              : "Could not load server payment settings.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveError("");

    try {
      const normalized = normalizePaymentSettings(settings);

      const savedSettings = await saveAdminPaymentSettings(normalized);

      setSettings(normalizePaymentSettings(savedSettings));

      logActivity(
        "SAVE",
        "Payments",
        "Payment settings updated",
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Could not save payment settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  function update(patch: Partial<PaymentSettings>) {
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

  const gatewayLabel =
    settings.activeProvider === "flutterwave"
      ? "Flutterwave"
      : settings.activeProvider === "paystack"
        ? "Paystack"
        : "No gateway configured";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Payment Management
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Configure payment methods and choose the active payment gateway.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Loading payment settings…
        </div>
      )}

      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />

        <div className="text-sm text-amber-800">
          <strong>Security note:</strong> Payment gateway API keys are stored
          server-side in encrypted environment variables. Never place or expose
          secret gateway keys in the website or browser.
        </div>
      </div>

      {/* PAYMENT GATEWAY */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>

          <div>
            <h3 className="font-bold text-gray-900">
              Payment Gateway
            </h3>

            <p className="text-xs text-gray-500 mt-0.5">
              Choose which configured gateway will process online donations.
            </p>
          </div>
        </div>

        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            settings.activeProvider
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <strong>Current gateway:</strong> {gatewayLabel}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="active-payment-provider"
            className="text-sm font-medium text-gray-700"
          >
            Active payment provider
          </label>

          <select
            id="active-payment-provider"
            value={settings.activeProvider ?? ""}
            onChange={(event) => {
              const value = event.target.value;

              update({
                activeProvider:
                  value === "flutterwave" || value === "paystack"
                    ? value
                    : null,
              });
            }}
            className={inputCls}
          >
            <option value="">No gateway configured</option>
            <option value="flutterwave">Flutterwave</option>
            <option value="paystack">Paystack</option>
          </select>

          <p className="text-xs text-gray-500">
            No gateway is selected by default. The administrator must
            explicitly choose a provider before online donations can be
            processed.
          </p>
        </div>

        {!settings.activeProvider && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>No payment gateway is active.</strong> Donation checkout
            must remain unavailable until an administrator selects a payment
            provider.
          </div>
        )}

        {settings.activeProvider === "flutterwave" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <strong>Flutterwave selected.</strong> The server must have the
            required Flutterwave credentials configured before donations can be
            processed.
          </div>
        )}

        {settings.activeProvider === "paystack" && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <strong>Paystack selected.</strong> The server must have the
            required Paystack credentials configured before donations can be
            processed.
          </div>
        )}

        <div className="rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-500">
          The gateway selection controls which server-side payment integration
          is used. Gateway secret keys are never sent to donors or stored in
          frontend code.
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
              desc: "Card payments processed through the active secure hosted gateway.",
            },
            {
              key: "bankTransferEnabled",
              label: "Bank Transfer",
              desc: "Show bank transfer instructions when supported by the active payment configuration.",
            },
            {
              key: "cryptoEnabled",
              label: "Cryptocurrency",
              desc: "Show configured cryptocurrency wallet addresses to donors.",
            },
          ] as const).map(({ key, label, desc }) => (
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
          ))}
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
              The provider name is shown to donors when bank transfer is
              enabled.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Changing this profile does not connect a new payment gateway. A new
          provider still requires a secure server-side integration,
          credentials, webhooks, and payment verification before it can process
          donations.
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Provider / bank display name
          </label>

          <input
            value={settings.bankTransferProviderName}
            onChange={(event) =>
              update({
                bankTransferProviderName: event.target.value,
              })
            }
            placeholder="e.g. Flutterwave"
            className={inputCls}
          />

          <p className="text-xs text-gray-500">
            This is a display label and does not change the active gateway.
          </p>
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
              placeholder: "Hockey Heart Initiative",
            },
            {
              key: "accountNumber",
              label: "Account Number",
              placeholder: "XXXXXXXXXXXX",
            },
            {
              key: "routingNumber",
              label: "Routing Number (ABA)",
              placeholder: "XXXXXXXXX",
            },
            {
              key: "swiftCode",
              label: "SWIFT / BIC Code",
              placeholder: "e.g. CHASUS33",
            },
          ] as const).map(({ key, label, placeholder }) => (
            <div
              key={key}
              className="space-y-1.5"
            >
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>

              <input
                value={settings.bankDetails[key]}
                onChange={(event) =>
                  updateBankDetail(key, event.target.value)
                }
                placeholder={placeholder}
                className={inputCls}
              />
            </div>
          ))}

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Transfer instructions
            </label>

            <textarea
              value={settings.bankDetails.instructions}
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

            <p className="text-xs text-gray-500">
              Account details and instructions remain admin-only while bank
              transfer uses hosted checkout.
            </p>
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
          Enter your receiving wallet addresses below. These will be displayed
          to donors who choose cryptocurrency as their payment method.
          Leave blank to show "Coming Soon" for that currency.
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
              label: "USDT (ERC20 — Ethereum)",
              placeholder: "0x…",
            },
            {
              key: "solana",
              label: "Solana (SOL)",
              placeholder: "…",
            },
          ] as const).map(({ key, label, placeholder }) => (
            <div
              key={key}
              className="space-y-1.5"
            >
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>

              <input
                value={settings.cryptoWallets[key]}
                onChange={(event) =>
                  updateWallet(key, event.target.value)
                }
                placeholder={`${placeholder} (leave blank for Coming Soon)`}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* SAVE */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || loading}
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