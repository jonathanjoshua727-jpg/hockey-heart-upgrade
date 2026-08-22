import { useState, useEffect } from "react";
import { getPaymentSettings, logActivity, type PaymentSettings } from "@/lib/contentStore";
import { Save, Eye, EyeOff, ShieldAlert, Bitcoin, Wallet } from "lucide-react";
import {
  fetchAdminPaymentSettings,
  saveAdminPaymentSettings,
} from "@/lib/donationApi";

export function PaymentSection() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(getPaymentSettings());
    fetchAdminPaymentSettings()
      .then((serverSettings) => {
        setSettings(serverSettings);
      })
      .catch(() => setSaveError("Could not load server payment settings."));
  }, []);

  if (!settings) return null;

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaveError("");
    try {
      const savedSettings = await saveAdminPaymentSettings(settings);
      setSettings(savedSettings);
      logActivity("SAVE", "Payments", "Payment settings updated");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError((err as Error).message || "Could not save payment settings.");
    } finally {
      setSaving(false);
    }
  }

  function update(patch: Partial<PaymentSettings>) {
    setSettings((v) => v && { ...v, ...patch });
  }

  function updateWallet(key: keyof PaymentSettings["cryptoWallets"], value: string) {
    setSettings((v) =>
      v && { ...v, cryptoWallets: { ...v.cryptoWallets, [key]: value } }
    );
  }

  function updateBankDetail(
    key: keyof PaymentSettings["bankDetails"],
    value: string,
  ) {
    setSettings((current) =>
      current && {
        ...current,
        bankDetails: { ...current.bankDetails, [key]: value },
      },
    );
  }

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Payment Management</h2>
        <p className="text-gray-500 text-sm mt-1">Configure payment methods and cryptocurrency wallet addresses.</p>
      </div>

      {/* Security notice */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Security note:</strong> Payment gateway API keys are stored server-side in
          encrypted environment variables (Replit Secrets) — never in the website or browser.
          Never share or expose your payment gateway secret key publicly.
        </div>
      </div>

      {/* Payment methods */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Payment Methods</h3>
        <div className="space-y-4">
          {([
            { key: "bankTransferEnabled", label: "Bank Transfer", desc: "Secure hosted checkout showing the transfer options available in the donor's region" },
            { key: "cardEnabled", label: "Credit / Debit Card", desc: "Card payments processed through the secure hosted checkout" },
            { key: "cryptoEnabled", label: "Cryptocurrency", desc: "Show crypto wallet addresses to donors" },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <div
                onClick={() => update({ [key]: !settings[key] })}
                className={`mt-0.5 shrink-0 w-10 h-6 rounded-full transition-colors cursor-pointer ${
                  settings[key] ? "bg-[#0a1f44]" : "bg-gray-200"
                } relative`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    settings[key] ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank transfer provider profile */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Bank Transfer Provider Profile</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              The provider name is shown to donors when bank transfer is enabled.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Changing this profile does not connect a new payment gateway. A new provider still
          requires a secure server-side integration, credentials, webhooks, and payment
          verification before you enable bank transfer.
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Provider / bank display name
          </label>
          <input
            value={settings.bankTransferProviderName}
            onChange={(event) =>
              update({ bankTransferProviderName: event.target.value })
            }
            placeholder="e.g. Flutterwave"
            className={inputCls}
          />
          <p className="text-xs text-gray-500">
            This name must match the gateway currently connected by the server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { key: "bankName", label: "Bank Name", placeholder: "e.g. Chase Bank" },
            { key: "accountName", label: "Account Name", placeholder: "Hockey Heart Initiative" },
            { key: "accountNumber", label: "Account Number", placeholder: "XXXXXXXXXXXX" },
            { key: "routingNumber", label: "Routing Number (ABA)", placeholder: "XXXXXXXXX" },
            { key: "swiftCode", label: "SWIFT / BIC Code", placeholder: "e.g. CHASUS33" },
          ] as const).map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input
                value={settings.bankDetails[key]}
                onChange={(event) => updateBankDetail(key, event.target.value)}
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
                updateBankDetail("instructions", event.target.value)
              }
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Include the donor's name and email as the payment reference..."
            />
            <p className="text-xs text-gray-500">
              Account details and instructions remain admin-only while bank transfer uses
              hosted checkout.
            </p>
          </div>
        </div>
      </div>

      {/* Payment gateway */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900">Payment Gateway</h3>
        </div>
        <p className="text-xs text-gray-500 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50">
          For security, payment gateway API keys are never stored in the website. They are
          configured server-side in the environment (Replit Secrets) by the administrator.
          Donations are processed in USD through a secure hosted checkout, and every payment
          is verified server-side before it is recorded as successful.
        </p>
      </div>

      {/* Crypto wallets */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <Bitcoin className="w-4 h-4 text-orange-500" />
          </div>
          <h3 className="font-bold text-gray-900">Cryptocurrency Wallet Addresses</h3>
        </div>
        <p className="text-sm text-gray-500">
          Enter your receiving wallet addresses below. These will be displayed to donors who choose cryptocurrency as their payment method.
          Leave blank to show "Coming Soon" for that currency.
        </p>

        <div className="space-y-4">
          {([
            { key: "bitcoin", label: "Bitcoin (BTC)", placeholder: "bc1q…" },
            { key: "ethereum", label: "Ethereum (ETH)", placeholder: "0x…" },
            { key: "usdtTrc20", label: "USDT (TRC20 — Tron)", placeholder: "T…" },
            { key: "usdtErc20", label: "USDT (ERC20 — Ethereum)", placeholder: "0x…" },
            { key: "solana", label: "Solana (SOL)", placeholder: "…" },
          ] as const).map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input
                value={settings.cryptoWallets[key]}
                onChange={(e) => updateWallet(key, e.target.value)}
                placeholder={`${placeholder} (leave blank for Coming Soon)`}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0a1f44]/90 transition-colors"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Payment Settings"}
        </button>
        {saved && (
          <span className="text-green-600 text-sm font-medium">✓ Settings saved successfully</span>
        )}
        {saveError && <span className="text-red-600 text-sm">{saveError}</span>}
      </div>
    </div>
  );
}
