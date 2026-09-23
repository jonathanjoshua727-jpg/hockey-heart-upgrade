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
import {
  fetchPublicPaymentSettings,
  initializeDonation,
  verifyDonation,
} from "@/lib/donationApi";
const PRESET_AMOUNTS = [50, 100, 250, 500];
const PENDING_KEY = "hhi_pending_donation";
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
      cardEnabled: true,
      bankTransferEnabled: false,
      bankTransferProviderName:
        cached.bankTransferProviderName || "Flutterwave",
      cryptoEnabled: false,
      cryptoWallets: {
        ...EMPTY_CRYPTO_WALLETS,
      },
    };
  } catch {
    return {
      paystackPublicKey: "",
      paystackEnabled: false,
      cardEnabled: true,
      bankTransferEnabled: false,
      bankTransferProviderName: "Flutterwave",
      cryptoEnabled: false,
      cryptoWallets: {
        ...EMPTY_CRYPTO_WALLETS,
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
function safeTrackClick(
  page: string,
  action: string,
  source: string,
  target: string,
) {
  try {
    trackClick(page, action, source, target);
  } catch {
    // Analytics must never prevent the donation page from rendering.
  }
}
export function DonationForm() {
  const [settings, setSettings] = useState<PaymentSettings>(
    getSafeInitialSettings,
  );
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
  const finalAmount =
    amount === "custom"
      ? Number.parseFloat(customAmount || "0")
      : amount;
  const causeLabel =
    causes.find((item) => item.id === cause)?.label ??
    "Where Needed Most";
  const selectedCryptoAddress =
    settings.cryptoWallets?.[cryptoCoin] ?? "";
  const bankConfigured = settings.bankTransferEnabled;
  const cardConfigured = settings.cardEnabled;
  const cryptoConfigured = settings.cryptoEnabled;
  const selectedMethodConfigured =
    (method === "bank" && bankConfigured) ||
    (method === "card" && cardConfigured) ||
    (method === "crypto" && cryptoConfigured);
  useEffect(() => {
    safeTrackClick(
      "Donation Page",
      "donation_page_visit",
      window.location.pathname,
      window.location.pathname,
    );
  }, []);
  useEffect(() => {
    let active = true;
    fetchPublicPaymentSettings()
      .then((serverSettings) => {
        if (!active) return;
        setSettings((current) => ({
          ...current,
          ...serverSettings,
          bankDetails:
            serverSettings.bankDetails ?? current.bankDetails,
        }));
      })
      .catch(() => {
        // Keep the safe local defaults.
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const selectedEnabled =
      (method === "bank" && settings.bankTransferEnabled) ||
      (method === "card" && settings.cardEnabled) ||
      (method === "crypto" && settings.cryptoEnabled);
    if (selectedEnabled) return;
    if (settings.cardEnabled) {
      setMethod("card");
    } else if (settings.bankTransferEnabled) {
      setMethod("bank");
    } else if (settings.cryptoEnabled) {
      setMethod("crypto");
    }
  }, [
    method,
    settings.bankTransferEnabled,
    settings.cardEnabled,
    settings.cryptoEnabled,
  ]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txRef = params.get("tx_ref");
    if (!txRef) return;
    let pending: PendingDonation | null = null;
    try {
      pending = JSON.parse(
        sessionStorage.getItem(PENDING_KEY) ?? "null",
      );
    } catch {
      pending = null;
    }
    sessionStorage.removeItem(PENDING_KEY);
    window.history.replaceState(
      {},
      "",
      window.location.pathname,
    );
    setLoading(true);
    verifyDonation(txRef)
      .then((result) => {
        setLoading(false);
        if (result.verified && result.donation) {
          safeTrackClick(
            "Donation Completed",
            "donation_success",
            "/donate",
            window.location.pathname,
          );
          setSuccess({
            reference: result.donation.reference,
            methodLabel:
              pending?.methodLabel ?? "Secure Checkout",
            amount: result.donation.amount,
            causeLabel: result.donation.causeLabel,
            email: pending?.email,
          });
        } else {
          safeTrackClick(
            "Verification Failed",
            "donation_failed",
            "/donate",
            window.location.pathname,
          );
          setError(
            result.error ??
              "We couldn't complete your donation. No successful donation was recorded. Please try again.",
          );
        }
      })
      .catch(() => {
        setLoading(false);
        safeTrackClick(
          "Verification Failed",
          "donation_failed",
          "/donate",
          window.location.pathname,
        );
        setError(
          "We couldn't complete your donation. No successful donation was recorded. Please try again.",
        );
      });
  }, []);
  function copyAddress() {
    if (!selectedCryptoAddress) return;
    try {
      navigator.clipboard
        ?.writeText(selectedCryptoAddress)
        .then(() => {
          setCopied(true);
          window.setTimeout(
            () => setCopied(false),
            2000,
          );
        })
        .catch(() => {
          setError(
            "Unable to copy the wallet address. Please copy it manually.",
          );
        });
    } catch {
      setError(
        "Unable to copy the wallet address. Please copy it manually.",
      );
    }
  }
  function validate(): string {
    if (
      !Number.isFinite(finalAmount) ||
      finalAmount < 50
    ) {
      return "Minimum donation is $50 USD.";
    }
    if (!email.trim() || !email.includes("@")) {
      return "Please enter a valid email address.";
    }
    if (!anonymous && !firstName.trim()) {
      return "Please enter your first name.";
    }
    return "";
  }
  function recordTransaction(
    reference: string,
    payMethod: string,
    status: Transaction["status"],
  ) {
    const tx: Transaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      amount: finalAmount,
      currency: "USD",
      method: payMethod,
      status,
      donorName: anonymous
        ? "Anonymous"
        : `${firstName.trim()} ${lastName.trim()}`.trim(),
      donorEmail: email.trim(),
      cause: causeLabel,
      reference,
      anonymous,
      notes: message.trim() || undefined,
    };
    try {
      saveTransaction(tx);
    } catch {
      // Local transaction storage must not prevent the donor flow.
    }
  }
  async function handleGatewayDonation(
    payMethod: "bank_transfer" | "card",
  ) {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    const methodLabel =
      payMethod === "bank_transfer"
        ? "Bank Transfer"
        : "Credit/Debit Card";
    setLoading(true);
    setError("");
    try {
      const init = await initializeDonation({
        amount: finalAmount,
        causeId: cause,
        causeLabel,
        donorName: anonymous
          ? "Anonymous"
          : `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim(),
        anonymous,
        message: message.trim() || undefined,
        method: payMethod,
        redirectPath: window.location.pathname,
      });
      const pending: PendingDonation = {
        reference: init.reference,
        amount: finalAmount,
        causeLabel,
        email: email.trim(),
        methodLabel,
      };
      try {
        sessionStorage.setItem(
          PENDING_KEY,
          JSON.stringify(pending),
        );
      } catch {
        // The server reference remains authoritative.
      }
      safeTrackClick(
        `Checkout Started (${methodLabel})`,
        "checkout_start",
        "/donate",
        window.location.pathname,
      );
      window.location.assign(init.paymentLink);
    } catch (e) {
      setLoading(false);
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Failed to start your donation. Please try again or contact us.",
      );
    }
  }
  function handleBankTransfer() {
    if (!bankConfigured) {
      setError(
        "Bank transfer payments are not yet configured. Please contact us to complete your donation.",
      );
      return;
    }
    return handleGatewayDonation("bank_transfer");
  }
  function handleCard() {
    if (!cardConfigured) {
      setError(
        "Card payments are not yet configured. Please contact us.",
      );
      return;
    }
    return handleGatewayDonation("card");
  }
  function handleCryptoConfirm() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!selectedCryptoAddress) {
      setError(
        "Selected cryptocurrency wallet address is not configured yet.",
      );
      return;
    }
    const ref = randomRef();
    const coinLabel =
      CRYPTO_OPTIONS.find(
        (item) => item.key === cryptoCoin,
      )?.label ?? cryptoCoin;
    recordTransaction(
      ref,
      `crypto_${cryptoCoin}`,
      "pending",
    );
    setSuccess({
      reference: ref,
      methodLabel: `Cryptocurrency (${coinLabel})`,
      amount: finalAmount,
      causeLabel,
      email: email.trim(),
    });
  }
  if (success) {
    const donationDate = new Date().toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    );
    const shownAmount =
      success.amount ?? finalAmount;
    const shownCause =
      success.causeLabel ?? causeLabel;
    const shownEmail =
      success.email ?? email;
    return (
      <div className="bg-card border border-card-border rounded-3xl p-8 md:p-12 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <div className="space-y-3">
          <h3 className="font-serif text-3xl font-bold text-primary">
            Thank You!
          </h3>
          <p className="text-muted-foreground text-base font-medium">
            Your donation to Hockey Heart Initiative has
            been received.
          </p>
        </div>
        <div className="bg-muted/40 border border-border rounded-2xl p-5 text-sm space-y-2 text-left">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">
              Amount
            </span>
            <span className="font-semibold text-primary">
              ${shownAmount.toLocaleString()} USD
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">
              Designation
            </span>
            <span className="font-medium">
              {shownCause}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">
              Method
            </span>
            <span className="font-medium">
              {success.methodLabel}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">
              Date
            </span>
            <span className="font-medium">
              {donationDate}
            </span>
          </div>
          <div className="flex flex-wrap justify-between gap-2 pt-1 border-t border-border">
            <span className="text-muted-foreground">
              Reference
            </span>
            <span className="font-mono font-semibold text-primary break-all text-right">
              {success.reference}
            </span>
          </div>
        </div>
        <div className="text-left text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            Thank you for believing in the power of hockey
            to create opportunity, build confidence, and
            bring communities together. Your generosity helps
            Hockey Heart Initiative turn that belief into
            meaningful support for players, families, coaches,
            and communities. Every contribution matters, and
            we are deeply grateful for your support.
          </p>
          <p className="font-semibold text-foreground">
            Thank you for being part of the Hockey Heart
            Initiative community.
          </p>
        </div>
        {method === "crypto" && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
            Your donation is recorded as{" "}
            <strong>pending</strong>. Once we verify your
            crypto transfer, your donation will be confirmed.
            Please keep your reference number.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {shownEmail && (
            <>
              A confirmation will be sent to{" "}
              <strong>{shownEmail}</strong>.
              <br />
            </>
          )}
          Hockey Heart Initiative — empowering youth
          through hockey.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(null);
            setFirstName("");
            setLastName("");
            setEmail("");
            setMessage("");
            setAmount(50);
            setCustomAmount("");
            setError("");
          }}
          className="text-primary underline text-sm"
        >
          Make another donation
        </button>
      </div>
    );
  }
  return (
    <form
      className="min-w-0 bg-card border border-card-border rounded-3xl p-6 md:p-10 shadow-xl space-y-8"
      onSubmit={(event) => event.preventDefault()}
    >
      {/* Amount */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-primary">
          Choose Amount
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PRESET_AMOUNTS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={
                amount === preset
                  ? "default"
                  : "outline"
              }
              className={`h-14 text-lg font-semibold rounded-xl ${
                amount === preset
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-primary border-primary/20 hover:border-primary"
              }`}
              onClick={() => {
                setAmount(preset);
                setCustomAmount("");
                setError("");
              }}
            >
              ${preset}
            </Button>
          ))}
          <div className="relative col-span-2 md:col-span-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
              $
            </span>
            <Input
              type="number"
              min={50}
              step="0.01"
              placeholder="Custom"
              value={customAmount}
              onChange={(event) => {
                setCustomAmount(event.target.value);
                setAmount("custom");
                setError("");
              }}
              className={`h-14 pl-8 text-lg font-semibold rounded-xl transition-colors ${
                amount === "custom"
                  ? "border-primary ring-1 ring-primary"
                  : "border-primary/20"
              }`}
            />
          </div>
        </div>
      </div>
      {/* Cause */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-primary">
          Designate Your Gift
        </h3>
        <RadioGroup
          value={cause}
          onValueChange={setCause}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {causes.map((item) => (
            <div key={item.id}>
              <RadioGroupItem
                value={item.id}
                id={`cause-${item.id}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`cause-${item.id}`}
                className="flex items-center justify-center p-4 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors font-medium text-primary text-center"
              >
                {item.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      {/* Donor Details */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-primary">
          Your Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name{" "}
              {!anonymous && (
                <span className="text-red-500">
                  *
                </span>
              )}
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(event) =>
                setFirstName(event.target.value)
              }
              placeholder="Jane"
              disabled={anonymous}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
              placeholder="Doe"
              disabled={anonymous}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">
              Email Address{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="jane@example.com"
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="message">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Leave a note with your donation..."
              className="rounded-xl min-h-[80px]"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() =>
                setAnonymous((value) => !value)
              }
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <span
                className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                  anonymous
                    ? "bg-primary"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    anonymous
                      ? "translate-x-5"
                      : "translate-x-1"
                  }`}
                />
              </span>
              <span className="text-sm text-foreground font-medium">
                Donate anonymously
              </span>
            </button>
          </div>
        </div>
      </div>
      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-primary">
          Payment Method
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              id: "bank" as PayMethod,
              label: settings.bankTransferProviderName
                ? `Bank Transfer via ${settings.bankTransferProviderName}`
                : "Bank Transfer",
              tag: "Recommended",
              enabled: bankConfigured,
            },
            {
              id: "card" as PayMethod,
              label: "Credit / Debit Card",
              tag: "",
              enabled: cardConfigured,
            },
            {
              id: "crypto" as PayMethod,
              label: "Cryptocurrency",
              tag: "",
              enabled: cryptoConfigured,
            },
          ]
            .filter((item) => item.enabled)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMethod(item.id);
                  setError("");
                }}
                className={`min-w-0 flex items-center justify-between gap-3 p-4 border rounded-xl transition-colors ${
                  method === item.id
                    ? "border-primary bg-primary/5"
                    : "border-primary/20 hover:border-primary/40"
                }`}
              >
                <span className="min-w-0 font-medium text-primary text-sm break-words text-left">
                  {item.label}
                </span>
                <div className="shrink-0 flex items-center gap-2">
                  {item.tag && (
                    <span className="bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full text-xs font-semibold">
                      {item.tag}
                    </span>
                  )}
                  <span
                    className={`w-4 h-4 rounded-full border-2 ${
                      method === item.id
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  />
                </div>
              </button>
            ))}
        </div>
        {/* Bank Transfer */}
        {method === "bank" &&
          bankConfigured && (
            <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Bank transfer via{" "}
                {settings.bankTransferProviderName ||
                  "our payment provider"}
              </p>
              <p className="text-sm text-muted-foreground">
                After clicking the button below, you'll be
                taken to a secure checkout page showing the
                transfer options available in your region.
                Your donation is confirmed automatically once
                the payment is received.
              </p>
            </div>
          )}
        {/* Cryptocurrency */}
        {method === "crypto" && (
          <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-4">
            {cryptoConfigured ? (
              <>
                <p className="text-sm font-semibold text-foreground">
                  Select Cryptocurrency
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {CRYPTO_OPTIONS.map(
                    ({ key, label }) => {
                      const address =
                        settings.cryptoWallets?.[
                          key
                        ] ?? "";
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setCryptoCoin(key)
                          }
                          disabled={!address}
                          className={`flex items-center justify-between p-3 border rounded-lg text-sm transition-colors ${
                            cryptoCoin === key &&
                            address
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-foreground hover:border-primary/30"
                          } ${
                            !address
                              ? "opacity-40 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <span className="font-medium">
                            {label}
                          </span>
                          {!address && (
                            <span className="text-xs text-muted-foreground">
                              Coming soon
                            </span>
                          )}
                          {address &&
                            cryptoCoin === key && (
                              <span className="text-xs text-primary font-semibold">
                                Selected
                              </span>
                            )}
                        </button>
                      );
                    },
                  )}
                </div>
                {selectedCryptoAddress && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Send to this address:
                    </p>
                    <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-3">
                      <p className="font-mono text-xs flex-1 break-all">
                        {selectedCryptoAddress}
                      </p>
                      <button
                        type="button"
                        onClick={copyAddress}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Copy address"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-amber-600">
                      ⚠ Always double-check the address
                      before sending. Crypto transactions are
                      irreversible.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Cryptocurrency wallets are being configured.
                Please contact{" "}
                <a
                  href="mailto:contact@hockeyheartinitiative.com"
                  className="text-primary underline"
                >
                  contact@hockeyheartinitiative.com
                </a>{" "}
                to donate via crypto.
              </p>
            )}
          </div>
        )}
        {method === "card" &&
          !cardConfigured && (
            <div className="bg-muted/40 border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                Card payments are being configured. Please
                contact us at{" "}
                <a
                  href="mailto:contact@hockeyheartinitiative.com"
                  className="text-primary underline"
                >
                  contact@hockeyheartinitiative.com
                </a>
                .
              </p>
            </div>
          )}
      </div>
      {/* Error */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm"
        >
          {error}
        </div>
      )}
      {/* CTA */}
      <Button
        size="lg"
        type="button"
        disabled={
          loading || !selectedMethodConfigured
        }
        onClick={() => {
          setError("");
          if (!selectedMethodConfigured) {
            setError(
              "This payment method is not currently available.",
            );
            return;
          }
          if (method === "bank") {
            handleBankTransfer();
            return;
          }
          if (method === "card") {
            handleCard();
            return;
          }
          if (method === "crypto") {
            handleCryptoConfirm();
          }
        }}
        className="w-full min-w-0 min-h-16 h-auto py-3 px-3 whitespace-normal break-words text-base sm:text-xl leading-tight rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md disabled:opacity-60"
      >
        {loading
          ? "Opening payment window…"
          : method === "bank"
            ? `Donate $${finalAmount.toLocaleString()} via Bank Transfer`
            : method === "card"
              ? `Pay $${finalAmount.toLocaleString()} by Card`
              : `I've Sent My Crypto Donation`}
      </Button>
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Secure, encrypted donation checkout
        </p>
      </div>
    </form>
  );
}
