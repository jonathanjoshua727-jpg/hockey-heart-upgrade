const FLW_BASE = "https://api.flutterwave.com/v3";

export function getFlutterwaveSecret(): string {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");
  return key;
}

/** Secret hash the admin sets in the Flutterwave dashboard for webhooks. */
export function getFlutterwaveWebhookHash(): string | null {
  return process.env.FLUTTERWAVE_SECRET_HASH || null;
}

interface FlwEnvelope<T> {
  status?: string; // "success" | "error"
  message?: string;
  data?: T;
}

// ── Create a hosted payment link (Flutterwave Standard) ─────────────────────
export async function flutterwaveCreatePayment(input: {
  txRef: string;
  amountUsd: number; // major units
  email: string;
  name: string;
  redirectUrl: string;
}): Promise<{ ok: boolean; link?: string; error?: string }> {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getFlutterwaveSecret()}`,
    },
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amountUsd.toFixed(2),
      currency: "USD",
      redirect_url: input.redirectUrl,
      customer: { email: input.email, name: input.name },
      customizations: {
        title: "Hockey Heart Initiative",
        description: "Secure donation checkout",
      },
    }),
  });
  const body = (await res.json().catch(() => null)) as FlwEnvelope<{
    link?: string;
  }> | null;
  if (!res.ok || body?.status !== "success" || !body.data?.link) {
    return {
      ok: false,
      error: body?.message ?? `Payment initialization failed (${res.status})`,
    };
  }
  return { ok: true, link: body.data.link };
}

// ── Verify a transaction by our reference (tx_ref) ──────────────────────────
export interface FlutterwaveVerifyData {
  id: number;
  tx_ref: string;
  status: string; // "successful" | "failed" | "pending" | ...
  amount: number; // major units
  currency: string;
  payment_type: string | null;
  processor_response: string | null;
  created_at: string | null;
  customer?: { email?: string };
}

export async function flutterwaveVerifyByTxRef(
  txRef: string,
): Promise<{
  ok: boolean;
  data?: FlutterwaveVerifyData;
  notFound?: boolean;
  error?: string;
}> {
  const res = await fetch(
    `${FLW_BASE}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
    { headers: { Authorization: `Bearer ${getFlutterwaveSecret()}` } },
  );
  const body = (await res.json().catch(() => null)) as FlwEnvelope<FlutterwaveVerifyData> | null;
  if (res.status === 404 || (body?.status === "error" && /no transaction/i.test(body?.message ?? ""))) {
    // No charge attempt exists for this reference (abandoned before paying).
    return { ok: false, notFound: true, error: body?.message ?? "Transaction not found" };
  }
  if (!res.ok || body?.status !== "success" || !body.data) {
    return { ok: false, error: body?.message ?? `Verification failed (${res.status})` };
  }
  return { ok: true, data: body.data };
}

// ── Verify that a refund actually exists for a transaction ─────────────────
// Never trust a webhook payload: confirm against Flutterwave's refunds API,
// matched to the specific transaction id.
export async function flutterwaveFindCompletedRefund(txId: number): Promise<{
  ok: boolean;
  refunded?: boolean;
  error?: string;
}> {
  const res = await fetch(`${FLW_BASE}/refunds?tx_id=${encodeURIComponent(String(txId))}`, {
    headers: { Authorization: `Bearer ${getFlutterwaveSecret()}` },
  });
  const body = (await res.json().catch(() => null)) as FlwEnvelope<
    { tx_id?: number; status?: string }[]
  > | null;
  if (!res.ok || body?.status !== "success" || !Array.isArray(body.data)) {
    return { ok: false, error: body?.message ?? `Refund lookup failed (${res.status})` };
  }
  // Filter client-side too, in case the API ignores the tx_id query param.
  const refunded = body.data.some(
    (r) => Number(r.tx_id) === txId && /^(completed|successful|processed)$/i.test(r.status ?? ""),
  );
  return { ok: true, refunded };
}
