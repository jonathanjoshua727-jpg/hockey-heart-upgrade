import { useState, useEffect } from "react";
import {
  getPaymentSettings,
  logActivity,
  type PaymentSettings,
} from "@/lib/contentStore";
import {
  Save,
  ShieldAlert,
  Bitcoin,
  Wallet,
  CreditCard,
  Plus,
  Trash2,
} from "lucide-react";
import {
  fetchAdminPaymentSettings,
  saveAdminPaymentSettings,
} from "@/lib/donationApi";

type PaymentGateway = {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  configured: boolean;
};

const EMPTY_PAYMENT_SETTINGS: PaymentSettings = {
  activeProvider: null,

  paymentGateways: [
    {
      id: "flutterwave",
      name: "Flutterwave",
      type: "flutterwave",
      enabled: false,
      configured: false,
    },
    {
      id: "paystack",
      name: "Paystack",
      type: "paystack",
      enabled: false,
      configured: false,
    },
  ],

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

function normalizeGateways(value: unknown): PaymentGateway[] {
  if (!Array.isArray(value)) {
    return EMPTY_PAYMENT_SETTINGS.paymentGateways;
  }

  return value
    .filter(
      (gateway) =>
        gateway &&
        typeof gateway === "object" &&
        typeof (gateway as PaymentGateway).id === "string",
    )
    .map((gateway) => {
      const item = gateway as Partial<PaymentGateway>;

      return {
        id: asString(item.id),
        name: asString(item.name, "Unnamed Gateway"),
        type: asString(item.type, "custom"),
        enabled: asBoolean(item.enabled, false),
        configured: asBoolean(item.configured, false),
      };
    });
}

function normalizeActiveProvider(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value
    : null;
}

function normalizePaymentSettings(value: unknown): PaymentSettings {
  const source =
    value && typeof value === "object"
      ? (value as Partial<PaymentSettings>)
      : {};

  const wallets =
    source.cryptoWallets &&
    typeof source.cryptoWallets === "object"
      ? source.cryptoWallets
      : {};

  const bankDetails =
    source.bankDetails &&
    typeof source.bankDetails === "object"
      ? source.bankDetails
      : {};

  return {
    activeProvider: normalizeActiveProvider(
      source.activeProvider,
    ),

    paymentGateways: normalizeGateways(
      source.paymentGateways,
    ),

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
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const [newGatewayName, setNewGatewayName] =
    useState("");

  const [showAddGateway, setShowAddGateway] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      setLoading(true);
      setSaveError("");

      let localSettings: PaymentSettings;

      try {
        localSettings = normalizePaymentSettings(
          getPaymentSettings(),
        );
      } catch (error) {
        console.error(
          "Payment settings: failed to load local settings",
          error,
        );

        localSettings =
          EMPTY_PAYMENT_SETTINGS;
      }

      if (mounted) {
        setSettings(localSettings);
      }

      try {
        const serverSettings =
          await fetchAdminPaymentSettings();

        if (mounted) {
          setSettings(
            normalizePaymentSettings(
              serverSettings,
            ),
          );
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

  function addGateway() {
    const name = newGatewayName.trim();

    if (!name) {
      return;
    }

    const id = `${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now()}`;

    const newGateway: PaymentGateway = {
      id,
      name,
      type: "custom",
      enabled: false,
      configured: false,
    };

    setSettings((current) => ({
      ...current,
      paymentGateways: [
        ...current.paymentGateways,
        newGateway,
      ],
    }));

    setNewGatewayName("");
    setShowAddGateway(false);
  }

  function removeGateway(id: string) {
    const gateway = settings.paymentGateways.find(
      (item) => item.id === id,
    );

    if (!gateway) {
      return;
    }

    // Built-in gateways remain available.
    if (
      gateway.type === "flutterwave" ||
      gateway.type === "paystack"
    ) {
      return;
    }

    setSettings((current) => ({
      ...current,
      activeProvider:
        current.activeProvider === id
          ? null
          : current.activeProvider,

      paymentGateways:
        current.paymentGateways.filter(
          (item) => item.id !== id,
        ),
    }));
  }

  function toggleGateway(id: string) {
    setSettings((current) => ({
      ...current,
      paymentGateways:
        current.paymentGateways.map((gateway) =>
          gateway.id === id
            ? {
                ...gateway,
                enabled: !gateway.enabled,
              }
            : gateway,
        ),
    }));
  }

  function selectActiveGateway(
    id: string,
  ) {
    if (!id) {
      update({
        activeProvider: null,
      });

      return;
    }

    const gateway =
      settings.paymentGateways.find(
        (item) => item.id === id,
      );

    if (!gateway) {
      return;
    }

    update({
      activeProvider: gateway.id,
    });
  }

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]";

  const activeGateway =
    settings.paymentGateways.find(
      (gateway) =>
        gateway.id === settings.activeProvider,
    );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Payment Management
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Configure payment methods and manage
          payment gateways.
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
          <strong>Security note:</strong>{" "}
          Payment gateway secret/API keys must remain
          server-side. Never put secret credentials in
          frontend code or expose them to donors.
        </div>
      </div>

      {/* PAYMENT GATEWAYS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>

          <div>
            <h3 className="font-bold text-gray-900">
              Payment Gateway
            </h3>

            <p className="text-xs text-gray-500 mt-0.5">
              Choose the gateway that processes online
              donations. You can add additional gateways
              when needed.
            </p>
          </div>
        </div>

        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            activeGateway
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <strong>Current active gateway:</strong>{" "}
          {activeGateway
            ? activeGateway.name
            : "No gateway configured"}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="active-payment-provider"
            className="text-sm font-medium text-gray-700"
          >
            Active payment gateway
          </label>

          <select
            id="active-payment-provider"
            value={settings.activeProvider ?? ""}
            onChange={(event) =>
              selectActiveGateway(
                event.target.value,
              )
            }
            className={inputCls}
          >
            <option value="">
              No gateway configured
            </option>

            {settings.paymentGateways.map(
              (gateway) => (
                <option
                  key={gateway.id}
                  value={gateway.id}
                  disabled={!gateway.enabled}
                >
                  {gateway.name}
                  {!gateway.enabled
                    ? " (disabled)"
                    : ""}
                </option>
              ),
            )}
          </select>

          <p className="text-xs text-gray-500">
            Selecting a gateway does not create its API
            integration. The selected gateway must have
            a working server-side integration and
            credentials before donations can be processed.
          </p>
        </div>

        {/* GATEWAY LIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">
              Available Gateways
            </h4>

            <button
              type="button"
              onClick={() =>
                setShowAddGateway(
                  (current) => !current,
                )
              }
              className="flex items-center gap-2 text-sm font-semibold text-[#0a1f44] hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add Payment Gateway
            </button>
          </div>

          {showAddGateway && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Gateway name
                </label>

                <input
                  value={newGatewayName}
                  onChange={(event) =>
                    setNewGatewayName(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Airwallex"
                  className={`${inputCls} mt-1.5`}
                />
              </div>

              <p className="text-xs text-gray-600">
                This adds the gateway to the Admin
                Dashboard. It does not automatically create
                the server-side API integration.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addGateway}
                  disabled={
                    !newGatewayName.trim()
                  }
                  className="px-4 py-2 rounded-lg bg-[#0a1f44] text-white text-sm font-semibold disabled:opacity-50"
                >
                  Add Gateway
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddGateway(false);
                    setNewGatewayName("");
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {settings.paymentGateways.map(
              (gateway) => (
                <div
                  key={gateway.id}
                  className="flex items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {gateway.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {gateway.configured
                        ? "Server integration configured"
                        : "Server integration not configured"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-pressed={
                        gateway.enabled
                      }
                      onClick={() =>
                        toggleGateway(
                          gateway.id,
                        )
                      }
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        gateway.enabled
                          ? "bg-[#0a1f44]"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          gateway.enabled
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      />
                    </button>

                    {gateway.type ===
                      "custom" && (
                      <button
                        type="button"
                        title="Remove gateway"
                        onClick={() =>
                          removeGateway(
                            gateway.id,
                          )
                        }
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {!settings.activeProvider && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>No payment gateway is active.</strong>{" "}
            Online donation checkout must remain unavailable
            until an administrator selects and configures a
            payment gateway.
          </div>
        )}
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