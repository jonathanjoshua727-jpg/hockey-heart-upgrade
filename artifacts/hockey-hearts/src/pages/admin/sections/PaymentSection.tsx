import { useState, useEffect } from "react";
import { getPaymentSettings, savePaymentSettings, logActivity, type PaymentSettings } from "@/lib/contentStore";
import { Save, Eye, EyeOff, ShieldAlert, Bitcoin, Wallet } from "lucide-react";

export function PaymentSection() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getPaymentSettings());
  }, []);

  if (!settings) return null;

  function handleSave() {
    if (!settings) return;
    savePaymentSettings(settings);
    logActivity("SAVE", "Payments", "Payment settings updated");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function update(patch: Partial<PaymentSettings>) {
    setSettings((v) => v && { ...v, ...patch });
  }

  function updateWallet(key: keyof PaymentSettings["cryptoWallets"], value: string) {
    setSettings((v) =>
      v && { ...v, cryptoWallets: { ...v.cryptoWallets, [key]: value } }
    );
  }

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
          <strong>Security note:</strong> API keys are stored in your browser's local storage for this prototype. 
          In production, all keys should be stored server-side in encrypted environment variables. 
          Never share or expose your Paystack secret key publicly.
        </div>
      </div>

      {/* Payment methods */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Payment Methods</h3>
        <div className="space-y-4">
          {([
            { key: "bankTransferEnabled", label: "Bank Transfer", desc: "Manual bank transfer instructions shown to donors" },
            { key: "cardEnabled", label: "Credit / Debit Card (via Paystack)", desc: "Card payments processed through Paystack" },
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

      {/* Paystack config */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900">Paystack Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Public Key</label>
            <input
              type="text"
              value={settings.paystackPublicKey}
              onChange={(e) => update({ paystackPublicKey: e.target.value })}
              placeholder="pk_live_xxxxxxxxxxxxxxxx"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Secret Key</label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={settings.paystackSecretKey}
                onChange={(e) => update({ paystackSecretKey: e.target.value })}
                placeholder="sk_live_xxxxxxxxxxxxxxxx"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0a1f44]/20 focus:border-[#0a1f44]"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
          <span className="text-gray-700">Paystack enabled</span>
          <div
            onClick={() => update({ paystackEnabled: !settings.paystackEnabled })}
            className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
              settings.paystackEnabled ? "bg-[#0a1f44]" : "bg-gray-200"
            } relative`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings.paystackEnabled ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </div>
        </div>

        {!settings.paystackPublicKey && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            ⚠ Paystack keys not configured. The donation form will show a "Being configured" message to donors.
          </p>
        )}
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
          className="flex items-center gap-2 bg-[#0a1f44] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0a1f44]/90 transition-colors"
        >
          <Save className="w-4 h-4" /> Save Payment Settings
        </button>
        {saved && (
          <span className="text-green-600 text-sm font-medium">✓ Settings saved successfully</span>
        )}
      </div>
    </div>
  );
}
