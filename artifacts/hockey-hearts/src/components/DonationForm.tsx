import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  getPaymentSettings,
  getActiveDonationCauses,
  saveTransaction,
  type Transaction,
  type PaymentSettings,
} from "@/lib/contentStore";
import { CheckCircle2, Copy } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import { verifyDonation } from "@/lib/donationApi";

const PRESET_AMOUNTS = [50, 100, 250, 500];
const PENDING_KEY = "hhi_pending_donation";
const DONATION_CONTACT_EMAIL = "contact@hockeyheartinitiative.com";
interface PendingDonation {
  reference: string;
  amount: number;
  causeLabel: string;
  email: string;
  methodLabel: string;
}
type PayMethod = "bank" | "card" | "crypto";
type CryptoKey = keyof PaymentSettings["cryptoWallets"];
const CRYPTO_OPTIONS: { key: CryptoKey; label: string }[] = [
  { key: "bitcoin", label: "Bitcoin (BTC)" },
  { key: "ethereum", label: "Ethereum (ETH)" },
  { key: "usdtTrc20", label: "USDT (TRC20 – Tron)" },
  { key: "usdtErc20", label: "USDT (ERC20 – Ethereum)" },
  { key: "solana", label: "Solana (SOL)" },
];
const EMPTY_CRYPTO_WALLETS: PaymentSettings["cryptoWallets"] = {
  bitcoin: "",
  ethereum: "",
  usdtTrc20: "",
  usdtErc20: "",
  solana: "",
};
function getSafeInitialSettings(): PaymentSettings {
  try {
    const cached = getPaymentSettings();
    return {
      ...cached,
      // No hosted provider is active. Card and bank requests use email below.
      cardEnabled: true,
      bankTransferEnabled: true,
      bankTransferProviderName:
        cached.bankTransferProviderName || "Email donation request",
      cryptoEnabled: Boolean(cached.cryptoEnabled),
      cryptoWallets: {
        ...EMPTY_CRYPTO_WALLETS,
        ...(cached.cryptoWallets ?? {}),
      },
      bankDetails: {
        ...cached.bankDetails,
      },
    };
  } catch {
    return {
      paystackPublicKey: "",
      paystackEnabled: false,
      cardEnabled: true,
      bankTransferEnabled: true,
      bankTransferProviderName: "Email donation request",
      cryptoEnabled: false,
      cryptoWallets: { ...EMPTY_CRYPTO_WALLETS },
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
}
function getSafeCauses() {
  try {
    const active = getActiveDonationCauses();
    return active.length > 0
      ? active
      : [{ id: "general", label: "Where Needed Most" }];
  } catch {
    return [{ id: "general", label: "Where Needed Most" }];
  }
}
function randomRef() {
  return (
    "HHI-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(2, 8).toUpperCase()
  );
}
function safeTrackClick(page: string, action: string, source: string, target: string) {
  try {
    trackClick(page, action, source, target);
  } catch {
    // Analytics must never prevent the donation page from rendering.
  }
}

export function DonationForm() {
  const [settings] = useState<PaymentSettings>(getSafeInitialSettings);
  const causes = useMemo(() => getSafeCauses(), []);
  const [amount, setAmount] = useState<number | "custom">(50);
  const [customAmount, setCustomAmount] = useState("");
  const [cause, setCause] = useState(causes[0]?.id ?? "general");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [method, setMethod] = useState<PayMethod>("card");
  const [cryptoCoin, setCryptoCoin] = useState<CryptoKey>("bitcoin");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    reference: string;
    methodLabel: string;
    amount?: number;
    causeLabel?: string;
    email?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const finalAmount = amount === "custom" ? Number.parseFloat(customAmount || "0") : amount;
  const causeLabel = causes.find((item) => item.id === cause)?.label ?? "Where Needed Most";
  const selectedCryptoAddress = settings.cryptoWallets?.[cryptoCoin] ?? "";
  const selectedCryptoConfigured = settings.cryptoEnabled;

  useEffect(() => {
    safeTrackClick("Donation Page", "donation_page_visit", window.location.pathname, window.location.pathname);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txRef = params.get("tx_ref");
    if (!txRef) return;
    let pending: PendingDonation | null = null;
    try {
      pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? "null");
    } catch {
      pending = null;
    }
    sessionStorage.removeItem(PENDING_KEY);
    window.history.replaceState({}, "", window.location.pathname);
    setLoading(true);
    verifyDonation(txRef)
      .then((result) => {
        setLoading(false);
        if (result.verified && result.donation) {
          safeTrackClick("Donation Completed", "donation_success", "/donate", window.location.pathname);
          setSuccess({
            reference: result.donation.reference,
            methodLabel: pending?.methodLabel ?? "Secure Checkout",
            amount: result.donation.amount,
            causeLabel: result.donation.causeLabel,
            email: pending?.email,
          });
        } else {
          setError(result.error ?? "We couldn't complete your donation. Please try again.");
        }
      })
      .catch(() => {
        setLoading(false);
        setError("We couldn't verify that donation. Please contact us if you were charged.");
      });
  }, []);

  function validate(): string {
    if (!Number.isFinite(finalAmount) || finalAmount < 50) return "Minimum donation is $50 USD.";
    if (!email.trim() || !email.includes("@")) return "Please enter a valid email address.";
    if (!anonymous && !firstName.trim()) return "Please enter your first name.";
    return "";
  }

  function openDonationEmailRequest(requestedMethod: "bank_transfer" | "card") {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    const methodLabel = requestedMethod === "bank_transfer" ? "Bank Transfer" : "Credit / Debit Card";
    const donorName = anonymous ? "Anonymous" : `${firstName.trim()} ${lastName.trim()}`.trim();
    const subject = encodeURIComponent(`Donation request: ${methodLabel} - $${finalAmount.toLocaleString()} USD`);
    const body = encodeURIComponent([
      "Hello Hockey Heart Initiative,", "", "I would like to make a donation.",
      `Method: ${methodLabel}`, `Amount: $${finalAmount.toLocaleString()} USD`,
      `Cause: ${causeLabel}`, `Donor Name: ${donorName}`, `Email: ${email.trim()}`,
      `Anonymous: ${anonymous ? "Yes" : "No"}`, message.trim() ? `Message: ${message.trim()}` : "",
      "", "Please contact me to arrange payment.",
    ].join("\n"));
    window.location.assign(`mailto:${DONATION_CONTACT_EMAIL}?subject=${subject}&body=${body}`);
  }

  function recordTransaction(reference: string, payMethod: string) {
    try {
      saveTransaction({
        id: crypto.randomUUID(), date: new Date().toISOString(), amount: finalAmount,
        currency: "USD", method: payMethod, status: "pending",
        donorName: anonymous ? "Anonymous" : `${firstName.trim()} ${lastName.trim()}`.trim(),
        donorEmail: email.trim(), cause: causeLabel, reference, anonymous,
        notes: message.trim() || undefined,
      });
    } catch {
      // Local storage must not prevent the donor flow.
    }
  }

  function handleCryptoConfirm() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!selectedCryptoAddress) {
      setError("Selected cryptocurrency wallet address is not configured yet.");
      return;
    }
    const ref = randomRef();
    const coinLabel = CRYPTO_OPTIONS.find((item) => item.key === cryptoCoin)?.label ?? cryptoCoin;
    recordTransaction(ref, `crypto_${cryptoCoin}`);
    setSuccess({ reference: ref, methodLabel: `Cryptocurrency (${coinLabel})`, amount: finalAmount, causeLabel, email: email.trim() });
  }

  if (success) {
    const shownAmount = success.amount ?? finalAmount;
    return (
      <div className="bg-card border border-card-border rounded-3xl p-8 md:p-12 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
        <h3 className="font-serif text-3xl font-bold text-primary">Thank You!</h3>
        <p className="text-muted-foreground font-medium">Your donation request has been received.</p>
        <div className="bg-muted/40 border border-border rounded-2xl p-5 text-sm space-y-2 text-left">
          <div className="flex justify-between gap-2"><span className="text-muted-foreground">Amount</span><span className="font-semibold text-primary">${shownAmount.toLocaleString()} USD</span></div>
          <div className="flex justify-between gap-2"><span className="text-muted-foreground">Designation</span><span className="font-medium">{success.causeLabel ?? causeLabel}</span></div>
          <div className="flex justify-between gap-2"><span className="text-muted-foreground">Method</span><span className="font-medium">{success.methodLabel}</span></div>
          <div className="flex flex-wrap justify-between gap-2 pt-1 border-t border-border"><span className="text-muted-foreground">Reference</span><span className="font-mono font-semibold text-primary break-all text-right">{success.reference}</span></div>
        </div>
        <p className="text-sm text-muted-foreground">We will contact you at <strong>{success.email ?? email}</strong> with the next steps.</p>
        <button type="button" onClick={() => { setSuccess(null); setFirstName(""); setLastName(""); setEmail(""); setMessage(""); setAmount(50); setCustomAmount(""); setError(""); }} className="text-primary underline text-sm">Make another donation</button>
      </div>
    );
  }

  return (
    <form className="min-w-0 bg-card border border-card-border rounded-3xl p-6 md:p-10 shadow-xl space-y-8" onSubmit={(event) => event.preventDefault()}>
      <div className="space-y-4"><h3 className="font-serif text-2xl font-bold text-primary">Choose Amount</h3><div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PRESET_AMOUNTS.map((preset) => <Button key={preset} type="button" variant={amount === preset ? "default" : "outline"} className={`h-14 text-lg font-semibold rounded-xl ${amount === preset ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-primary border-primary/20 hover:border-primary"}`} onClick={() => { setAmount(preset); setCustomAmount(""); setError(""); }}>${preset}</Button>)}
        <div className="relative col-span-2 md:col-span-1"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span><Input type="number" min={50} step="0.01" placeholder="Custom" value={customAmount} onChange={(event) => { setCustomAmount(event.target.value); setAmount("custom"); setError(""); }} className={`h-14 pl-8 text-lg font-semibold rounded-xl ${amount === "custom" ? "border-primary ring-1 ring-primary" : "border-primary/20"}`} /></div>
      </div></div>
      <div className="space-y-4"><h3 className="font-serif text-2xl font-bold text-primary">Designate Your Gift</h3><RadioGroup value={cause} onValueChange={setCause} className="grid grid-cols-1 md:grid-cols-3 gap-3">{causes.map((item) => <div key={item.id}><RadioGroupItem value={item.id} id={`cause-${item.id}`} className="peer sr-only" /><Label htmlFor={`cause-${item.id}`} className="flex items-center justify-center p-4 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">{item.label}</Label></div>)}</RadioGroup></div>
      <div className="space-y-4"><h3 className="font-serif text-2xl font-bold text-primary">Your Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="firstName">First Name {!anonymous && <span className="text-red-500">*</span>}</Label><Input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Jane" disabled={anonymous} className="h-12 rounded-xl" /></div>
        <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Doe" disabled={anonymous} className="h-12 rounded-xl" /></div>
        <div className="space-y-2 md:col-span-2"><Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="jane@example.com" className="h-12 rounded-xl" /></div>
        <div className="space-y-2 md:col-span-2"><Label htmlFor="message">Message (Optional)</Label><Textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Leave a note with your donation..." className="rounded-xl min-h-[80px]" /></div>
        <div className="md:col-span-2"><button type="button" onClick={() => setAnonymous((value) => !value)} className="flex items-center gap-3 cursor-pointer select-none"><span className={`w-10 h-6 rounded-full relative shrink-0 ${anonymous ? "bg-primary" : "bg-gray-200"}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${anonymous ? "translate-x-5" : "translate-x-1"}`} /></span><span className="text-sm text-foreground font-medium">Donate anonymously</span></button></div>
      </div></div>
      <div className="space-y-4"><h3 className="font-serif text-2xl font-bold text-primary">Payment Method</h3><div className="grid grid-cols-1 gap-3">
        {[{ id: "bank" as PayMethod, label: "Bank Transfer", tag: "Email Request" }, { id: "card" as PayMethod, label: "Credit / Debit Card", tag: "Email Request" }, { id: "crypto" as PayMethod, label: "Cryptocurrency", tag: "", enabled: selectedCryptoConfigured }].filter((item) => item.enabled !== false).map((item) => <button key={item.id} type="button" onClick={() => { setMethod(item.id); setError(""); }} className={`min-w-0 flex items-center justify-between gap-3 p-4 border rounded-xl ${method === item.id ? "border-primary bg-primary/5" : "border-primary/20 hover:border-primary/40"}`}><span className="min-w-0 font-medium text-primary text-sm break-words text-left">{item.label}</span><span className="shrink-0 flex items-center gap-2"><span className="bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full text-xs font-semibold">{item.tag || ""}</span><span className={`w-4 h-4 rounded-full border-2 ${method === item.id ? "border-primary bg-primary" : "border-gray-300"}`} /></span></button>)}
      </div>
      {method === "bank" && <div className="bg-muted/40 border border-border rounded-xl p-5"><p className="text-sm text-muted-foreground">We arrange bank donations by email. Click the button below and your email app will open with the donation details.</p></div>}
      {method === "card" && <div className="bg-muted/40 border border-border rounded-xl p-4"><p className="text-sm text-muted-foreground">Card payments are being set up. Click the button below to email your donation request.</p></div>}
      {method === "crypto" && <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-4"><p className="text-sm text-muted-foreground">Select a configured cryptocurrency wallet below.</p>{CRYPTO_OPTIONS.map(({ key, label }) => { const address = settings.cryptoWallets?.[key] ?? ""; return <button key={key} type="button" onClick={() => setCryptoCoin(key)} disabled={!address} className={`w-full flex items-center justify-between p-3 border rounded-lg text-sm ${cryptoCoin === key && address ? "border-primary bg-primary/5 text-primary" : "border-border"}`}><span>{label}</span>{!address ? <span className="text-xs text-muted-foreground">Coming soon</span> : cryptoCoin === key ? <span className="text-xs text-primary font-semibold">Selected</span> : null}</button>; })}{selectedCryptoAddress && <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-3"><p className="font-mono text-xs flex-1 break-all">{selectedCryptoAddress}</p><button type="button" onClick={() => { try { navigator.clipboard?.writeText(selectedCryptoAddress).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); }).catch(() => setError("Unable to copy the wallet address.")); } catch { setError("Unable to copy the wallet address."); } }} className="shrink-0 p-1.5">{copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}</button></div>}</div>}
      </div>
      {error && <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
      <Button size="lg" type="button" disabled={loading} onClick={() => { setError(""); if (method === "bank") { openDonationEmailRequest("bank_transfer"); return; } if (method === "card") { openDonationEmailRequest("card"); return; } handleCryptoConfirm(); }} className="w-full min-w-0 min-h-16 h-auto py-3 px-3 whitespace-normal break-words text-base sm:text-xl leading-tight rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md disabled:opacity-60">{loading ? "Preparing…" : method === "bank" ? `Email donation request for $${finalAmount.toLocaleString()}` : method === "card" ? `Email card donation request for $${finalAmount.toLocaleString()}` : "I've Sent My Crypto Donation"}</Button>
      <div className="text-center"><p className="text-xs text-muted-foreground">Your email app will open for card and bank donation requests.</p></div>
    </form>
  );
}
